export type UploadKind = 'avatar' | 'receipt'
export type UploadedFile = { fileUrl: string; bucket: string; key: string; mimeType: string; originalName: string }
export type FileSelection = {
    file: File | null
    error: string
    uploadError: string
    uploading: boolean
    uploadedUrl?: string
    ready: boolean
    select: (file: File) => void
    remove: () => void
    clearError: () => void
    retryUpload: () => void
}
