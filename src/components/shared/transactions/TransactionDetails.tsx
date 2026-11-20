import { notify } from '@/lib/notify'
import { RequestRecovery } from '@/components/shared/product/RequestRecovery'
import { useEffect, useRef, useState } from 'react'
import { COMMON_LABELS, PAYMENT_MESSAGES, PAYMENT_REVIEW_LABELS, PAYMENT_STATUS, PAYMENT_TYPE_LABELS, USER_ROLES } from '@/constants/strings'
import type { AuthSession } from '@/types/Auth'
import type { ApiTransaction } from '@/types/transaction'
import { Button } from '@/components/shared/Button'
import { Dialog } from '@/components/shared/ui/dialog'
import { MinorCurrency } from '@/components/shared/currency/minor-currency'
import { PageLoader } from '@/components/shared/page-loader/PageLoader'
import { PaymentStatusBadge } from './PaymentStatusBadge'
import { ReceiptAttachment } from '@/components/shared/receipt/ReceiptAttachment'
import './transaction-details.css'
import { formatPaymentDate } from '@/lib/transactions'
import { isValidSession } from '@/services/authService'
import { getTransaction } from '@/services/userService'
import { getMemberTransaction, getTransaction as getAdminTransaction, reviewMemberTransaction, reviewTransaction } from '@/services/adminService'

export function PaymentInformation({ record, showMember = true }: { record: ApiTransaction; showMember?: boolean }) {
  return <dl className="payment-details-grid">
    <div><dt>Transaction ID</dt><dd className="financial">{record.id}</dd></div>
    <div><dt>{COMMON_LABELS.amount}</dt><dd><MinorCurrency value={record.amount} currency={record.currency} /></dd></div>
    <div><dt>{COMMON_LABELS.status}</dt><dd><PaymentStatusBadge status={record.status} /></dd></div>
    <div><dt>{COMMON_LABELS.type}</dt><dd>{PAYMENT_TYPE_LABELS[record.type]}</dd></div>
    {showMember && <div className="payment-details-wide"><dt>Member</dt><dd>{[record.depositedBy.firstName, record.depositedBy.middleName, record.depositedBy.lastName].filter(Boolean).join(' ')}<br />{record.depositedBy.email}</dd></div>}
    <div><dt>Payment period</dt><dd>{formatPaymentDate(record.period, true)}</dd></div>
    <div><dt>Payment date</dt><dd>{formatPaymentDate(record.depositedAt)}</dd></div>
    <div><dt>Bank</dt><dd>{record.bankAccount.bankName}</dd></div>
    <div><dt>Account name</dt><dd>{record.bankAccount.accountName}</dd></div>
    <div><dt>Account number</dt><dd className="financial">{record.bankAccount.accountNumber}</dd></div>
    <div className="payment-details-wide"><dt>Note</dt><dd>{record.note || COMMON_LABELS.notProvided}</dd></div>
    <div><dt>Submitted by</dt><dd>{record.source === 'Admin' ? 'Administrator' : 'Member'}</dd></div>
    <div><dt>Reviewed by</dt><dd>{record.reviewedBy ? [record.reviewedBy.firstName, record.reviewedBy.lastName].join(' ') : COMMON_LABELS.notProvided}</dd></div>
    <div><dt>Reviewed on</dt><dd>{formatPaymentDate(record.reviewedAt)}</dd></div>
    <div className="payment-details-wide"><dt>Receipt</dt><dd><ReceiptAttachment url={record.attachmentUrl} /></dd></div>
  </dl>
}

export function TransactionDetails({ id, session, memberId, onReviewed }: { id: number; session: AuthSession; memberId?: number; onReviewed: (message: string) => void }) {
  const [record, setRecord] = useState<ApiTransaction | null>(null)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [decision, setDecision] = useState<boolean | null>(null)
  const [saving, setSaving] = useState(false)
  const submitting = useRef(false)
  const mutation = useRef<AbortController | null>(null)
  const admin = session.user.role === USER_ROLES.admin
  useEffect(() => {
    const controller = new AbortController()
    const request = memberId !== undefined ? getMemberTransaction(session, memberId, id, controller.signal) : admin ? getAdminTransaction(session, id, controller.signal) : getTransaction(session.accessToken, session.user, id, controller.signal)
    request.then(data => { if (!controller.signal.aborted && isValidSession(session)) setRecord(data) }).catch(error => { if (!controller.signal.aborted) { setError('failed'); notify.error(error, PAYMENT_MESSAGES.loadFailed) } })
    return () => controller.abort()
  }, [session, admin, id, memberId, attempt])
  useEffect(() => () => mutation.current?.abort(), [])

  async function review() {
    if (submitting.current || decision === null || !record) return
    submitting.current = true
    setSaving(true)

    const controller = new AbortController()
    mutation.current = controller
    try {
      const data = memberId === undefined ? await reviewTransaction(session, record, decision, controller.signal) : await reviewMemberTransaction(session, memberId, record, decision, controller.signal)
      if (controller.signal.aborted || !isValidSession(session)) return
      setRecord(data)
      onReviewed(decision ? PAYMENT_MESSAGES.approved : PAYMENT_MESSAGES.rejected)
      setDecision(null)
    } catch (error) { if (!controller.signal.aborted) notify.error(error, PAYMENT_MESSAGES.reviewFailed) }
    finally { submitting.current = false; if (!controller.signal.aborted) setSaving(false) }
  }

  if (error) return <RequestRecovery onRetry={() => { setError(''); setAttempt(value => value + 1) }} />
  if (!record) return <PageLoader />
  return <div className="transaction-details">
    {admin && record.status === PAYMENT_STATUS.pending && <section className="transaction-review-actions" aria-label={PAYMENT_REVIEW_LABELS.title}>
      <h3 className="type-title">{PAYMENT_REVIEW_LABELS.title}</h3>
      <p className="type-label">This payment is pending. Check the receipt before confirming or rejecting it.</p>
      <div className="inline-actions"><Button disabled={saving} onClick={() => setDecision(true)}>{PAYMENT_REVIEW_LABELS.confirm}</Button><Button variant="danger" disabled={saving} onClick={() => setDecision(false)}>{PAYMENT_REVIEW_LABELS.reject}</Button></div>
    </section>}
    <PaymentInformation record={record} showMember={memberId === undefined} />
    <Dialog size="wide" open={decision !== null} onOpenChange={open => { if (!open) setDecision(null) }} title={decision ? PAYMENT_REVIEW_LABELS.confirm : PAYMENT_REVIEW_LABELS.reject} description={decision ? 'Confirm that this payment reached the cooperative bank account. Its status will become Confirmed.' : 'Confirm that this payment could not be verified. Its status will become Rejected.'} busy={saving} footer={<Button variant={decision ? 'primary' : 'danger'} loading={saving} onClick={review}>{PAYMENT_REVIEW_LABELS.apply}</Button>}>
      {decision !== null && <PaymentInformation record={record} showMember={memberId === undefined} />}
    </Dialog>
  </div>
}
