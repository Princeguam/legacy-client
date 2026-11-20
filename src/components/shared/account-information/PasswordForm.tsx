import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { PASSWORD_MESSAGES } from '@/constants/strings'
import type { AuthSession } from '@/types/Auth'
import type { PasswordErrors, PasswordForm as PasswordValues } from '@/types/settings'
import { Button, IconButton } from '@/components/shared/Button'
import { Input } from '@/components/shared/ui/input'
import { FormField } from '@/components/shared/form-field/form-field'
import { validatePassword } from '@/lib/password'
import { notify } from '@/lib/notify'
import { updatePassword } from '@/services/userService'
import { isValidSession } from '@/services/authService'
import './password-form.css'

const empty: PasswordValues = { oldPassword: '', newPassword: '', confirmPassword: '' }
const fields = [
  { name: 'oldPassword', label: 'Current password', autoComplete: 'current-password' },
  { name: 'newPassword', label: 'New password', autoComplete: 'new-password' },
  { name: 'confirmPassword', label: 'Confirm new password', autoComplete: 'new-password' },
] as const

export function PasswordForm({ session, preview }: { session: AuthSession | null; preview: boolean }) {
  const [input, setInput] = useState(empty)
  const [errors, setErrors] = useState<PasswordErrors>({})
  const [visible, setVisible] = useState<Partial<Record<keyof PasswordValues, boolean>>>({})
  const [saving, setSaving] = useState(false)
  const submitting = useRef(false)
  const controller = useRef<AbortController | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  useEffect(() => () => controller.current?.abort(), [])

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (submitting.current || preview || !session) return
    const next = validatePassword(input)
    setErrors(next)
    if (Object.keys(next).length) { requestAnimationFrame(() => formRef.current?.querySelector<HTMLInputElement>('[aria-invalid="true"]')?.focus()); return }
    submitting.current = true
    setSaving(true)
    const request = new AbortController()
    controller.current = request
    try {
      await updatePassword(session.accessToken, input, request.signal)
      if (request.signal.aborted || !isValidSession(session)) return
      setInput(empty)
      setVisible({})
      notify.success(PASSWORD_MESSAGES.saved)
    } catch (error) { if (!request.signal.aborted) notify.error(error, PASSWORD_MESSAGES.failed) }
    finally { submitting.current = false; if (!request.signal.aborted) setSaving(false) }
  }

  return <form ref={formRef} className="settings-form" onSubmit={submit} noValidate aria-busy={saving || undefined}>
    {preview && <p className="type-label">Sign in to change your password.</p>}
    {fields.map(field => <FormField key={field.name} id={`settings-${field.name}`} label={field.label} error={errors[field.name]}>{bindings => <div className="password-field">
      <Input {...bindings} name={field.name} type={visible[field.name] ? 'text' : 'password'} autoComplete={field.autoComplete} required value={input[field.name]} readOnly={saving} onChange={event => { setInput(current => ({ ...current, [field.name]: event.target.value })); setErrors(current => ({ ...current, [field.name]: undefined, ...(field.name === 'newPassword' ? { confirmPassword: undefined } : {}) })) }} />
      <IconButton label={`${visible[field.name] ? 'Hide' : 'Show'} ${field.label.toLowerCase()}`} aria-controls={`settings-${field.name}`} aria-pressed={!!visible[field.name]} disabled={saving} onClick={() => setVisible(current => ({ ...current, [field.name]: !current[field.name] }))}>{visible[field.name] ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}</IconButton>
    </div>}</FormField>)}
    <div><Button type="submit" loading={saving} disabled={preview || !session}>{PASSWORD_MESSAGES.update}</Button></div>
    {saving && <p role="status">Updating password…</p>}
  </form>
}
