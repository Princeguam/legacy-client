import type { ApiResponse } from '@/types/api'
import { isRecord } from '@/lib/is-record'

/** Validate the shared envelope before any service interprets endpoint data. */
export function isApiResponse(value: unknown): value is ApiResponse {
  if (!isRecord(value) || typeof value.message !== 'string') return false
  if (value.success === true) return 'data' in value && value.errorCode === undefined
  return value.success === false && value.data === undefined &&
    typeof value.errorCode === 'number' && Number.isSafeInteger(value.errorCode)
}
