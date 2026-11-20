import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Landmark, Plus, RefreshCw } from 'lucide-react'
import { BANK_ACCOUNT_MESSAGES, BANK_ACCOUNT_SORTS, COMMON_LABELS, PAGE_LABELS } from '@/constants/strings'
import { PAGE_SIZES } from '@/constants/values'
import type { AuthSession } from '@/types/Auth'
import type { BankAccountErrors, BankAccountListData, BankAccountListQuery, CreateBankAccountRequest } from '@/types/bank-account'
import { useAuth } from '@/context/useAuth'
import { useProduct } from '@/components/shared/product/product-context'
import { Button } from '@/components/shared/Button'
import { Card } from '@/components/shared/ui/card'
import { Dialog } from '@/components/shared/ui/dialog'
import { FormField } from '@/components/shared/form-field/form-field'
import { Input } from '@/components/shared/ui/input'
import { NativeSelect } from '@/components/shared/ui/native-select'
import { Badge } from '@/components/shared/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/shared/Table'
import { PageHeader } from '@/components/shared/product/PageHeader'
import { PageLoader } from '@/components/shared/page-loader/PageLoader'
import { RequestRecovery } from '@/components/shared/product/RequestRecovery'
import { createBankAccount, getBankAccounts } from '@/services/adminService'
import { isValidSession } from '@/services/authService'
import { validateBankAccount } from '@/lib/bank-accounts'
import { notify } from '@/lib/notify'

const empty: CreateBankAccountRequest = { bankName: '', accountName: '', accountNumber: '' }

