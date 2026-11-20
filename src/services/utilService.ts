import { API_MESSAGES, API_PATHS, UPLOAD_FILE_FIELD, UPLOAD_MESSAGES } from '@/constants/strings'
import { UPLOAD_MAX_BYTES, UPLOAD_TIMEOUT_MS } from '@/constants/values'
import type { AuthSession } from '@/types/Auth'
import type { UploadedFile } from '@/types/upload'
import { isRecord } from '@/lib/is-record'
import { uploadDestination } from '@/lib/uploads'
import { ApiError, requestApi } from './apiClient'
import { isValidSession } from './authService'
import type { BankAccount } from '@/types/bank-account'
import { parseBankAccountOptions } from './bankAccountResponse'

/** Shared active-account lookup for member and administrator payment entry. */
export async function getBankAccountOptions(session: AuthSession, signal?: AbortSignal): Promise<BankAccount[]> {
    if (!isValidSession(session)) throw new ApiError(API_MESSAGES.signInRequired)
    return requestApi(API_PATHS.bankAccountOptions, { accessToken: session.accessToken, signal }, parseBankAccountOptions)
}

/** Shared authenticated utility requests; the browser supplies the multipart boundary. */
export async function uploadFile(session: AuthSession, file: File, signal?: AbortSignal): Promise<UploadedFile> {
    if (!isValidSession(session)) throw new ApiError(API_MESSAGES.signInRequired)
    if (!(file instanceof File)) throw new ApiError(UPLOAD_MESSAGES.failed)
    if (!file.size) throw new ApiError(UPLOAD_MESSAGES.empty)
    if (file.size > UPLOAD_MAX_BYTES) throw new ApiError(UPLOAD_MESSAGES.size)
    const formData = new FormData()
    formData.append(UPLOAD_FILE_FIELD, file, file.name)
    return requestApi(API_PATHS.upload, { method: 'POST', accessToken: session.accessToken, formData, timeoutMs: UPLOAD_TIMEOUT_MS, signal }, data => {
        if (!Array.isArray(data) || data.length !== 1 || !isRecord(data[0])) throw new ApiError(API_MESSAGES.unavailable)
        const result = data[0]
        if (typeof result.fileUrl !== 'string' || !uploadDestination(result.fileUrl) || typeof result.bucket !== 'string' || !result.bucket.trim() ||
            typeof result.key !== 'string' || !result.key.trim() || result.mimeType !== file.type || result.originalName !== file.name) throw new ApiError(API_MESSAGES.unavailable)
        return { fileUrl: result.fileUrl, bucket: result.bucket, key: result.key, mimeType: file.type, originalName: file.name }
    })
}
