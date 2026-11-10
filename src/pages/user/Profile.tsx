import { useRef, useState, type FormEvent } from 'react'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/shared/Button'
import { Dialog } from '@/components/shared/ui/dialog'
import { Card } from '@/components/shared/ui/card'
import { Badge } from '@/components/shared/ui/badge'
import { Input } from '@/components/shared/ui/input'
import { Alert } from '@/components/shared/ui/alert'
import { FormField } from '@/components/shared/form-field/form-field'
import { PageHeader } from '@/components/shared/product/PageHeader'
import { Currency } from '@/components/shared/currency/currency'
import { useProduct } from '@/components/shared/product/product-context'
import { members, previewMemberId, formatDate, getSummary } from '@/lib/product-data'

type ProfileDraft = { firstName: string; lastName: string; email: string; phone: string }
export function Profile() {
  const { role, preview, user } = useProduct()
  const sample = preview && role === 'user' ? members.find(member => member.id === previewMemberId) : undefined
  const original: ProfileDraft = { firstName: user?.firstName ?? '', lastName: user?.lastName ?? '', email: user?.email ?? '', phone: sample?.phone ?? '' }
  const [draft, setDraft] = useState<ProfileDraft>(original)
  const [saved, setSaved] = useState<ProfileDraft | null>(null)
  const [editing, setEditing] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileDraft, string>>>({})
  const formRef = useRef<HTMLFormElement>(null)
  const displayName = [original.firstName, original.lastName].filter(Boolean).join(' ') || 'Your account'
  function save(event: FormEvent) {
    event.preventDefault()
    const next: typeof errors = {}
    if (!draft.firstName.trim()) next.firstName = 'Enter your first name.'
    if (!draft.lastName.trim()) next.lastName = 'Enter your last name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())) next.email = 'Enter a valid email address.'
    setErrors(next)
    if (Object.keys(next).length) { requestAnimationFrame(() => formRef.current?.querySelector<HTMLInputElement>('[aria-invalid="true"]')?.focus()); return }
    setSaved({ ...draft }); setEditing(false)
  }
  return <div className="page-stack"><PageHeader title="Your profile" description="Your account details and cooperative membership." actions={<Button variant="outline" onClick={() => { setDraft(saved ?? original); setErrors({}); setEditing(true) }}><Pencil aria-hidden="true" />Edit profile draft</Button>} />
    <Card className="product-card"><div className="profile-summary"><span className="avatar" aria-hidden="true">{[original.firstName[0], original.lastName[0]].filter(Boolean).join('') || 'LW'}</span><div><h2 className="type-heading">{displayName}</h2><p>{original.email}</p><div><Badge>{role === 'Admin' ? 'Administrator' : 'Member'}</Badge> <Badge icon={false}>{preview ? 'Sample account' : 'Signed-in account'}</Badge></div></div></div></Card>
    <div className="dashboard-columns"><Card className="product-card"><h2 className="type-title">Personal information</h2><dl className="profile-fields"><div><dt>First name</dt><dd>{original.firstName || 'Not provided'}</dd></div><div><dt>Last name</dt><dd>{original.lastName || 'Not provided'}</dd></div><div><dt>Email address</dt><dd>{original.email || 'Not provided'}</dd></div><div><dt>Phone number</dt><dd>{original.phone || 'Not provided'}</dd></div><div><dt>Account identifier</dt><dd className="financial">{user?.id ?? 'Not available'}</dd></div><div><dt>Account role</dt><dd>{role === 'Admin' ? 'Administrator' : 'Member'}</dd></div></dl></Card><Card className="product-card"><h2 className="type-title">Membership</h2><dl className="detail-list"><div><dt>Cooperative</dt><dd>Legacy Wealth Cooperatives</dd></div><div><dt>Member since</dt><dd>{sample ? formatDate(sample.joined) : 'Not provided'}</dd></div><div><dt>Status</dt><dd>{sample ? <Badge tone="success">{sample.status}</Badge> : preview ? 'Sample administrator' : 'Not provided'}</dd></div>{role === 'user' && <div><dt>Annual commitment</dt><dd><Currency value={getSummary('user').target} /><span className="type-caption"> · illustrative</span></dd></div>}</dl></Card></div>
    {saved && <Card className="product-card"><Alert tone="info" title="Profile draft saved for this screen" role="status">Your account has not changed. Leaving this page clears the draft.</Alert><dl className="profile-fields"><div><dt>Draft name</dt><dd>{saved.firstName} {saved.lastName}</dd></div><div><dt>Draft email</dt><dd>{saved.email}</dd></div><div><dt>Draft phone</dt><dd>{saved.phone || 'Not provided'}</dd></div></dl><Button variant="ghost" onClick={() => setSaved(null)}>Discard draft</Button></Card>}
    <Dialog open={editing} onOpenChange={setEditing} title="Edit profile draft" description="Prepare a profile update. Saving keeps a draft on this screen only; your account stays unchanged." footer={<Button type="submit" form="profile-draft-form">Save draft</Button>}><form ref={formRef} id="profile-draft-form" className="settings-form" onSubmit={save} noValidate><div className="form-grid">{(['firstName', 'lastName'] as const).map(key => <FormField key={key} label={key === 'firstName' ? 'First name' : 'Last name'} error={errors[key]}>{bindings => <Input {...bindings} required autoComplete={key === 'firstName' ? 'given-name' : 'family-name'} value={draft[key]} onChange={event => setDraft({ ...draft, [key]: event.target.value })} />}</FormField>)}</div><FormField label="Email address" error={errors.email}>{bindings => <Input {...bindings} required type="email" autoComplete="email" value={draft.email} onChange={event => setDraft({ ...draft, email: event.target.value })} />}</FormField><FormField label="Phone number" hint="Optional.">{bindings => <Input {...bindings} type="tel" autoComplete="tel" value={draft.phone} onChange={event => setDraft({ ...draft, phone: event.target.value })} />}</FormField></form></Dialog>
  </div>
}
