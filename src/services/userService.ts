import {
    API_MESSAGES,
    API_PATHS,
    APP_CURRENCY,
    PAYMENT_MESSAGES,
    PAYMENT_STATUS,
    PAYMENT_TYPE,
    SERVER_MEMBER_ROLE,
} from "@/constants/strings";
import type { AuthUser } from "@/types/Auth";
import type { ProfileResponseData, UpdateProfileRequest } from "@/types/user";
import { ApiError, requestApi } from "./apiClient";
import { isApiUser, selectApiUser, toAuthUser } from "./apiUser";
import { PAGE_SIZES } from "@/constants/values";
import type { NotificationsResponseData } from "@/types/notification";
import {
    parseReadAcknowledgement,
    parseUnreadNotifications,
    requireNotificationId,
} from "./notificationResponse";
import type { ApiFeedback, CreateFeedbackRequest } from "@/types/feedback";
import { validateFeedback } from "@/lib/feedback";
import { parseCreatedFeedback } from "./feedbackResponse";
import { assertProfileSaved, profileBody } from "./profileRequest";
import type {
    ApiTransaction,
    CreateTransactionRequest,
    TransactionListData,
    TransactionListQuery,
} from "@/types/transaction";
import { parseTransaction, parseTransactionList } from "./transactionResponse";
import { transactionCreateBody, transactionSearch } from "./transactionRequest";
import { validAccountId } from "@/lib/transactions";
import type { UpdatePasswordRequest } from '@/types/settings';
import { PASSWORD_MESSAGES } from '@/constants/strings';

function parseProfile(
    data: unknown,
    account: Pick<AuthUser, "id" | "role">,
): ProfileResponseData {
    if (!isApiUser(data) || data.isDeleted)
        throw new ApiError(API_MESSAGES.unavailable);
    if (
        String(data.id) !== String(account.id) ||
        toAuthUser(data).role !== account.role
    ) {
        throw new ApiError(API_MESSAGES.accountMismatch);
    }
    return selectApiUser(data);
}

function requireToken(accessToken: string) {
    if (!accessToken.trim()) throw new ApiError(API_MESSAGES.signInRequired);
}

/** Both roles change their own password; never persist or trim credentials. */
export async function updatePassword(accessToken: string, input: UpdatePasswordRequest, signal?: AbortSignal): Promise<null> {
    requireToken(accessToken);
    if (typeof input.oldPassword !== 'string' || !input.oldPassword) throw new ApiError(PASSWORD_MESSAGES.currentRequired);
    if (typeof input.newPassword !== 'string' || !input.newPassword) throw new ApiError(PASSWORD_MESSAGES.newRequired);
    if (input.oldPassword === input.newPassword) throw new ApiError(PASSWORD_MESSAGES.different);
    return requestApi(API_PATHS.password, { method: 'PUT', accessToken, body: { oldPassword: input.oldPassword, newPassword: input.newPassword }, signal }, data => {
        if (data !== null) throw new ApiError(API_MESSAGES.unavailable);
        return null;
    });
}

export async function getTransactions(
    accessToken: string,
    account: Pick<AuthUser, "id">,
    query: TransactionListQuery,
    signal?: AbortSignal,
): Promise<TransactionListData> {
    requireToken(accessToken);
    return requestApi(
        `${API_PATHS.transactions}/all?${transactionSearch(query)}`,
        { accessToken, signal },
        (data) => parseTransactionList(data, query.page, account),
    );
}

export async function getTransaction(
    accessToken: string,
    account: Pick<AuthUser, "id">,
    transactionId: number,
    signal?: AbortSignal,
): Promise<ApiTransaction> {
    requireToken(accessToken);
    if (!validAccountId(transactionId))
        throw new ApiError(PAYMENT_MESSAGES.wrongRecord);
    return requestApi(
        `${API_PATHS.transactions}/${transactionId}`,
        { accessToken, signal },
        (data) => {
            const record = parseTransaction(data, account);
            if (record.id !== transactionId)
                throw new ApiError(PAYMENT_MESSAGES.wrongRecord);
            return record;
        },
    );
}

