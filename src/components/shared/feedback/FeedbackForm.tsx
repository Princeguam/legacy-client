import { notify } from '@/lib/notify'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { MessageSquare } from 'lucide-react'
import { API_MESSAGES, COMMON_LABELS, FEEDBACK_CATEGORIES, FEEDBACK_MESSAGES } from '@/constants/strings'
import { FEEDBACK_SUBJECT_MAX_LENGTH } from '@/constants/values'
import type { AuthSession } from '@/types/Auth'
import type { CreateFeedbackRequest, FeedbackDraft, FeedbackFormErrors } from '@/types/feedback'
import { isFeedbackCategory, validateFeedback } from '@/lib/feedback'
import { isValidSession } from '@/services/authService'
import { createFeedback } from '@/services/userService'
import { Button } from '@/components/shared/Button'
import { Card } from '@/components/shared/ui/card'
import { Input } from '@/components/shared/ui/input'
import { Textarea } from '@/components/shared/ui/textarea'
import { NativeSelect } from '@/components/shared/ui/native-select'
import { Alert } from '@/components/shared/ui/alert'
import { FormField } from '@/components/shared/form-field/form-field'
import './feedback.css'

const emptyDraft = (): FeedbackDraft => ({ category: FEEDBACK_CATEGORIES.suggestion, subject: '', message: '' })

export function FeedbackForm({ session, preview }: { session: AuthSession | null; preview: boolean }) {
    const [draft, setDraft] = useState(emptyDraft)
    const [errors, setErrors] = useState<FeedbackFormErrors>({})
    const [saving, setSaving] = useState(false)
    const [previewDraft, setPreviewDraft] = useState<FeedbackDraft | null>(null)
    const submitting = useRef(false)
    const controllerRef = useRef<AbortController | null>(null)
    const formRef = useRef<HTMLFormElement>(null)
    useEffect(() => () => controllerRef.current?.abort(), [])

    function update(key: keyof FeedbackDraft, value: string) {
        setDraft(current => ({ ...current, [key]: value }))
        setErrors(current => ({ ...current, [key]: undefined }))
    }

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (submitting.current) return
        const nextErrors = validateFeedback(draft)
        setErrors(nextErrors)
        if (Object.keys(nextErrors).length) {
            formRef.current?.querySelector<HTMLElement>('[name="' + Object.keys(nextErrors)[0] + '"]')?.focus()
            return
        }
        if (preview) { setPreviewDraft({ ...draft }); return }
        if (!isValidSession(session)) { notify.error(API_MESSAGES.signInRequired); return }
        if (!isFeedbackCategory(draft.category)) return
        const input: CreateFeedbackRequest = { ...draft, category: draft.category }
        submitting.current = true
        setSaving(true)
        const controller = new AbortController()
        controllerRef.current = controller
        try {
            await createFeedback(session.accessToken, session.user, input, controller.signal)
            if (controller.signal.aborted || !isValidSession(session)) return
            notify.success(FEEDBACK_MESSAGES.saved)
            setDraft(emptyDraft())
        } catch (error) {
            if (!controller.signal.aborted) {
                notify.error(error, FEEDBACK_MESSAGES.saveFailed)
            }
        } finally {
            submitting.current = false
            if (!controller.signal.aborted) setSaving(false)
        }
    }

    return <div className="dashboard-columns feedback-page">
        <Card className="product-card">
            <h2 className="type-title">Share your feedback</h2>
            <p className="type-label">{preview ? 'Preview drafts stay on this screen and clear when you leave. Nothing is sent.' : 'Send an idea or report an issue to your cooperative administrators.'}</p>
            <form ref={formRef} onSubmit={submit} noValidate className="settings-form" aria-busy={saving || undefined}>
                <FormField label={COMMON_LABELS.category} error={errors.category}>{bindings => <NativeSelect {...bindings} name="category" required disabled={saving} value={draft.category} onChange={event => update('category', event.target.value)}>{Object.values(FEEDBACK_CATEGORIES).map(category => <option key={category} value={category}>{category}</option>)}</NativeSelect>}</FormField>
                <FormField label={COMMON_LABELS.subject} error={errors.subject}>{bindings => <Input {...bindings} name="subject" required maxLength={FEEDBACK_SUBJECT_MAX_LENGTH} readOnly={saving} value={draft.subject} onChange={event => update('subject', event.target.value)} placeholder="What would you like to share?" />}</FormField>
                <FormField label={FEEDBACK_MESSAGES.message} error={errors.message} hint="Include details that help explain your idea or issue.">{bindings => <Textarea {...bindings} name="message" required rows={5} readOnly={saving} value={draft.message} onChange={event => update('message', event.target.value)} />}</FormField>
                <div><Button type="submit" loading={saving} primaryAction><MessageSquare aria-hidden="true" />{preview ? 'Save feedback draft' : FEEDBACK_MESSAGES.submit}</Button></div>
                {saving && <p role="status" className="type-label">Sending feedback. Please wait.</p>}
            </form>
        </Card>
        <div className="page-stack">
            {previewDraft && <Card className="product-card"><Alert tone="info" title="Preview draft saved" role="status">This draft has not been sent.</Alert><h2 className="type-title">{previewDraft.subject}</h2><p className="type-label">{previewDraft.category}</p><p className="feedback-message">{previewDraft.message}</p></Card>}
            <Card className="product-card"><h2 className="type-title">Useful feedback</h2><p>Describe what happened, what you expected, and any steps that help us reproduce an issue.</p><p className="type-label">Contact your administrator directly for urgent account or payment assistance.</p></Card>
        </div>
    </div>
}