function BankAccountWorkspace({ session, preview }: { session: AuthSession | null; preview: boolean }) {
  const [query, setQuery] = useState<BankAccountListQuery>({ page: 1, sort: 'newest', isActive: true })
  const [data, setData] = useState<BankAccountListData | null>(null)
  const [loading, setLoading] = useState(!preview)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState(empty)
  const [errors, setErrors] = useState<BankAccountErrors>({})
  const [review, setReview] = useState(false)
  const [saving, setSaving] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const submitting = useRef(false)
  const writeController = useRef<AbortController | null>(null)
  useEffect(() => () => writeController.current?.abort(), [])
  useEffect(() => {
    if (preview || !session) return
    const controller = new AbortController()
    getBankAccounts(session, query, controller.signal).then(result => {
      if (!controller.signal.aborted && isValidSession(session)) { setData(result); setLoading(false) }
    }).catch(error => { if (!controller.signal.aborted) { setLoading(false); setFailed(true); notify.error(error, BANK_ACCOUNT_MESSAGES.unavailable) } })
    return () => controller.abort()
  }, [session, preview, query, attempt])

  function reload() { setLoading(true); setFailed(false); setAttempt(current => current + 1) }
  function filter(next: BankAccountListQuery) { setLoading(!preview); setFailed(false); setData(null); setQuery(next) }
  function prepare(event: FormEvent) {
    event.preventDefault()
    const next = validateBankAccount(input)
    setErrors(next)
    if (Object.keys(next).length) requestAnimationFrame(() => formRef.current?.querySelector<HTMLInputElement>('[aria-invalid="true"]')?.focus())
    else setReview(true)
  }
  async function submit() {
    if (submitting.current || !review || preview || !session) return
    submitting.current = true
    setSaving(true)
    const controller = new AbortController()
    writeController.current = controller
    try {
      await createBankAccount(session, input, controller.signal)
      if (controller.signal.aborted || !isValidSession(session)) return
      setOpen(false)
      setInput(empty)
      setReview(false)
      notify.success(BANK_ACCOUNT_MESSAGES.saved)
      filter({ ...query, page: 1, isActive: true })
      setAttempt(current => current + 1)
    } catch (error) { if (!controller.signal.aborted) notify.error(error, BANK_ACCOUNT_MESSAGES.saveFailed) }
    finally { submitting.current = false; if (!controller.signal.aborted) setSaving(false) }
  }
  const locked = loading || failed
  const first = data?.count ? (data.page - 1) * PAGE_SIZES.bankAccounts + 1 : 0
  return <div className="page-stack">
    <PageHeader title={PAGE_LABELS.bankAccounts} description="Manage the cooperative bank accounts used for member payments." actions={<Button onClick={() => { setInput(empty); setErrors({}); setReview(false); setOpen(true) }}><Plus aria-hidden="true" />Add bank account</Button>} />
    <Card className="product-card">
      <div className="card-heading"><h2 className="type-title">Cooperative bank accounts</h2>{!preview && <Button variant="outline" disabled={locked} onClick={reload}><RefreshCw aria-hidden="true" />Refresh</Button>}</div>
      <div className="form-grid"><FormField label="Status">{bindings => <NativeSelect {...bindings} value={String(query.isActive)} disabled={!preview && locked} onChange={event => filter({ ...query, page: 1, isActive: event.target.value === 'true' })}><option value="true">Active</option><option value="false">Inactive</option></NativeSelect>}</FormField><FormField label="Sort">{bindings => <NativeSelect {...bindings} value={query.sort} disabled={!preview && locked} onChange={event => filter({ ...query, page: 1, sort: event.target.value as BankAccountListQuery['sort'] })}>{Object.entries(BANK_ACCOUNT_SORTS).map(([value, item]) => <option key={value} value={value}>{item.label}</option>)}</NativeSelect>}</FormField></div>
      {failed && <RequestRecovery stale={!!data} onRetry={reload} />}
      {loading && !data && !preview ? <PageLoader /> : <div className="table-region" role="region" aria-label="Bank accounts" tabIndex={0} aria-busy={loading && !preview || undefined}><Table><TableCaption className="sr-only">Cooperative banks, account names, numbers and status</TableCaption><TableHeader><TableRow><TableHead>Bank</TableHead><TableHead>Account name</TableHead><TableHead>Account number</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{data?.pageData.length ? data.pageData.map(bank => <TableRow key={bank.id}><TableCell>{bank.bankName}</TableCell><TableCell>{bank.accountName}</TableCell><TableCell className="financial">{bank.accountNumber}</TableCell><TableCell><Badge tone={bank.isActive ? 'success' : 'warning'}>{bank.isActive ? 'Active' : 'Inactive'}</Badge></TableCell></TableRow>) : <TableRow><TableCell colSpan={4}><div className="empty-state"><Landmark aria-hidden="true" /><p>{preview ? 'Bank account layout preview. No account records.' : failed ? 'Bank account records could not be loaded.' : 'No ' + (query.isActive ? 'active' : 'inactive') + ' bank accounts.'}</p></div></TableCell></TableRow>}</TableBody></Table></div>}
      {data && data.totalItems > 0 && <nav className="pagination" aria-label="Bank account pagination"><p className="type-label" role="status">{first}–{first ? first + data.count - 1 : 0} of {data.totalItems}</p><div className="pagination-controls"><Button variant="outline" disabled={locked || query.page <= 1} onClick={() => filter({ ...query, page: query.page - 1 })}>{COMMON_LABELS.previous}</Button><span className="type-label">Page {query.page} of {data.totalPages}</span><Button variant="outline" disabled={locked || query.page >= data.totalPages} onClick={() => filter({ ...query, page: query.page + 1 })}>{COMMON_LABELS.next}</Button></div></nav>}
    </Card>
    <Dialog open={open} onOpenChange={setOpen} title="Add bank account" description={review ? 'Confirm the bank and account details before creating this account.' : 'Enter the cooperative bank account details.'} busy={saving} footer={review ? <Button loading={saving} disabled={preview || !session} onClick={submit}>Create bank account</Button> : <Button type="submit" form="bank-account-form">Review details</Button>}>
      {review ? <><dl className="detail-list"><div><dt>Bank</dt><dd>{input.bankName.trim()}</dd></div><div><dt>Account name</dt><dd>{input.accountName.trim()}</dd></div><div><dt>Account number</dt><dd className="financial">{input.accountNumber.trim()}</dd></div></dl>{preview && <p>Sign in as an administrator to create this bank account.</p>}<Button variant="outline" disabled={saving} onClick={() => setReview(false)}>Back to details</Button></> : <form ref={formRef} id="bank-account-form" className="settings-form" noValidate onSubmit={prepare}>
        <FormField label="Bank name" error={errors.bankName}>{bindings => <Input {...bindings} name="bankName" required value={input.bankName} onChange={event => { setInput({ ...input, bankName: event.target.value }); setErrors(current => ({ ...current, bankName: undefined })) }} />}</FormField>
        <FormField label="Account name" error={errors.accountName}>{bindings => <Input {...bindings} name="accountName" required value={input.accountName} onChange={event => { setInput({ ...input, accountName: event.target.value }); setErrors(current => ({ ...current, accountName: undefined })) }} />}</FormField>
        <FormField label="Account number" error={errors.accountNumber}>{bindings => <Input {...bindings} name="accountNumber" inputMode="numeric" required value={input.accountNumber} onChange={event => { setInput({ ...input, accountNumber: event.target.value }); setErrors(current => ({ ...current, accountNumber: undefined })) }} />}</FormField>
      </form>}
    </Dialog>
  </div>
}

export function BankAccounts() {
  const { session } = useAuth()
  const { preview, basePath } = useProduct()
  return <BankAccountWorkspace key={basePath + ':' + (preview ? 'preview' : session?.accessToken) + ':' + session?.user.id} session={preview ? null : session} preview={preview} />
}
