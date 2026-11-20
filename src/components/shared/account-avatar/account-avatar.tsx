import { useState } from 'react'
import { APP_INITIALS, COMMON_LABELS } from '@/constants/strings'
import type { AuthUser } from '@/types/Auth'
import './account-avatar.css'

function AvatarContent({ user, small }: { user: AuthUser | null; small: boolean }) {
  const [failed, setFailed] = useState(false)
  const name = [user?.firstName, user?.middleName, user?.lastName].filter(Boolean).join(' ') || user?.email || COMMON_LABELS.yourAccount
  const initials = [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join('') || APP_INITIALS
  const className = `avatar${small ? ' avatar-small' : ''}`
  const passport = user?.passport?.trim()
  return passport && !failed
    ? <img className={`${className} account-avatar-photo`} src={passport} alt={`${name}'s passport photo`} referrerPolicy="no-referrer" onError={() => setFailed(true)} />
    : <span className={className} aria-hidden="true">{initials}</span>
}

export function AccountAvatar({ user, small = false }: { user: AuthUser | null; small?: boolean }) {
  return <AvatarContent key={`${user?.id}:${user?.passport}`} user={user} small={small} />
}