/** Receipt upload must supply attachmentUrl before the member form can submit. */
export async function createTransaction(
    accessToken: string,
    account: Pick<AuthUser, "id">,
    input: CreateTransactionRequest,
    signal?: AbortSignal,
): Promise<ApiTransaction> {
    requireToken(accessToken);
    const body = transactionCreateBody(input) as CreateTransactionRequest;
    return requestApi(
        API_PATHS.transactions,
        { method: "POST", accessToken, body, signal },
        (data) => {
            const record = parseTransaction(data, account);
            if (
                record.amount !== body.amount ||
                record.bankAccountId !== body.bankAccountId ||
                record.currency !== APP_CURRENCY ||
                record.source !== SERVER_MEMBER_ROLE ||
                record.status !== PAYMENT_STATUS.pending ||
                record.type !== PAYMENT_TYPE.deposit ||
                record.period.slice(0, 7) !== body.period.slice(0, 7) ||
                record.attachmentUrl !== body.attachmentUrl
            )
                throw new ApiError(API_MESSAGES.unavailable);
            return record;
        },
    );
}

/** Shared feedback submission for signed-in members and administrators. */
export async function createFeedback(
    accessToken: string,
    account: Pick<AuthUser, "id" | "role">,
    input: CreateFeedbackRequest,
    signal?: AbortSignal,
): Promise<ApiFeedback> {
    requireToken(accessToken);
    const errors = validateFeedback(input);
    if (Object.keys(errors).length)
        throw new ApiError(Object.values(errors)[0]!);
    const body: CreateFeedbackRequest = {
        category: input.category,
        subject: input.subject.trim(),
        message: input.message.trim(),
    };
    return requestApi(
        API_PATHS.feedback,
        { method: "POST", accessToken, body, signal },
        (data) => parseCreatedFeedback(data, account),
    );
}

/** The backend's own-profile endpoint is shared by User and Admin accounts. */
export async function getProfile(
    accessToken: string,
    account: Pick<AuthUser, "id" | "role">,
    signal?: AbortSignal,
): Promise<ProfileResponseData> {
    requireToken(accessToken);
    return requestApi(API_PATHS.profile, { accessToken, signal }, (data) =>
        parseProfile(data, account),
    );
}

export async function updateProfile(
    accessToken: string,
    account: Pick<AuthUser, "id" | "role">,
    input: UpdateProfileRequest,
    signal?: AbortSignal,
): Promise<ProfileResponseData> {
    requireToken(accessToken);
    const body = profileBody(input);
    return requestApi(
        API_PATHS.profile,
        { method: "PUT", accessToken, body, signal },
        (data) => { const profile = parseProfile(data, account); assertProfileSaved(profile, body); return profile },
    );
}

/** Both roles use their own account's notification router. */
export async function getUnreadNotifications(
    accessToken: string,
    accountId: string | number,
    page = 1,
    signal?: AbortSignal,
): Promise<NotificationsResponseData> {
    requireToken(accessToken);
    if (!Number.isSafeInteger(page) || page < 1)
        throw new ApiError(API_MESSAGES.unavailable);
    const query = new URLSearchParams({
        page: String(page),
        count: String(PAGE_SIZES.notifications),
        unRead: "true",
        by: "created",
        order: "desc",
    });
    return requestApi(
        `${API_PATHS.notifications}/all?${query}`,
        { accessToken, signal },
        (data) => parseUnreadNotifications(data, accountId, page),
    );
}

export async function markNotificationRead(
    accessToken: string,
    notificationId: number,
    signal?: AbortSignal,
): Promise<null> {
    requireToken(accessToken);
    requireNotificationId(notificationId);
    return requestApi(
        `${API_PATHS.notifications}/${notificationId}?isRead=true`,
        { method: "PUT", accessToken, signal },
        parseReadAcknowledgement,
    );
}

export async function markAllNotificationsRead(
    accessToken: string,
    signal?: AbortSignal,
): Promise<null> {
    requireToken(accessToken);
    return requestApi(
        `${API_PATHS.notifications}/all`,
        { method: "PUT", accessToken, signal },
        parseReadAcknowledgement,
    );
}
