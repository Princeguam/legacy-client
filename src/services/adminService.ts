import { API_MESSAGES, API_PATHS, APP_CURRENCY, FEEDBACK_MESSAGES, FEEDBACK_SORTS, MEMBER_MESSAGES, MEMBER_SORTS, PAYMENT_MESSAGES, PAYMENT_STATUS, PAYMENT_TYPE, USER_ROLES } from '@/constants/strings'
import { PAGE_SIZES } from '@/constants/values'
import type { AuthSession } from '@/types/Auth'
import type { ApiFeedback, FeedbackListData, FeedbackListQuery } from '@/types/feedback'
import { ApiError, requestApi } from './apiClient'
import { isValidSession } from './authService'
import { parseFeedback, parseFeedbackList, requireFeedbackId } from './feedbackResponse'
import type { AdminCreateTransactionRequest, ApiTransaction, TransactionListData, TransactionListQuery } from '@/types/transaction'
import { parseTransaction, parseTransactionList } from './transactionResponse'
import { transactionCreateBody, transactionSearch } from './transactionRequest'
import { validAccountId } from '@/lib/transactions'
import type { ApiUser, CreateMemberRequest, MemberListData, MemberListQuery, MemberOption } from '@/types/user'
import { parseMember, parseMemberList, parseMemberOptions } from './adminUserResponse'
import { assertProfileSaved, profileBody } from './profileRequest'
import { SERVER_MEMBER_ROLE } from '@/constants/strings'
import { BANK_ACCOUNT_MESSAGES, BANK_ACCOUNT_SORTS } from '@/constants/strings'
import type { BankAccount, BankAccountListData, BankAccountListQuery, CreateBankAccountRequest } from '@/types/bank-account'
import { parseBankAccount, parseBankAccountList } from './bankAccountResponse'
import { validateBankAccount } from '@/lib/bank-accounts'

function requireAdmin(session: AuthSession) {
    if (!isValidSession(session) || session.user.role !== USER_ROLES.admin) throw new ApiError(API_MESSAGES.signInRequired)
}

export async function getMemberOptions(session: AuthSession, signal?: AbortSignal): Promise<MemberOption[]> {
    requireAdmin(session)
    return requestApi(API_PATHS.memberOptions, { accessToken: session.accessToken, signal }, parseMemberOptions)
}

export async function getBankAccounts(session: AuthSession, query: BankAccountListQuery, signal?: AbortSignal): Promise<BankAccountListData> {
    requireAdmin(session)
    if (!Number.isSafeInteger(query.page) || query.page < 1 || !Object.hasOwn(BANK_ACCOUNT_SORTS, query.sort) || typeof query.isActive !== 'boolean') throw new ApiError(API_MESSAGES.unavailable)
    const { by, order } = BANK_ACCOUNT_SORTS[query.sort]
    const params = new URLSearchParams({ page: String(query.page), count: String(PAGE_SIZES.bankAccounts), by, order, isActive: String(query.isActive) })
    return requestApi(`${API_PATHS.adminBankAccounts}/all?${params}`, { accessToken: session.accessToken, signal }, data => parseBankAccountList(data, query.page, query.isActive))
}

export async function createBankAccount(session: AuthSession, input: CreateBankAccountRequest, signal?: AbortSignal): Promise<BankAccount> {
    requireAdmin(session)
    const errors = validateBankAccount(input)
    if (Object.keys(errors).length) throw new ApiError(Object.values(errors)[0]!)
    const body: CreateBankAccountRequest = { bankName: input.bankName.trim(), accountName: input.accountName.trim(), accountNumber: input.accountNumber.trim() }
    return requestApi(API_PATHS.adminBankAccounts, { method: 'POST', accessToken: session.accessToken, body, signal }, data => {
        const bank = parseBankAccount(data)
        if (!bank.isActive || bank.bankName !== body.bankName || bank.accountName !== body.accountName || bank.accountNumber !== body.accountNumber) throw new ApiError(BANK_ACCOUNT_MESSAGES.unconfirmed)
        return bank
    })
}

function memberPath(memberId: number): string {
    if (!validAccountId(memberId)) throw new ApiError(MEMBER_MESSAGES.wrongRecord)
    return `${API_PATHS.adminUsers}/${memberId}`
}

