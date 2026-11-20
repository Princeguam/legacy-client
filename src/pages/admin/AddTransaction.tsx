import { notify } from '@/lib/notify'
import { useFileSelection } from '@/hooks/useFileSelection'
import { FilePicker } from '@/components/shared/receipt/FilePicker'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { PAGE_LABELS, PAGE_PATHS, PAYMENT_MESSAGES, USER_ROLES } from '@/constants/strings'
import { TRANSACTION_LIMITS } from '@/constants/values'
import type { AdminCreateTransactionRequest } from '@/types/transaction'
import type { AuthSession } from '@/types/Auth'
import { useAuth } from '@/context/useAuth'
import { useProduct } from '@/components/shared/product/product-context'
import { Button } from '@/components/shared/Button'
import { Card } from '@/components/shared/ui/card'
import { Input } from '@/components/shared/ui/input'
import { Textarea } from '@/components/shared/ui/textarea'
import { Dialog } from '@/components/shared/ui/dialog'
import { Alert } from '@/components/shared/ui/alert'
import { FormField } from '@/components/shared/form-field/form-field'
import { PageHeader } from '@/components/shared/product/PageHeader'
import { MinorCurrency } from '@/components/shared/currency/minor-currency'
import { localToday } from '@/lib/transaction-drafts'
import { formatPaymentDate, parsePaymentAmount, validAccountId, validPaymentDate } from '@/lib/transactions'
import { isValidSession } from '@/services/authService'
import { createTransaction } from '@/services/adminService'
import { BankAccountSelect } from '@/components/shared/transactions/BankAccountSelect'
import { MemberSelect } from '@/components/shared/transactions/MemberSelect'
import { useBankAccountOptions } from '@/hooks/useBankAccountOptions'
import { BANK_ACCOUNT_MESSAGES, MEMBER_MESSAGES } from '@/constants/strings'
import { bankAccountLabel } from '@/lib/bank-accounts'
import type { MemberOption } from '@/types/user'
import { memberOptionName } from '@/lib/members'

export function AddTransaction() {
  const { session } = useAuth()
  const { preview, basePath } = useProduct()
  return <CreatePayment key={`${session?.accessToken}:${session?.user.id}:${preview}`} session={preview ? null : session} preview={preview} basePath={basePath} />
}

