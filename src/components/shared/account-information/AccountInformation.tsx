import { APP_NAME, COMMON_LABELS, MEMBER_CONTACT_LABELS, ROLE_LABELS, USER_ROLES } from '@/constants/strings'
import type { AuthUser } from '@/types/Auth'
import { Card } from '@/components/shared/ui/card'
import { Badge } from '@/components/shared/ui/badge'
import { AccountAvatar } from '@/components/shared/account-avatar/account-avatar'
import { formatProfileDate } from '@/lib/profile'
import './account-information.css'
import { AccountRoleBadge } from './AccountRoleBadge'

export function AccountInformation({ user, accountLabel = 'Signed-in account' }: { user: AuthUser; accountLabel?: string }) {
  const displayName = [user.firstName, user.middleName, user.lastName].filter(Boolean).join(' ') || user.email || (user.role === USER_ROLES.admin ? ROLE_LABELS.admin : ROLE_LABELS.user)
  const fields = [
    [COMMON_LABELS.firstName, user.firstName], [COMMON_LABELS.middleName, user.middleName],
    [COMMON_LABELS.lastName, user.lastName], [COMMON_LABELS.emailAddress, user.email],
    [COMMON_LABELS.phoneNumber, user.phoneNo], [COMMON_LABELS.dob, formatProfileDate(user.dob)],
    [COMMON_LABELS.address, user.address], [COMMON_LABELS.state, user.state], [COMMON_LABELS.lga, user.lga], [COMMON_LABELS.gender, user.gender],
  ] as const
  return <>
    <Card className="product-card">
      <div className="profile-summary">
        <AccountAvatar user={user} />
        <div>
          <h2 className="type-heading">{displayName}</h2>
          <p>{user.email}</p>
          <div className="profile-account-badges"><AccountRoleBadge role={user.role} /><Badge icon={false}>{accountLabel}</Badge>{user.isDeleted && <Badge tone="danger">Deleted account</Badge>}</div>
        </div>
      </div>
    </Card>
    <div className="dashboard-columns">
      <Card className="product-card">
        <h2 className="type-title">Personal information</h2>
        <dl className="profile-fields">{fields.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || COMMON_LABELS.notProvided}</dd></div>)}</dl>
        {(Object.keys(MEMBER_CONTACT_LABELS) as (keyof typeof MEMBER_CONTACT_LABELS)[]).some(key => user[key] !== undefined) && <dl className="profile-fields">{(Object.entries(MEMBER_CONTACT_LABELS) as [keyof typeof MEMBER_CONTACT_LABELS, string][]).map(([key, label]) => <div key={key}><dt>{label}</dt><dd>{user[key] || COMMON_LABELS.notProvided}</dd></div>)}</dl>}
      </Card>
      <Card className="product-card">
        <h2 className="type-title">Membership</h2>
        <dl className="detail-list">
          <div><dt>{COMMON_LABELS.cooperative}</dt><dd>{APP_NAME}</dd></div>
          <div><dt>Member since</dt><dd>{formatProfileDate(user.created)}</dd></div>
          <div><dt>Last updated</dt><dd>{formatProfileDate(user.updated)}</dd></div>
          <div><dt>Account role</dt><dd>{user.role === USER_ROLES.admin ? ROLE_LABELS.admin : ROLE_LABELS.user}</dd></div>
        </dl>
      </Card>
    </div>
  </>
}