export async function getMembers(session: AuthSession, query: MemberListQuery, signal?: AbortSignal): Promise<MemberListData> {
    requireAdmin(session)
    if (!Number.isSafeInteger(query.page) || query.page < 1 || !Object.hasOwn(MEMBER_SORTS, query.sort) || typeof query.search !== 'string' || typeof query.isActive !== 'boolean') throw new ApiError(API_MESSAGES.unavailable)
    const { by, order } = MEMBER_SORTS[query.sort]
    // Missing isActive currently means false on the server; always send an explicit filter.
    const params = new URLSearchParams({ page: String(query.page), count: String(PAGE_SIZES.members), by, order, isActive: String(query.isActive) })
    if (query.search.trim()) params.set('search', query.search.trim())
    return requestApi(`${API_PATHS.adminUsers}/all?${params}`, { accessToken: session.accessToken, signal }, data => parseMemberList(data, query.page))
}

export async function getMember(session: AuthSession, memberId: number, signal?: AbortSignal): Promise<ApiUser> {
    requireAdmin(session)
    return requestApi(memberPath(memberId), { accessToken: session.accessToken, signal }, data => parseMember(data, memberId))
}

export async function createMember(session: AuthSession, input: CreateMemberRequest, signal?: AbortSignal): Promise<ApiUser> {
    requireAdmin(session)
    const body = profileBody(input)
    return requestApi(API_PATHS.adminUsers, { method: 'POST', accessToken: session.accessToken, body, signal }, data => {
        const user = parseMember(data)
        if (user.role !== SERVER_MEMBER_ROLE || user.isDeleted || String(user.id) === String(session.user.id)) throw new ApiError(API_MESSAGES.unavailable)
        assertProfileSaved(user, body)
        return user
    })
}

export async function getMemberTransactions(session: AuthSession, memberId: number, query: TransactionListQuery, signal?: AbortSignal): Promise<TransactionListData> {
    requireAdmin(session)
    return requestApi(`${memberPath(memberId)}/transaction/all?${transactionSearch(query, true)}`, { accessToken: session.accessToken, signal }, data => parseTransactionList(data, query.page, { id: memberId }))
}

export async function getMemberTransaction(session: AuthSession, memberId: number, id: number, signal?: AbortSignal): Promise<ApiTransaction> {
    requireAdmin(session)
    if (!validAccountId(id)) throw new ApiError(PAYMENT_MESSAGES.wrongRecord)
    return requestApi(`${memberPath(memberId)}/transaction/${id}`, { accessToken: session.accessToken, signal }, data => {
        const record = parseTransaction(data, { id: memberId })
        if (record.id !== id) throw new ApiError(PAYMENT_MESSAGES.wrongRecord)
        return record
    })
}

export async function getTransactions(session: AuthSession, query: TransactionListQuery, signal?: AbortSignal): Promise<TransactionListData> {
    requireAdmin(session)
    return requestApi(`${API_PATHS.adminTransactions}/all?${transactionSearch(query, true)}`, { accessToken: session.accessToken, signal }, data => parseTransactionList(data, query.page))
}

export async function getTransaction(session: AuthSession, id: number, signal?: AbortSignal): Promise<ApiTransaction> {
    requireAdmin(session)
    if (!validAccountId(id)) throw new ApiError(PAYMENT_MESSAGES.wrongRecord)
    return requestApi(`${API_PATHS.adminTransactions}/${id}`, { accessToken: session.accessToken, signal }, data => {
        const record = parseTransaction(data)
        if (record.id !== id) throw new ApiError(PAYMENT_MESSAGES.wrongRecord)
        return record
    })
}

export async function createTransaction(session: AuthSession, input: AdminCreateTransactionRequest, signal?: AbortSignal): Promise<ApiTransaction> {
    requireAdmin(session)
    const body = transactionCreateBody(input, true) as AdminCreateTransactionRequest
    return requestApi(API_PATHS.adminTransactions, { method: 'POST', accessToken: session.accessToken, body, signal }, data => {
        const record = parseTransaction(data)
        if (record.userId !== body.memberId || record.amount !== body.amount || record.bankAccountId !== body.bankAccountId || record.currency !== APP_CURRENCY || record.source !== USER_ROLES.admin || (body.attachmentUrl !== undefined && record.attachmentUrl !== body.attachmentUrl) || record.period.slice(0, 7) !== body.period.slice(0, 7) || record.status !== PAYMENT_STATUS.confirmed || record.type !== PAYMENT_TYPE.deposit || record.reviewedById !== Number(session.user.id) || !record.reviewedAt) throw new ApiError(API_MESSAGES.unavailable)
        return record
    })
}