function CreatePayment({ session, preview, basePath }: { session: AuthSession | null; preview: boolean; basePath: string }) {
  const navigate = useNavigate()
  const [input, setInput] = useState({ bankAccountId: '', amount: '', period: localToday().slice(0, 7), depositedAt: localToday(), note: '' })
  const [member, setMember] = useState<MemberOption | null>(null)
  const banks = useBankAccountOptions(session, preview)
  const selectedBank = banks.accounts.find(bank => String(bank.id) === input.bankAccountId && bank.isActive)
  const [errors, setErrors] = useState<Partial<Record<keyof typeof input | 'memberId' | 'receipt', string>>>({})
  const [review, setReview] = useState<AdminCreateTransactionRequest | null>(null)
  const [saving, setSaving] = useState(false)
  const [stage, setStage] = useState('')
  const receipt = useFileSelection('receipt', session, preview)
  const submitting = useRef(false)
  const controller = useRef<AbortController | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  useEffect(() => () => controller.current?.abort(), [])

  function prepare(event: FormEvent) {
    event.preventDefault()
    if (!receipt.ready) return
    const next: typeof errors = {}
    if (!member || !validAccountId(member.id)) next.memberId = MEMBER_MESSAGES.required
    if (!selectedBank) next.bankAccountId = BANK_ACCOUNT_MESSAGES.required
    const amount = parsePaymentAmount(input.amount)
    if (!amount) next.amount = PAYMENT_MESSAGES.invalidAmount
    if (!/^\d{4}-\d{2}$/.test(input.period) || !validPaymentDate(`${input.period}-01`)) next.period = 'Choose a valid payment month.'
    if (!validPaymentDate(input.depositedAt) || input.depositedAt > localToday()) next.depositedAt = 'Choose today or an earlier payment date.'
    if (input.note.length > TRANSACTION_LIMITS.notes) next.note = 'Use 1,000 characters or fewer.'
    if (receipt.error) next.receipt = receipt.error
    setErrors(next)

    if (Object.keys(next).length) { formRef.current?.querySelector<HTMLInputElement>(`[name="${Object.keys(next)[0]}"]`)?.focus(); return }
    setReview({ memberId: member!.id, bankAccountId: selectedBank!.id, amount: amount!, period: `${input.period}-01`, depositedAt: `${input.depositedAt}T00:00:00Z`, note: input.note.trim() })
  }

  async function submit() {
    if (submitting.current || !review || !selectedBank || banks.loading || banks.failed || !member || !session || preview || !receipt.ready || session.user.role !== USER_ROLES.admin) return
    submitting.current = true
    setSaving(true)

    const requestController = new AbortController()
    controller.current = requestController
    try {
      const attachmentUrl = receipt.uploadedUrl
      if (requestController.signal.aborted || !isValidSession(session)) return
      setStage('Creating transaction…')
      await createTransaction(session, { ...review, ...(attachmentUrl ? { attachmentUrl } : {}) }, requestController.signal)
      if (requestController.signal.aborted || !isValidSession(session)) return
      notify.success(PAYMENT_MESSAGES.saved)
      navigate(`${basePath}/${PAGE_PATHS.transactions}`, { replace: true, state: { transactionCreated: true } })
    } catch (error) { if (!requestController.signal.aborted) notify.error(error, PAYMENT_MESSAGES.saveFailed) }
    finally { submitting.current = false; if (!requestController.signal.aborted) setSaving(false) }
  }

  return <div className="page-stack"><PageHeader title={PAGE_LABELS.addTransaction} description="Record a member payment that has reached the cooperative bank account." actions={<Link className="standalone-link" to={`${basePath}/${PAGE_PATHS.transactions}`}><ArrowLeft aria-hidden="true" />Back to transactions</Link>} />
    <Alert title="Confirmed payment">Administrator entries are recorded as confirmed. Review the member, bank account, amount and payment period before submitting.</Alert>
    <Card className="product-card"><form ref={formRef} className="settings-form" noValidate onSubmit={prepare}>
      <div className="form-grid"><MemberSelect session={session} preview={preview} value={member} onChange={value => { setMember(value); setErrors(current => ({ ...current, memberId: undefined })) }} busy={saving} error={errors.memberId} /><BankAccountSelect accounts={banks.accounts} value={input.bankAccountId} onChange={value => { setInput({ ...input, bankAccountId: value }); setErrors(current => ({ ...current, bankAccountId: undefined })) }} loading={banks.loading} failed={banks.failed} onRetry={banks.retry} busy={saving} error={errors.bankAccountId} /><FormField label="Amount (NGN)" error={errors.amount}>{bindings => <Input {...bindings} name="amount" inputMode="decimal" required value={input.amount} onChange={event => setInput({ ...input, amount: event.target.value })} />}</FormField><FormField label="Payment period" error={errors.period}>{bindings => <Input {...bindings} name="period" type="month" required value={input.period} onChange={event => setInput({ ...input, period: event.target.value })} />}</FormField><FormField label="Payment date" error={errors.depositedAt}>{bindings => <Input {...bindings} name="depositedAt" type="date" required max={localToday()} value={input.depositedAt} onChange={event => setInput({ ...input, depositedAt: event.target.value })} />}</FormField></div>
      <FormField label="Note" error={errors.note}>{bindings => <Textarea {...bindings} name="note" maxLength={TRANSACTION_LIMITS.notes} value={input.note} onChange={event => setInput({ ...input, note: event.target.value })} />}</FormField>
      <FilePicker selection={receipt} kind="receipt" preview={preview} busy={saving} />
      <Button type="submit" disabled={banks.loading || banks.failed || !banks.accounts.length || !receipt.ready}>Review transaction</Button>
    </form></Card>
    <Dialog open={review !== null} onOpenChange={open => { if (!open) setReview(null) }} title="Review transaction" description="Confirm this member payment before recording it as confirmed." busy={saving} footer={<Button loading={saving} disabled={preview || !session || !receipt.ready} onClick={submit}>Create transaction</Button>}>
      {saving && <p role="status">{stage}</p>}
      {receipt.file && <p>Receipt: {receipt.file.name}</p>}
      {preview && <p>Layout preview. Sign in as an administrator to create a transaction.</p>}
      {review && <dl className="detail-list"><div><dt>Member</dt><dd>{member ? memberOptionName(member) : 'Not available'}<br />{member?.email}</dd></div><div><dt>{BANK_ACCOUNT_MESSAGES.label}</dt><dd>{selectedBank ? bankAccountLabel(selectedBank) : 'Not available'}</dd></div><div><dt>Amount</dt><dd><MinorCurrency value={review.amount} /></dd></div><div><dt>Payment period</dt><dd>{formatPaymentDate(review.period, true)}</dd></div><div><dt>Payment date</dt><dd>{formatPaymentDate(review.depositedAt ?? null)}</dd></div><div><dt>Note</dt><dd>{review.note || 'Not provided'}</dd></div></dl>}
    </Dialog>
  </div>
}
