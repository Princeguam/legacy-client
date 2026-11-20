import type { FEEDBACK_CATEGORIES, FEEDBACK_SORTS } from '@/constants/strings'
import type { ApiResponse, PaginatedApiData } from '@/types/api'
import type { ApiUser } from '@/types/user'

export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[keyof typeof FEEDBACK_CATEGORIES]
export type FeedbackSort = keyof typeof FEEDBACK_SORTS
export type FeedbackDraft = { category: string; subject: string; message: string }
export type FeedbackFormErrors = Partial<Record<keyof FeedbackDraft, string>>
export type CreateFeedbackRequest = Omit<FeedbackDraft, 'category'> & { category: FeedbackCategory }
export type ApiFeedback = {
    id: number
    userId: number
    subject: string | null
    message: string
    category: FeedbackCategory
    created: string
    updated: string
    member: Pick<ApiUser, 'id' | 'firstName' | 'lastName' | 'email' | 'role'>
}
export type FeedbackResponse = ApiResponse<ApiFeedback>
export type FeedbackListData = PaginatedApiData<ApiFeedback>
export type FeedbackListResponse = ApiResponse<FeedbackListData>
export type FeedbackListQuery = { page: number; sort: FeedbackSort }
