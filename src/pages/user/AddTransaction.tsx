import { notify } from '@/lib/notify'
import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { COMMON_LABELS, MIN_TRANSACTION_DATE, PAGE_LABELS, PAGE_PATHS, PAYMENT_MESSAGES, USER_ROLES } from '@/constants/strings'
import { TRANSACTION_LIMITS } from '@/constants/values'
import type { AuthSession } from '@/types/Auth'
import type { TransactionErrors, TransactionForm } from '@/types/transaction'
import { Button } from '@/components/shared/Button'
import { Modal as Dialog } from '@/components/shared/Modal'
import { Card } from '@/components/shared/ui/card'
import { Alert } from '@/components/shared/ui/alert'
import { Input } from '@/components/shared/ui/input'
import { Textarea } from '@/components/shared/ui/textarea'
import { FormField } from '@/components/shared/form-field/form-field'
import { MinorCurrency } from '@/components/shared/currency/minor-currency'
import { FilePicker } from '@/components/shared/receipt/FilePicker'
import { PageHeader } from '@/components/shared/product/PageHeader'
import { useProduct } from '@/components/shared/product/product-context'
import { useAuth } from '@/context/useAuth'
import { useFileSelection } from '@/hooks/useFileSelection'
import { useTransactionDrafts } from '@/context/transaction-drafts-context'
import { localToday, parseAmountMinor, validateTransaction } from '@/lib/transaction-drafts'
import { formatPaymentDate } from '@/lib/transactions'
import { createTransaction } from '@/services/userService'
import { isValidSession } from '@/services/authService'
import { BankAccountSelect } from '@/components/shared/transactions/BankAccountSelect'
import { useBankAccountOptions } from '@/hooks/useBankAccountOptions'
import { BANK_ACCOUNT_MESSAGES } from '@/constants/strings'
import { bankAccountLabel } from '@/lib/bank-accounts'

export function AddTransaction() {
  const { basePath, role, preview } = useProduct()
  const { session } = useAuth()
  if (role !== USER_ROLES.user) return <Navigate to={`${basePath}/${PAGE_PATHS.transactions}`} replace />
  return <PaymentEntry key={`${basePath}:${preview ? 'preview' : session?.accessToken}:${session?.user.id}`} session={preview ? null : session} preview={preview} basePath={basePath} />
}

