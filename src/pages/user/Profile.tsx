import { RequestRecovery } from '@/components/shared/product/RequestRecovery'
import { notify } from '@/lib/notify'
import { AccountInformation } from '@/components/shared/account-information/AccountInformation'
import { PersonalFields } from '@/components/shared/account-information/PersonalFields'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Pencil } from 'lucide-react'
import { COMMON_LABELS, PROFILE_MESSAGES } from '@/constants/strings'
import type { AuthContextValue, AuthSession } from '@/types/Auth'
import type { ApiUser, ProfileFormErrors } from '@/types/user'
import { useAuth } from '@/context/useAuth'
import { useProduct } from '@/components/shared/product/product-context'
import { Button } from '@/components/shared/Button'
import { Dialog } from '@/components/shared/ui/dialog'
import { PageHeader } from '@/components/shared/product/PageHeader'
import { PageLoader } from '@/components/shared/page-loader/PageLoader'
import { profileFormValues, validateProfile } from '@/lib/profile'
import { toAuthUser } from '@/services/apiUser'
import { getProfile, updateProfile } from '@/services/userService'
import { isValidSession } from '@/services/authService'
import { useFileSelection } from '@/hooks/useFileSelection'
import { AvatarPicker } from '@/components/shared/account-avatar/AvatarPicker'


function ProfileEditor({ session, updateUser }: { session: AuthSession; updateUser: AuthContextValue['updateUser'] }) {
  const { accessToken } = session
  const accountId = session.user.id
  const accountRole = session.user.role
  const [profile, setProfile] = useState<ApiUser | null>(null)
  const [loadError, setLoadError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [editing, setEditing] = useState(false)
  const [input, setInput] = useState(() => profileFormValues())
  const [errors, setErrors] = useState<ProfileFormErrors>({})
  const [isSaving, setIsSaving] = useState(false)
  const [stage, setStage] = useState('')
  const avatar = useFileSelection('avatar', session)
  const submitting = useRef(false)
  const saveController = useRef<AbortController | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    const controller = new AbortController()
    getProfile(accessToken, { id: accountId, role: accountRole }, controller.signal).then(data => {
      if (controller.signal.aborted || !updateUser(data, accessToken)) return
      setProfile(data)
    }).catch(error => {
      if (!controller.signal.aborted) { setLoadError('failed'); notify.error(error, 'Unable to load your profile. Please try again.') }
    })
    return () => controller.abort()
  }, [accessToken, accountId, accountRole, attempt, updateUser])

  useEffect(() => () => saveController.current?.abort(), [])

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current || !profile || !avatar.ready) return
    const nextErrors = { ...validateProfile(input), ...(avatar.error ? { passport: avatar.error } : {}) }
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length) {
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]:not(input[type="file"])')?.focus())
      return
    }
    submitting.current = true
    setIsSaving(true)
    const controller = new AbortController()
    saveController.current = controller
    try {
      const passport = avatar.uploadedUrl
      if (!isValidSession(session) || controller.signal.aborted) return
      setStage('Saving profile…')
      const data = await updateProfile(accessToken, { id: accountId, role: accountRole }, { ...input, ...(passport ? { passport } : {}) }, controller.signal)
      if (controller.signal.aborted || !updateUser(data, accessToken)) return
      setProfile(data)
      setEditing(false)
      notify.success(PROFILE_MESSAGES.saved)
    } catch (error) {
      if (!controller.signal.aborted) {
        notify.error(error, 'Unable to save your profile. Please try again.')
      }
    } finally {
      submitting.current = false
      if (!controller.signal.aborted) setIsSaving(false)
    }
  }

  function openEditor() {
    if (!profile) return
    setInput(profileFormValues(profile))
    avatar.remove()
    setErrors({})

    setEditing(true)
  }

  return <div className="page-stack">
    <PageHeader title="Your profile" description="Your account details and cooperative membership." actions={profile && <Button variant="outline" onClick={openEditor}><Pencil aria-hidden="true" />{COMMON_LABELS.editProfile}</Button>} />
    {loadError ? <RequestRecovery onRetry={() => { setLoadError(''); setAttempt(value => value + 1) }} /> : !profile ? <PageLoader /> : <>

      <AccountInformation user={toAuthUser(profile)} />
    </>}
    <Dialog size="wide" open={editing} onOpenChange={setEditing} title={COMMON_LABELS.editProfile} description="Update your personal and contact details." busy={isSaving} footer={<Button type="submit" form="profile-form" loading={isSaving} disabled={!avatar.ready}>Save changes</Button>}>
      <form ref={formRef} id="profile-form" className="settings-form" onSubmit={save} noValidate aria-busy={isSaving || undefined}>
        <AvatarPicker selection={avatar} user={profile ? toAuthUser(profile) : null} busy={isSaving} error={errors.passport} />
        <PersonalFields input={input} errors={errors} readOnly={isSaving} onChange={(field, value) => setInput(current => ({ ...current, [field]: value }))} />
        {isSaving && <p role="status">{stage}</p>}
      </form>
    </Dialog>
  </div>
}

function ConnectedProfile() {
  const { session, updateUser } = useAuth()
  if (!session) return null
  return <ProfileEditor key={[session.accessToken, session.user.id, session.user.role].join(':')} session={session} updateUser={updateUser} />
}

export function Profile() {
  const { preview, user } = useProduct()
  if (!preview) return <ConnectedProfile />
  return <div className="page-stack"><PageHeader title="Your profile" description="Profile layout preview. Sign in to view and edit your own profile." /><AccountInformation user={user!} accountLabel="Sample account" /></div>
}
