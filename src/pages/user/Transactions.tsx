import { notify } from '@/lib/notify'
import { useMemo } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { COMMON_LABELS, PAGE_LABELS, PAGE_PATHS, PAYMENT_MESSAGES, USER_ROLES } from '@/constants/strings'
import { useAuth } from '@/context/useAuth'
import { useProduct } from '@/components/shared/product/product-context'
import { Card } from '@/components/shared/ui/card'
import { Currency } from '@/components/shared/currency/currency'
import { MetricCard } from '@/components/shared/metric-card/metric-card'
import { PageHeader } from '@/components/shared/product/PageHeader'
import { Alert } from '@/components/shared/ui/alert'
import { TransactionDraftList } from '@/components/shared/product/TransactionDraftList'
import { paymentQuery, paymentQueryError } from '@/lib/transactions'
import { TransactionHistory } from '@/components/shared/transactions/TransactionHistory'
import { TransactionFilters } from '@/components/shared/transactions/TransactionFilters'
import './Transactions.css'


export function Transactions() {
  const { role, preview, basePath } = useProduct()
  const { session } = useAuth()
  const location = useLocation()
  const [params, setParams] = useSearchParams()
  const query = useMemo(() => paymentQuery(params, role), [params, role])
  const queryError = paymentQueryError(query)
  function filter(key: string, value: string) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value); else next.delete(key)
    next.delete('page')
    setParams(next, { replace: true })
  }
  function changePage(page: number) { const next = new URLSearchParams(params); next.set('page', String(page)); setParams(next) }
  return <div className="page-stack transactions-page"><PageHeader title={PAGE_LABELS.transactions} description="Review recorded payments and their status." actions={<Link className="action-link" to={`${basePath}/${PAGE_PATHS.addTransaction}`}><Plus aria-hidden="true" />{preview && role === USER_ROLES.user ? 'Add transaction draft' : PAGE_LABELS.addTransaction}</Link>} />
    {location.state?.draftSaved && <p role="status" className="type-label">Transaction draft saved locally. It has not been submitted.</p>}
    <section className="transaction-summary" aria-label="Annual contribution overview"><div className="metrics-grid transaction-summary-grid"><MetricCard label={COMMON_LABELS.confirmedContributions} value={0} period={PAYMENT_MESSAGES.placeholder} /><MetricCard label={COMMON_LABELS.remainingForYear} value={0} period={PAYMENT_MESSAGES.placeholder} /><MetricCard label={COMMON_LABELS.pendingContributions} value={0} period={PAYMENT_MESSAGES.placeholder} /></div><Card className="product-card transaction-commitment"><div><h2 className="type-title">Annual commitment</h2><p className="type-label">Annual target: <Currency value={0} /></p></div><p className="type-label">Contribution totals and annual progress are not available yet. These zeros are placeholders.</p></Card></section>
    <TransactionFilters admin={role === USER_ROLES.admin} query={query} queryError={queryError} searchValue={params.get('q') ?? ''} filter={filter} onClear={() => setParams({})} />
    {queryError ? <Alert tone="danger" title="Check the date range" role="alert">{queryError}</Alert> : <TransactionHistory key={`${preview ? 'preview' : session?.accessToken}:${session?.user.id}:${role}:${basePath}:${JSON.stringify(query)}`} session={preview ? null : session} preview={preview} query={query} onPageChange={changePage} onNotice={notify.success} />}
    {preview && role === USER_ROLES.user && <TransactionDraftList />}
  </div>
}
