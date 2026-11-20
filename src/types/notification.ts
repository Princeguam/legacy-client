import type { NOTIFICATION_TYPES } from '@/constants/strings'
import type { ApiResponse, PaginatedApiData } from './api'

export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES]
export type ApiNotification = {
  id: number
  userId: number
  type: NotificationType
  title: string
  body: string
  link: string | null
  readAt: string | null
  created: string
}
export type NotificationsResponseData = PaginatedApiData<ApiNotification>
export type NotificationsResponse = ApiResponse<NotificationsResponseData>
export type NotificationReadResponse = ApiResponse<null>
