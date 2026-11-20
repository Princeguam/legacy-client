import { UPLOAD_MESSAGES } from '@/constants/strings'
import type { FileSelection, UploadKind } from '@/types/upload'
import { Button } from '@/components/shared/Button'

export function UploadStatus({ selection, kind, busy = false, preview = false }: { selection: FileSelection; kind: UploadKind; busy?: boolean; preview?: boolean }) {
    if (!selection.file || preview) return null
    return <div className="settings-form" aria-busy={selection.uploading || undefined}>
        {selection.uploading && <p className="type-label" role="status">{kind === 'avatar' ? UPLOAD_MESSAGES.avatarUploading : UPLOAD_MESSAGES.receiptUploading}</p>}
        {selection.uploadError && <div><Button variant="outline" disabled={busy || selection.uploading} onClick={selection.retryUpload}>{UPLOAD_MESSAGES.retry}</Button></div>}
        {selection.uploadedUrl && <p className="type-label" role="status">{UPLOAD_MESSAGES.uploaded}</p>}
    </div>
}