function PaymentEntry({ session, preview, basePath }: { session: AuthSession | null; preview: boolean; basePath: string }) {
  const { addDraft } = useTransactionDrafts()
  const navigate = useNavigate()
  const [form, setForm] = useState<TransactionForm>({ bankAccountId: '', period: localToday().slice(0, 7), date: localToday(), amount: '', notes: '' })
  const receipt = useFileSelection('receipt', session, preview)
  const banks = useBankAccountOptions(session, preview)
  const selectedBank = banks.accounts.find(bank => String(bank.id) === form.bankAccountId && bank.isActive)
  const [errors, setErrors] = useState<TransactionErrors>({})
  const [review, setReview] = useState(false)
  const [duplicate, setDuplicate] = useState(false)
  const [saving, setSaving] = useState(false)
  const [stage, setStage] = useState('')
  const formRef = useRef<HTMLFormElement>(null)
  const submittingRef = useRef(false)
  const controllerRef = useRef<AbortController | null>(null)
  useEffect(() => () => controllerRef.current?.abort(), [])
  function update(key: keyof TransactionForm, value: string) { setForm(current => ({ ...current, [key]: value })); setErrors(current => ({ ...current, [key]: undefined })); setDuplicate(false) }
  function prepare(event: FormEvent) {
    event.preventDefault()
    if (!receipt.ready) return
    const next = { ...validateTransaction(form, receipt.file), ...(!selectedBank ? { bankAccountId: BANK_ACCOUNT_MESSAGES.required } : {}), ...(receipt.error ? { receipt: receipt.error } : !preview && !receipt.file ? { receipt: 'Attach a receipt before submitting this payment.' } : {}) }
    setErrors(next);
    if (Object.values(next).some(Boolean)) { formRef.current?.querySelector<HTMLElement>(`[name="${Object.keys(next)[0]}"]`)?.focus(); return }
    setReview(true)
  }
  async function save() {
    if (submittingRef.current || !selectedBank || banks.loading || banks.failed || !receipt.ready) return
    if (preview) {
      if (!addDraft({ bankAccountId: Number(form.bankAccountId), period: form.period, date: form.date, notes: form.notes.trim(), amountMinor: parseAmountMinor(form.amount)!, receipt: receipt.file })) { setDuplicate(true); return }
      submittingRef.current = true
      navigate(`${basePath}/${PAGE_PATHS.transactions}`, { state: { draftSaved: true } }); return
    }
    if (!session || !receipt.file) return
    submittingRef.current = true; setSaving(true);
    const controller = new AbortController(); controllerRef.current = controller
    try {
      const attachmentUrl = receipt.uploadedUrl
      if (!attachmentUrl || controller.signal.aborted || !isValidSession(session)) return
      setStage('Submitting payment…')
      await createTransaction(session.accessToken, session.user, { bankAccountId: Number(form.bankAccountId), amount: parseAmountMinor(form.amount)!, period: `${form.period}-01`, depositedAt: `${form.date}T00:00:00Z`, note: form.notes.trim(), attachmentUrl }, controller.signal)
      if (!controller.signal.aborted && isValidSession(session)) { notify.success('Your payment has been submitted for review.'); navigate(`${basePath}/${PAGE_PATHS.transactions}`, { replace: true, state: { transactionCreated: true } }) }
    } catch (error) { if (!controller.signal.aborted) notify.error(error, PAYMENT_MESSAGES.saveFailed) }
    finally { submittingRef.current = false; if (!controller.signal.aborted) setSaving(false) }
  }
  return <div className="page-stack"><PageHeader title={preview ? 'Add transaction draft' : PAGE_LABELS.addTransaction} description="Record a member payment and attach its receipt for review." actions={<Link className="standalone-link" to={`${basePath}/${PAGE_PATHS.transactions}`}><ArrowLeft aria-hidden="true" />Back to transactions</Link>} />
    {preview ? <Alert title="Local draft">Preview entries and files stay in memory and are not submitted. Reloading or switching workspace clears them.</Alert> : <Alert title="Payment review">Your receipt uploads as soon as you select it. The payment is submitted after review and remains pending until an administrator reviews it.</Alert>}
    <form ref={formRef} onSubmit={prepare} noValidate className="page-stack"><Card className="product-card"><h2 className="type-title">Payment details</h2><div className="form-grid">
      <BankAccountSelect accounts={banks.accounts} value={form.bankAccountId} onChange={value => update('bankAccountId', value)} loading={banks.loading} failed={banks.failed} onRetry={banks.retry} busy={saving} error={errors.bankAccountId} />
      <FormField label="Amount (NGN)" hint="Use a decimal point, for example 80000.01." error={errors.amount}>{bindings => <Input {...bindings} name="amount" inputMode="decimal" required value={form.amount} onChange={event => update('amount', event.target.value)} />}</FormField>
      <FormField label="Payment period" error={errors.period}>{bindings => <Input {...bindings} name="period" type="month" required value={form.period} onChange={event => update('period', event.target.value)} />}</FormField>
      <FormField label="Payment date" hint="Today or earlier." error={errors.date}>{bindings => <Input {...bindings} name="date" type="date" required min={MIN_TRANSACTION_DATE} max={localToday()} value={form.date} onChange={event => update('date', event.target.value)} />}</FormField>
    </div><FormField label="Note" error={errors.notes}>{bindings => <Textarea {...bindings} name="notes" rows={4} maxLength={TRANSACTION_LIMITS.notes} value={form.notes} onChange={event => update('notes', event.target.value)} />}</FormField></Card>
    <Card className="product-card"><h2 className="type-title">Receipt</h2><FilePicker selection={receipt} kind="receipt" preview={preview} busy={saving} required={!preview} error={receipt.file ? undefined : errors.receipt} /></Card>
    <div className="inline-actions"><Link className="standalone-link" to={`${basePath}/${PAGE_PATHS.transactions}`}>{COMMON_LABELS.cancel}</Link><Button type="submit" primaryAction disabled={banks.loading || banks.failed || !banks.accounts.length || !receipt.ready}>Review transaction</Button></div></form>
    <Dialog open={review} onOpenChange={setReview} title="Review transaction" description={preview ? 'Check this local draft. Saving does not submit a payment.' : 'Check the bank account, amount, payment period and receipt before submitting.'} busy={saving} footer={<Button loading={saving} onClick={save} disabled={!receipt.ready || !preview && !session}>{preview ? 'Save transaction draft' : 'Submit transaction'}</Button>}>
      {saving && <p role="status">{stage}</p>}
      <dl className="detail-list"><div><dt>{BANK_ACCOUNT_MESSAGES.label}</dt><dd>{selectedBank ? bankAccountLabel(selectedBank) : COMMON_LABELS.notAvailable}</dd></div><div><dt>Payment period</dt><dd>{formatPaymentDate(`${form.period}-01`, true)}</dd></div><div><dt>Payment date</dt><dd>{form.date}</dd></div><div><dt>Amount</dt><dd><MinorCurrency value={parseAmountMinor(form.amount) ?? '0'} /></dd></div><div><dt>Note</dt><dd>{form.notes || COMMON_LABELS.notProvided}</dd></div><div><dt>Receipt</dt><dd>{receipt.file?.name || 'None attached'}</dd></div></dl>
      {duplicate && <Alert tone="warning" title="Draft already exists" role="alert">A draft with the same details is already saved. Cancel to edit your entry.</Alert>}
    </Dialog>
  </div>
}
