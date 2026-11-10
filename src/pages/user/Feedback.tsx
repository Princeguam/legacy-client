import { useRef, useState, type FormEvent } from 'react'
import { MessageSquare } from 'lucide-react'
import { Button } from '@/components/shared/Button'
import { Card } from '@/components/shared/ui/card'
import { Input } from '@/components/shared/ui/input'
import { Textarea } from '@/components/shared/ui/textarea'
import { NativeSelect } from '@/components/shared/ui/native-select'
import { Alert } from '@/components/shared/ui/alert'
import { FormField } from '@/components/shared/form-field/form-field'
import { PageHeader } from '@/components/shared/product/PageHeader'

type FeedbackDraft = { category: string; subject: string; message: string }
export function Feedback() {
  const [draft, setDraft] = useState<FeedbackDraft>({ category: 'Suggestion', subject: '', message: '' })
  const [errors, setErrors] = useState<Partial<Record<keyof FeedbackDraft, string>>>({})
  const [saved, setSaved] = useState<FeedbackDraft | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  function save(event: FormEvent) {
    event.preventDefault()
    const next: typeof errors = {}
    if (!draft.subject.trim()) next.subject = 'Enter a subject for your feedback.'
    if (!draft.message.trim()) next.message = 'Add your feedback message.'
    setErrors(next)
    if (Object.keys(next).length) { requestAnimationFrame(() => formRef.current?.querySelector<HTMLInputElement | HTMLTextAreaElement>('[aria-invalid="true"]')?.focus()); return }
    setSaved({ ...draft })
  }
  return <div className="page-stack"><PageHeader title="Feedback" description="Help shape the cooperative workspace. Share an idea or describe an issue." /><div className="dashboard-columns"><Card className="product-card"><h2 className="type-title">Prepare your feedback</h2><p className="type-label">Feedback delivery is not connected. Drafts stay on this screen and clear when you leave.</p><form ref={formRef} onSubmit={save} noValidate className="settings-form"><FormField label="Category">{bindings => <NativeSelect {...bindings} value={draft.category} onChange={event => setDraft({ ...draft, category: event.target.value })}><option>Suggestion</option><option>Interface issue</option><option>General feedback</option></NativeSelect>}</FormField><FormField label="Subject" error={errors.subject}>{bindings => <Input {...bindings} value={draft.subject} required maxLength={120} onChange={event => setDraft({ ...draft, subject: event.target.value })} placeholder="What would you like to share?" />}</FormField><FormField label="Message" error={errors.message} hint="Include details that will help explain your idea or issue.">{bindings => <Textarea {...bindings} value={draft.message} required rows={5} onChange={event => setDraft({ ...draft, message: event.target.value })} />}</FormField><div><Button type="submit"><MessageSquare aria-hidden="true" />Save feedback draft</Button></div></form></Card><Card className="product-card"><h2 className="type-title">A workspace that grows with us</h2><p>Tell us what would make managing contributions, members, and investments clearer.</p><p className="type-label">For account access or payment questions, contact your cooperative administrator through your usual support channel.</p></Card></div>{saved && <Card className="product-card"><Alert title="Feedback draft saved" tone="info" role="status">Your feedback has not been sent. Leaving this page clears the draft.</Alert><dl className="profile-fields"><div><dt>Category</dt><dd>{saved.category}</dd></div><div><dt>Subject</dt><dd>{saved.subject}</dd></div></dl><p className="feedback-message">{saved.message}</p><div><Button variant="ghost" onClick={() => setSaved(null)}>Discard draft</Button></div></Card>}</div>
}
