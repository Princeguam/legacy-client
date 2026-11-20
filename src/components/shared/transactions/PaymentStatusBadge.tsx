import { PAYMENT_STATUS, PAYMENT_STATUS_LABELS } from '@/constants/strings'
import type { PaymentStatus } from '@/types/transaction'
import { Badge } from '@/components/shared/ui/badge'

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <Badge tone={status === PAYMENT_STATUS.confirmed ? 'success' : status === PAYMENT_STATUS.rejected ? 'danger' : 'warning'}>{PAYMENT_STATUS_LABELS[status]}</Badge>
}
