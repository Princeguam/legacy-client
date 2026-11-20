import {
    API_MESSAGES,
    NOTIFICATION_MESSAGES,
    NOTIFICATION_TYPES,
} from "@/constants/strings";
import { API_ID_MAX, PAGE_SIZES } from "@/constants/values";
import { isRecord } from "@/lib/is-record";
import type {
    ApiNotification,
    NotificationsResponseData,
} from "@/types/notification";
import { ApiError } from "./apiClient";

const validId = (value: unknown): value is number =>
    typeof value === "number" &&
    Number.isInteger(value) &&
    value > 0 &&
    value <= API_ID_MAX;
const validCount = (value: unknown): value is number =>
    typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
const validDate = (value: unknown): value is string =>
    typeof value === "string" && Number.isFinite(new Date(value).getTime());

function isNotification(value: unknown): value is ApiNotification {
    return (
        isRecord(value) &&
        validId(value.id) &&
        validId(value.userId) &&
        Object.values(NOTIFICATION_TYPES).some((type) => type === value.type) &&
        typeof value.title === "string" &&
        typeof value.body === "string" &&
        (value.link === null || typeof value.link === "string") &&
        (value.readAt === null || validDate(value.readAt)) &&
        validDate(value.created)
    );
}

export function parseUnreadNotifications(
    data: unknown,
    accountId: string | number,
    page: number,
): NotificationsResponseData {
    if (
        !isRecord(data) ||
        data.page !== page ||
        !validCount(data.count) ||
        !validCount(data.totalItems) ||
        !validCount(data.totalPages) ||
        !Array.isArray(data.pageData) ||
        !data.pageData.every(isNotification) ||
        data.count !== data.pageData.length ||
        data.count > PAGE_SIZES.notifications ||
        data.totalItems < data.count ||
        data.totalPages !==
            Math.ceil(data.totalItems / PAGE_SIZES.notifications) ||
        new Set(data.pageData.map((item) => item.id)).size !== data.count ||
        data.pageData.some((item) => item.readAt !== null)
    ) {
        throw new ApiError(API_MESSAGES.unavailable);
    }
    if (data.pageData.some((item) => String(item.userId) !== String(accountId)))
        throw new ApiError(NOTIFICATION_MESSAGES.wrongAccount);
    return {
        page,
        count: data.count,
        totalItems: data.totalItems,
        totalPages: data.totalPages,
        pageData: data.pageData.map((item) => ({
            id: item.id,
            userId: item.userId,
            type: item.type,
            title: item.title,
            body: item.body,
            link: item.link,
            readAt: item.readAt,
            created: item.created,
        })),
    };
}

export function parseReadAcknowledgement(data: unknown): null {
    if (data !== null) throw new ApiError(API_MESSAGES.unavailable);
    return null;
}

export function requireNotificationId(id: number) {
    if (!validId(id)) throw new ApiError(API_MESSAGES.unavailable);
}