export async function reviewTransaction(session: AuthSession, record: ApiTransaction, accepted: boolean, signal?: AbortSignal): Promise<ApiTransaction> {
    return reviewPayment(session, record, accepted, signal)
}

export async function reviewMemberTransaction(session: AuthSession, memberId: number, record: ApiTransaction, accepted: boolean, signal?: AbortSignal): Promise<ApiTransaction> {
    requireAdmin(session)
    memberPath(memberId)
    if (record.userId !== memberId) throw new ApiError(PAYMENT_MESSAGES.wrongAccount)
    return reviewPayment(session, record, accepted, signal, memberId)
}

async function reviewPayment(session: AuthSession, record: ApiTransaction, accepted: boolean, signal?: AbortSignal, memberId?: number): Promise<ApiTransaction> {
    requireAdmin(session)
    if (typeof accepted !== 'boolean') throw new ApiError(PAYMENT_MESSAGES.reviewFailed)
    if (!validAccountId(record.id) || record.status !== PAYMENT_STATUS.pending) throw new ApiError('Only pending payments can be reviewed.')
    // Recheck on every confirmation, including after an uncertain failed write.
    const current = memberId === undefined ? await getTransaction(session, record.id, signal) : await getMemberTransaction(session, memberId, record.id, signal)
    if (current.status !== PAYMENT_STATUS.pending || current.userId !== record.userId || current.amount !== record.amount || current.currency !== record.currency || current.bankAccountId !== record.bankAccountId || current.period !== record.period || current.attachmentUrl !== record.attachmentUrl) throw new ApiError('This payment has changed. Close and reopen its details before reviewing it.')
    const path = memberId === undefined ? `${API_PATHS.adminTransactions}/${record.id}` : `${memberPath(memberId)}/transaction/${record.id}`
    return requestApi(path, { method: 'PUT', accessToken: session.accessToken, body: { isAccepted: accepted }, signal }, data => {
        const result = parseTransaction(data, memberId === undefined ? undefined : { id: memberId })
        if (result.id !== record.id || result.userId !== record.userId || result.amount !== record.amount || result.currency !== record.currency || result.bankAccountId !== record.bankAccountId || result.period !== record.period || result.status !== (accepted ? PAYMENT_STATUS.confirmed : PAYMENT_STATUS.rejected) || result.reviewedById !== Number(session.user.id) || !result.reviewedAt) throw new ApiError(PAYMENT_MESSAGES.reviewFailed)
        return result
    })
}

export async function getFeedbacks(session: AuthSession, query: FeedbackListQuery, signal?: AbortSignal): Promise<FeedbackListData> {
    requireAdmin(session)
    if (!Number.isSafeInteger(query.page) || query.page < 1 || !Object.hasOwn(FEEDBACK_SORTS, query.sort)) throw new ApiError(API_MESSAGES.unavailable)
    const { by, order } = FEEDBACK_SORTS[query.sort]
    const params = new URLSearchParams({ page: String(query.page), count: String(PAGE_SIZES.feedback), by, order })
    return requestApi(`${API_PATHS.adminFeedback}/all?${params}`, { accessToken: session.accessToken, signal }, data => parseFeedbackList(data, query.page))
}

export async function getFeedback(session: AuthSession, feedbackId: number, signal?: AbortSignal): Promise<ApiFeedback> {
    requireAdmin(session)
    requireFeedbackId(feedbackId)
    return requestApi(`${API_PATHS.adminFeedback}/${feedbackId}`, { accessToken: session.accessToken, signal }, data => {
        const feedback = parseFeedback(data)
        if (feedback.id !== feedbackId) throw new ApiError(FEEDBACK_MESSAGES.wrongFeedback)
        return feedback
    })
}
