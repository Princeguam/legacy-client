import { CircleUserRound, ShieldCheck } from 'lucide-react'
import { ROLE_LABELS, USER_ROLES } from '@/constants/strings'
import { Badge } from '@/components/shared/ui/badge'

export function AccountRoleBadge({ role }: { role: string }) {
    const admin = role === USER_ROLES.admin
    const Icon = admin ? ShieldCheck : CircleUserRound
    return <Badge icon={false}><Icon aria-hidden="true" />{admin ? ROLE_LABELS.admin : ROLE_LABELS.user}</Badge>
}
