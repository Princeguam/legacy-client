import { APP_LOCALE, FEEDBACK_CATEGORIES, FEEDBACK_MESSAGES, FEEDBACK_SORTS, LEDGER_TIME_ZONE } from '@/constants/strings'
import { FEEDBACK_SUBJECT_MAX_LENGTH } from '@/constants/values'
import type { FeedbackCategory, FeedbackDraft, FeedbackFormErrors, FeedbackListData, FeedbackListQuery, FeedbackSort } from '@/types/feedback'

export function isFeedbackCategory(value: unknown): value is FeedbackCategory {
    return Object.values(FEEDBACK_CATEGORIES).some(category => category === value)
}

export function validateFeedback(input: FeedbackDraft): FeedbackFormErrors {
    const errors: FeedbackFormErrors = {}
    if (!isFeedbackCategory(input.category)) errors.category = FEEDBACK_MESSAGES.categoryRequired
    if (!input.subject.trim()) errors.subject = FEEDBACK_MESSAGES.subjectRequired
    else if (input.subject.length > FEEDBACK_SUBJECT_MAX_LENGTH) errors.subject = FEEDBACK_MESSAGES.subjectLength
    if (!input.message.trim()) errors.message = FEEDBACK_MESSAGES.messageRequired
    return errors
}

export function feedbackQuery(params: URLSearchParams): FeedbackListQuery {
    const requestedPage = Number(params.get('page') ?? 1)
    const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1
    const sort = params.get('sort')
    return { page, sort: sort && Object.hasOwn(FEEDBACK_SORTS, sort) ? sort as FeedbackSort : 'newest' }
}

export function formatFeedbackDate(value: string) {
    return new Intl.DateTimeFormat(APP_LOCALE, { dateStyle: 'medium', timeStyle: 'short', timeZone: LEDGER_TIME_ZONE }).format(new Date(value)) + ` ${LEDGER_TIME_ZONE}`
}

export function getPreviewFeedback(query: FeedbackListQuery): FeedbackListData {
    return { page: query.page, count: 0, totalItems: 0, totalPages: 0, pageData: [] }
}
