import { useEffect, useRef } from 'react'
import { AVATAR_ACCEPT } from '@/constants/strings'
import type { AuthUser } from '@/types/Auth'
import type { FileSelection } from '@/types/upload'
import { Button } from '@/components/shared/Button'
import { FormField } from '@/components/shared/form-field/form-field'
import { AccountAvatar } from './account-avatar'
import { UploadStatus } from '@/components/shared/receipt/UploadStatus'
import './avatar-picker.css'

function SelectedAvatar({ file }: { file: File }) {
    const imageRef = useRef<HTMLImageElement>(null)
    useEffect(() => {
        const url = URL.createObjectURL(file)
        if (imageRef.current) imageRef.current.src = url
        return () => URL.revokeObjectURL(url)
    }, [file])
    return <img ref={imageRef} className="avatar account-avatar-photo" alt={`Selected avatar: ${file.name}`} />
}

export function AvatarPicker({ selection, user = null, busy = false, preview = false, error }: { selection: FileSelection; user?: AuthUser | null; busy?: boolean; preview?: boolean; error?: string }) {
    const inputRef = useRef<HTMLInputElement>(null)
    return <div className="avatar-picker"><FormField label="Avatar" hint={`Click the circle to choose a JPEG or PNG, up to 10 MB. ${preview ? 'Preview only; no file is uploaded.' : 'Uploaded immediately when selected.'}`} error={selection.error || selection.uploadError || error}>{bindings => <>
        <input {...bindings} ref={inputRef} name="avatar" type="file" accept={AVATAR_ACCEPT} className="sr-only" tabIndex={-1} disabled={busy} onChange={event => {
            const file = event.target.files?.[0]
            if (file) selection.select(file)
            event.target.value = ''
        }} />
        <button type="button" className="avatar-picker-trigger" disabled={busy} aria-label={user ? 'Change avatar' : 'Choose avatar'} aria-describedby={bindings['aria-describedby']} aria-invalid={bindings['aria-invalid']} onClick={() => inputRef.current?.click()}>
            {selection.file ? <SelectedAvatar file={selection.file} /> : <AccountAvatar user={user} />}
        </button>
    </>}</FormField>
        {selection.file && <p className="type-caption">{selection.file.name}</p>}
        {selection.error && <Button variant="ghost" disabled={busy} onClick={selection.clearError}>Dismiss file error{selection.file ? ' and keep current file' : ''}</Button>}
        {selection.file && <Button variant="ghost" disabled={busy} onClick={selection.remove}>Remove selected avatar</Button>}
        <UploadStatus selection={selection} kind="avatar" busy={busy} preview={preview} />
    </div>
}
