import { API_MESSAGES, FEEDBACK_MESSAGES, SERVER_MEMBER_ROLE, USER_ROLES } from '@/constants/strings'
import { API_ID_MAX, PAGE_SIZES } from '@/constants/values'
import { isFeedbackCategory } from '@/lib/feedback'
import { isRecord } from '@/lib/is-record'
import type { ApiFeedback, FeedbackListData } from '@/types/feedback'
import type { AuthUser } from '@/types/Auth'
import { ApiError } from './apiClient'
import { isApiUser } from './apiUser'

const validId = (value: unknown): value is number => typeof value === 'number' && Number.isInteger(value) && value > 0 && value <= API_ID_MAX
const validCount = (value: unknown): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
const validDate = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0 && Number.isFinite(Date.parse(value))

export function requireFeedbackId(value: number) {
    if (!validId(value)) throw new ApiError(API_MESSAGES.unavailable)
}

export function parseFeedback(data: unknown): ApiFeedback {
    if (!isRecord(data) || !validId(data.id) || !validId(data.userId) ||
        !(data.subject === null || typeof data.subject === 'string') || typeof data.message !== 'string' ||
        !isFeedbackCategory(data.category) || !validDate(data.created) || !validDate(data.updated) ||
        !isApiUser(data.member) || data.member.id !== data.userId) throw new ApiError(API_MESSAGES.unavailable)
    const { id, firstName, lastName, email, role } = data.member
    return { id: data.id, userId: data.userId, subject: data.subject, message: data.message, category: data.category, created: data.created, updated: data.updated, member: { id, firstName, lastName, email, role } }
}

export function parseCreatedFeedback(data: unknown, account: Pick<AuthUser, 'id' | 'role'>): ApiFeedback {
    const feedback = parseFeedback(data)
    const role = feedback.member.role === SERVER_MEMBER_ROLE ? USER_ROLES.user : feedback.member.role
    if (String(feedback.userId) !== String(account.id) || role !== account.role) throw new ApiError(FEEDBACK_MESSAGES.wrongAccount)
    return feedback
}

export function parseFeedbackList(data: unknown, page: number): FeedbackListData {
    if (!isRecord(data) || data.page !== page || !validCount(data.count) || !validCount(data.totalItems) ||
        !validCount(data.totalPages) || !Array.isArray(data.pageData) || data.count !== data.pageData.length ||
        data.count > PAGE_SIZES.feedback || data.totalItems < data.count ||
        data.totalPages !== Math.ceil(data.totalItems / PAGE_SIZES.feedback) ||
        data.count !== Math.min(PAGE_SIZES.feedback, Math.max(0, data.totalItems - (page - 1) * PAGE_SIZES.feedback))) throw new ApiError(API_MESSAGES.unavailable)
    const pageData = data.pageData.map(parseFeedback)
    if (new Set(pageData.map(record => record.id)).size !== pageData.length) throw new ApiError(API_MESSAGES.unavailable)
    return { page, count: data.count, totalPages: data.totalPages, totalItems: data.totalItems, pageData }
}
