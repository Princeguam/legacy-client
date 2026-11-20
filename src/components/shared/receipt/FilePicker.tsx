import { useRef } from 'react'
import { AVATAR_ACCEPT, RECEIPT_ACCEPT } from '@/constants/strings'
import type { FileSelection, UploadKind } from '@/types/upload'
import { FormField } from '@/components/shared/form-field/form-field'
import { Input } from '@/components/shared/ui/input'
import { Button } from '@/components/shared/Button'
import { Receipt } from './Receipt'
import { UploadStatus } from './UploadStatus'

export function FilePicker({ selection, kind, busy = false, required = false, preview = false, error }: { selection: FileSelection; kind: UploadKind; busy?: boolean; required?: boolean; preview?: boolean; error?: string }) {
    const inputRef = useRef<HTMLInputElement>(null)
    const hint = `${kind === 'avatar' ? 'One JPEG or PNG' : 'One PDF, JPEG or PNG'}, up to 10 MB. ${preview ? 'Preview only; no file is uploaded.' : 'Uploaded immediately when selected.'}`
    return <div className="settings-form"><FormField label={kind === 'avatar' ? 'Avatar' : 'Attach receipt'} hint={hint} error={selection.error || selection.uploadError || error}>{bindings => <Input {...bindings} ref={inputRef} name={kind} type="file" required={required && !selection.file} disabled={busy} accept={kind === 'avatar' ? AVATAR_ACCEPT : RECEIPT_ACCEPT} onChange={event => {
        const file = event.target.files?.[0]
        if (file) selection.select(file)
        event.target.value = ''
    }} />}</FormField>
        {selection.error && <Button variant="ghost" disabled={busy} onClick={() => { selection.clearError(); inputRef.current?.focus() }}>Dismiss file error{selection.file ? ' and keep current file' : ''}</Button>}
        {selection.file && <Receipt file={selection.file} kind={kind} onRemove={busy ? undefined : () => { selection.remove(); inputRef.current?.focus() }} />}
        <UploadStatus selection={selection} kind={kind} busy={busy} preview={preview} />
    </div>
}
