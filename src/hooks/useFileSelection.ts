import { useEffect, useRef, useState } from 'react'
import type { AuthSession } from '@/types/Auth'
import type { FileSelection, UploadKind } from '@/types/upload'
import { selectedFileError } from '@/lib/uploads'
import { uploadFile } from '@/services/utilService'
import { isValidSession } from '@/services/authService'
import { API_MESSAGES, UPLOAD_MESSAGES } from '@/constants/strings'
import { notify } from '@/lib/notify'

/** Selecting an accepted signed-in file uploads immediately; form writes reuse its URL. */
export function useFileSelection(kind: UploadKind, session: AuthSession | null, preview = false): FileSelection {
    const [file, setFile] = useState<File | null>(null)
    const [error, setError] = useState('')
    const [uploadError, setUploadError] = useState('')
    const [uploading, setUploading] = useState(false)
    const [uploaded, setUploaded] = useState<{ url: string; scope: string } | null>(null)
    const currentFile = useRef<File | null>(null)
    const controller = useRef<AbortController | null>(null)
    const scope = preview ? 'preview' : (session?.accessToken ?? '') + ':' + session?.user.id
    useEffect(() => () => { controller.current?.abort(); currentFile.current = null }, [scope])

    async function startUpload(next: File) {
        if (preview) return
        if (!isValidSession(session)) { setUploadError(API_MESSAGES.signInRequired); return }
        const request = new AbortController()
        controller.current = request
        setUploadError('')
        setUploading(true)
        try {
            const result = await uploadFile(session, next, request.signal)
            if (!request.signal.aborted && currentFile.current === next && isValidSession(session)) setUploaded({ url: result.fileUrl, scope })
        } catch (failure) {
            if (!request.signal.aborted && currentFile.current === next) {
                const message = failure instanceof Error ? failure.message : UPLOAD_MESSAGES.failed
                setUploadError(message)
                notify.error(failure, UPLOAD_MESSAGES.failed)
            }
        } finally {
            if (!request.signal.aborted && currentFile.current === next) setUploading(false)
            if (controller.current === request) controller.current = null
        }
    }

    function select(next: File) {
        const problem = selectedFileError(next, kind)
        setError(problem ?? '')
        if (problem) return
        controller.current?.abort()
        currentFile.current = next
        setFile(next)
        setUploaded(null)
        setUploadError('')
        setUploading(false)
        void startUpload(next)
    }
    function remove() {
        controller.current?.abort()
        currentFile.current = null
        setFile(null)
        setError('')
        setUploaded(null)
        setUploadError('')
        setUploading(false)
    }
    function retryUpload() {
        const next = currentFile.current
        if (!next || uploading || preview || controller.current && !controller.current.signal.aborted) return
        controller.current?.abort()
        void startUpload(next)
    }
    const uploadedUrl = uploaded?.scope === scope ? uploaded.url : undefined
    return { file, error, uploadError, uploading, uploadedUrl, ready: !error && !uploadError && !uploading && (!file || preview || !!uploadedUrl), select, retryUpload, remove, clearError: () => setError('') }
}
