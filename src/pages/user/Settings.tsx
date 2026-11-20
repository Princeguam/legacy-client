import { CURRENT_YEAR } from '@/constants/values'
import { APP_NAME, COMMON_LABELS, PAGE_LABELS, PAGE_PATHS, STORAGE_KEYS, THEMES, USER_ROLES } from '@/constants/strings'
import type { CooperativePlanningDraft, DevicePreferences } from '@/types/settings'
import { useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/shared/Button'
import { Card } from '@/components/shared/ui/card'
import { Switch } from '@/components/shared/ui/switch'
import { Input } from '@/components/shared/ui/input'
import { FormField } from '@/components/shared/form-field/form-field'
import { Alert } from '@/components/shared/ui/alert'
import { PageHeader } from '@/components/shared/product/PageHeader'
import { useProduct } from '@/components/shared/product/product-context'
import { useTheme } from '@/hooks/useTheme'
import { useAuth } from '@/context/useAuth'
import { PasswordForm } from '@/components/shared/account-information/PasswordForm'
import { LogOut } from 'lucide-react'
import { AccountRoleBadge } from '@/components/shared/account-information/AccountRoleBadge'

function readPreferences(key: string): DevicePreferences {
  try { const value = JSON.parse(localStorage.getItem(key) ?? '{}'); return { activity: value?.activity === true, reminders: value?.reminders === true } } catch { return { activity: false, reminders: false } }
}
export function Settings() {
  const { session, signOut } = useAuth()
  const { role, preview, basePath, user } = useProduct()
  const { theme, toggleTheme } = useTheme()
  const key = `${STORAGE_KEYS.devicePreferences}:${preview ? 'preview' : 'account'}:${role}:${user?.id ?? ''}`
  const [preferences, setPreferences] = useState(() => readPreferences(key))
  const [message, setMessage] = useState('')
  const [plan, setPlan] = useState<CooperativePlanningDraft>({ name: APP_NAME, year: String(CURRENT_YEAR), target: '' })
  const [planErrors, setPlanErrors] = useState<Partial<Record<keyof typeof plan, string>>>({})
  const planRef = useRef<HTMLFormElement>(null)
  function updatePreference(name: keyof typeof preferences, checked: boolean) {
    const next = { ...preferences, [name]: checked }; setPreferences(next)
    try { localStorage.setItem(key, JSON.stringify(next)); setMessage('Preference saved on this device. Notification delivery is not connected.') } catch { setMessage('Preference updated for this screen. This browser could not save it on the device.') }
  }
  function savePlan(event: FormEvent) {
    event.preventDefault()
    const errors: typeof planErrors = {}
    if (!plan.name.trim()) errors.name = 'Enter the cooperative name.'
    if (!/^\d{4}$/.test(plan.year) || Number(plan.year) < CURRENT_YEAR) errors.year = `Enter a four-digit year from ${CURRENT_YEAR}.`
    if (!Number.isFinite(Number(plan.target)) || Number(plan.target) <= 0) errors.target = 'Enter a positive annual target in Nigerian naira.'
    setPlanErrors(errors)
    if (Object.keys(errors).length) { requestAnimationFrame(() => planRef.current?.querySelector<HTMLInputElement>('[aria-invalid="true"]')?.focus()); return }
    setMessage('Planning draft kept on this screen. Cooperative settings have not changed.')
  }
  return <div className="page-stack"><PageHeader title={PAGE_LABELS.settings} description={role === USER_ROLES.admin ? 'Manage your display preferences and prepare cooperative planning drafts.' : 'Make your workspace feel right for you.'} />
    <Card className="product-card"><h2 className="type-title">Appearance</h2><div className="settings-row"><div><h3 className="type-body">Colour theme</h3><p className="type-label">Applies throughout the workspace on this device.</p></div><Switch label="Dark theme" checked={theme === THEMES.dark} onCheckedChange={toggleTheme} /></div><div className="settings-row"><div><h3 className="type-body">Currency and dates</h3><p className="type-label">Nigerian naira (NGN) · English (Nigeria)</p></div></div></Card>
    <Card className="product-card"><h2 className="type-title">Notification preferences</h2><p className="type-label">These preferences are stored on this device. Email and push delivery are not connected.</p><div className="settings-row"><div><h3 className="type-body">Account activity</h3><p className="type-label">Your preference for contribution and transaction updates.</p></div><Switch label="Activity updates" checked={preferences.activity} onCheckedChange={checked => updatePreference('activity', checked)} /></div><div className="settings-row"><div><h3 className="type-body">{COMMON_LABELS.contributionReminders}</h3><p className="type-label">Your preference for reminders about annual commitments.</p></div><Switch label={COMMON_LABELS.contributionReminders} checked={preferences.reminders} onCheckedChange={checked => updatePreference('reminders', checked)} /></div></Card>
    {role === USER_ROLES.admin && <Card className="product-card"><h2 className="type-title">Cooperative planning draft</h2><p className="type-label">Prepare settings for later review. This draft does not change the cooperative or dashboard figures.</p><form ref={planRef} className="settings-form" onSubmit={savePlan} noValidate><FormField label="Cooperative name" error={planErrors.name}>{bindings => <Input {...bindings} required value={plan.name} onChange={event => setPlan({ ...plan, name: event.target.value })} />}</FormField><div className="form-grid"><FormField label="Planning year" hint={`${CURRENT_YEAR} or later.`} error={planErrors.year}>{bindings => <Input {...bindings} type="number" min={CURRENT_YEAR} step={1} required value={plan.year} onChange={event => setPlan({ ...plan, year: event.target.value })} />}</FormField><FormField label="Annual target per member (NGN)" hint="Planning amount only." error={planErrors.target}>{bindings => <Input {...bindings} type="number" min={1} step="0.01" inputMode="decimal" required value={plan.target} onChange={event => setPlan({ ...plan, target: event.target.value })} />}</FormField></div>{Object.keys(planErrors).length > 0 && <Alert tone="danger" title="Check the planning draft" role="alert">Correct the labelled fields and save again. Your draft values are preserved.</Alert>}<div><Button type="submit">Save planning draft</Button></div></form></Card>}
    <Card className="product-card"><h2 className="type-title">Password</h2><p className="type-label">Use your current password to set a new one.</p><PasswordForm key={`${preview ? 'preview' : session?.accessToken}:${user?.id}`} session={preview ? null : session} preview={preview} /></Card>
    <Card className="product-card"><h2 className="type-title">Account and access</h2><dl className="detail-list"><div><dt>Role</dt><dd><AccountRoleBadge role={role} /></dd></div><div><dt>Access management</dt><dd>Your cooperative administrator</dd></div></dl><p className="type-label">Contact your administrator to request access changes.</p><div className="inline-actions settings-account-actions"><Link to={`${basePath}/${PAGE_PATHS.profile}`} className="standalone-link type-label">View account profile</Link>{!preview && <Button className="settings-sign-out" variant="danger" onClick={signOut}><LogOut aria-hidden="true" />{COMMON_LABELS.signOut}</Button>}</div></Card>
    {message && <Alert tone="info" title="Preference update" role="status">{message}</Alert>}
  </div>
}
