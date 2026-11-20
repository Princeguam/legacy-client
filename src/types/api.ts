/** The backend omits undefined fields when serializing its response to JSON. */
export type ApiSuccessResponse<T = unknown> = {
  success: true
  message: string
  data: T
  errorCode?: undefined
}

export type ApiErrorResponse = {
  success: false
  message: string
  data?: undefined
  errorCode: number
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse

export type PaginatedApiData<T> = {
  page: number
  count: number
  totalPages: number
  totalItems: number
  pageData: T[]
}

export type ApiRequestMessages = { unavailable: string; connection: string; timeout: string }
export type ApiRequestOptions = {
  method?: 'GET' | 'POST' | 'PUT'
  accessToken?: string
  body?: unknown
  formData?: FormData
  timeoutMs?: number
  signal?: AbortSignal
  messages?: ApiRequestMessages
}
