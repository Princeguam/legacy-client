import { useEffect, useState } from 'react'
import { MEMBER_MESSAGES } from '@/constants/strings'
import type { AuthSession } from '@/types/Auth'
import type { MemberOption } from '@/types/user'
import { FormField } from '@/components/shared/form-field/form-field'
import { NativeSelect } from '@/components/shared/ui/native-select'
import { Button } from '@/components/shared/Button'
import { getMemberOptions } from '@/services/adminService'
import { isValidSession } from '@/services/authService'
import { notify } from '@/lib/notify'
import { memberOptionName } from '@/lib/members'

export function MemberSelect({ session, preview, value, onChange, busy, error }: { session: AuthSession | null; preview: boolean; value: MemberOption | null; onChange: (member: MemberOption | null) => void; busy: boolean; error?: string }) {
  const [members, setMembers] = useState<MemberOption[]>([])
  const [loading, setLoading] = useState(!preview)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    if (preview || !session) return
    const controller = new AbortController()
    getMemberOptions(session, controller.signal).then(result => {
      if (!controller.signal.aborted && isValidSession(session)) { setMembers(result); setLoading(false) }
    }).catch(error => { if (!controller.signal.aborted) { setLoading(false); setFailed(true); notify.error(error, MEMBER_MESSAGES.loadFailed) } })
    return () => controller.abort()
  }, [session, preview, attempt])
  return <div className="settings-form"><FormField label="Member" error={error} hint={loading ? MEMBER_MESSAGES.loading : failed ? MEMBER_MESSAGES.loadFailed : !members.length ? MEMBER_MESSAGES.empty : value ? `${memberOptionName(value)} · ${value.email}` : undefined}>{bindings => <NativeSelect {...bindings} name="memberId" value={value?.id ?? ''} required disabled={busy || loading || failed || !members.length} aria-busy={loading || undefined} onChange={event => onChange(members.find(member => String(member.id) === event.target.value) ?? null)}>
    <option value="">{MEMBER_MESSAGES.choose}</option>{members.map(member => <option key={member.id} value={member.id}>{memberOptionName(member)} · {member.email}</option>)}
  </NativeSelect>}</FormField>{failed && <div><Button variant="outline" disabled={busy || loading} onClick={() => { setFailed(false); setLoading(true); setAttempt(current => current + 1) }}>Try again</Button></div>}</div>
}
