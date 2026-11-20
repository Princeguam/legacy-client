import { MIME_TYPES, UPLOAD_MESSAGES } from '@/constants/strings'
import { UPLOAD_MAX_BYTES, RECEIPT_EXTENSIONS } from '@/constants/values'
import type { UploadKind } from '@/types/upload'
import { receiptError } from './transaction-drafts'

export function uploadDestination(value: string): string | null {
    try {
        const url = new URL(value)
        return url.protocol === 'https:' && !url.username && !url.password ? value : null
    } catch { return null }
}

export function selectedFileError(file: File, kind: UploadKind): string | undefined {
    if (kind === 'receipt') return receiptError(file)
    if (![MIME_TYPES.jpeg, MIME_TYPES.png].some(type => type === file.type) || !RECEIPT_EXTENSIONS[file.type]?.test(file.name)) return UPLOAD_MESSAGES.avatarType
    if (!file.size) return UPLOAD_MESSAGES.empty
    if (file.size > UPLOAD_MAX_BYTES) return UPLOAD_MESSAGES.size
}
