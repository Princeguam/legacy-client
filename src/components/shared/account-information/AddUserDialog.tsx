import { notify } from '@/lib/notify'
import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { COMMON_LABELS, MEMBER_CONTACT_LABELS, MEMBER_MESSAGES, ROLE_LABELS } from '@/constants/strings'
import type { ApiUser, NewMemberFormValues } from '@/types/user'
import type { AuthSession } from '@/types/Auth'
import { Button } from '@/components/shared/Button'
import { Dialog } from '@/components/shared/ui/dialog'
import { Alert } from '@/components/shared/ui/alert'
import { AvatarPicker } from '@/components/shared/account-avatar/AvatarPicker'
import { useFileSelection } from '@/hooks/useFileSelection'
import { profileFormValues } from '@/lib/profile'
import { validateNewMember } from '@/lib/members'
import { createMember } from '@/services/adminService'
import { isValidSession } from '@/services/authService'
import { PersonalFields } from './PersonalFields'

export function AddUserDialog({ session, onClose, onCreated }: { session: AuthSession | null; onClose: () => void; onCreated: (user: ApiUser) => void }) {
    const [input, setInput] = useState<NewMemberFormValues>(() => profileFormValues())
    const [errors, setErrors] = useState<ReturnType<typeof validateNewMember>>({})
    const [review, setReview] = useState(false)
    const [saving, setSaving] = useState(false)
      const [stage, setStage] = useState('')
    const avatar = useFileSelection('avatar', session, !session)
    const formRef = useRef<HTMLFormElement>(null)
    const submittingRef = useRef(false)
    const controllerRef = useRef<AbortController | null>(null)
    useEffect(() => () => controllerRef.current?.abort(), [])

    function prepare(event: FormEvent) {
        event.preventDefault()
        if (!avatar.ready) return
        const next = { ...validateNewMember(input), ...(avatar.error ? { passport: avatar.error } : {}) }
        setErrors(next)

        if (Object.keys(next).length) requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]:not(input[type="file"])')?.focus())
        else setReview(true)
    }

    async function submit() {
        if (submittingRef.current || !session || !review || !avatar.ready) return
        submittingRef.current = true
        setSaving(true);
        const controller = new AbortController()
        controllerRef.current = controller
        try {
            const passport = avatar.uploadedUrl
            if (controller.signal.aborted || !isValidSession(session)) return
            setStage('Creating user…')
            const user = await createMember(session, { ...input, ...(passport ? { passport } : {}) }, controller.signal)
            if (!controller.signal.aborted && isValidSession(session)) onCreated(user)
        } catch (error) { if (!controller.signal.aborted) notify.error(error, 'Unable to create the user. Please try again.') }
        finally { submittingRef.current = false; if (!controller.signal.aborted) setSaving(false) }
    }

    return <Dialog size="wide" open onOpenChange={open => { if (!open) onClose() }} title={MEMBER_MESSAGES.add} description="Add a cooperative member with their personal and contact details." busy={saving} footer={review ? <Button loading={saving} disabled={!session || !avatar.ready} onClick={submit}>Create user</Button> : <Button type="submit" form="add-user-form" disabled={!avatar.ready}>{MEMBER_MESSAGES.review}</Button>}>
        {!session && <Alert title="Layout preview">Sign in as an administrator to create a user. These details are not submitted.</Alert>}
        {saving && <p role="status">{stage}</p>}
        {review ? <><dl className="detail-list">{Object.entries(input).filter(([, value]) => value.trim()).map(([field, value]) => <div key={field}><dt>{documentLabel(field)}</dt><dd>{value.trim()}</dd></div>)}<div><dt>Account role</dt><dd>{ROLE_LABELS.user}</dd></div><div><dt>Avatar</dt><dd>{avatar.file?.name || COMMON_LABELS.notProvided}</dd></div></dl><Button variant="outline" disabled={saving} onClick={() => setReview(false)}>Back to details</Button></> : <form ref={formRef} id="add-user-form" className="settings-form" noValidate onSubmit={prepare}>
            <AvatarPicker selection={avatar} preview={!session} error={errors.passport} />
            <PersonalFields prefix="new-user" input={input} errors={errors} autoComplete={false} onChange={(field, value) => setInput(current => ({ ...current, [field]: value }))} />
            <p className="type-label">New accounts are created as members. A temporary password is assigned to each account.</p>
        </form>}
    </Dialog>
}

function documentLabel(field: string): string {
    return ({ firstName: COMMON_LABELS.firstName, middleName: COMMON_LABELS.middleName, lastName: COMMON_LABELS.lastName, email: COMMON_LABELS.emailAddress, phoneNo: COMMON_LABELS.phoneNumber, dob: COMMON_LABELS.dob, address: COMMON_LABELS.address, state: COMMON_LABELS.state, lga: COMMON_LABELS.lga, gender: COMMON_LABELS.gender, ...MEMBER_CONTACT_LABELS } as Record<string, string>)[field] ?? field
}
