import { notify } from '@/lib/notify'
import { RequestRecovery } from '@/components/shared/product/RequestRecovery'
import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { COMMON_LABELS, PAYMENT_MESSAGES, USER_ROLES } from '@/constants/strings'
import { PAGE_SIZES } from '@/constants/values'
import type { AuthSession } from '@/types/Auth'
import type { ApiTransaction, TransactionListData, TransactionListQuery } from '@/types/transaction'
import { useProduct } from '@/components/shared/product/product-context'
import { Button } from '@/components/shared/Button'
import { Card } from '@/components/shared/ui/card'
import { PageLoader } from '@/components/shared/page-loader/PageLoader'
import { Dialog } from '@/components/shared/ui/dialog'
import { TransactionList } from '@/components/shared/product/TransactionList'
import { TransactionDetails } from './TransactionDetails'
import { isValidSession } from '@/services/authService'
import { getTransactions } from '@/services/userService'
import { getMemberTransactions, getTransactions as getAdminTransactions } from '@/services/adminService'

export function TransactionHistory({ session, preview, query, memberId, onPageChange, onNotice }: { session: AuthSession | null; preview: boolean; memberId?: number; query: TransactionListQuery; onPageChange: (page: number) => void; onNotice: (message: string) => void }) {
  const [data, setData] = useState<TransactionListData | null>(preview ? { page: 1, count: 0, totalItems: 0, totalPages: 0, pageData: [] } : null)
  const [loading, setLoading] = useState(!preview)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [selected, setSelected] = useState<ApiTransaction | null>(null)
  const { role } = useProduct()
  const admin = role === USER_ROLES.admin
  useEffect(() => {
    if (preview || !session) return
    const controller = new AbortController()
    const request = memberId !== undefined ? getMemberTransactions(session, memberId, query, controller.signal) : admin ? getAdminTransactions(session, query, controller.signal) : getTransactions(session.accessToken, session.user, query, controller.signal)
    request.then(result => {
      if (controller.signal.aborted || !isValidSession(session)) return
      setData(result)
      setLoading(false)
    }).catch(error => { if (!controller.signal.aborted) { setError('failed'); notify.error(error, PAYMENT_MESSAGES.loadFailed); setLoading(false) } })
    return () => controller.abort()
  }, [session, admin, preview, query, memberId, attempt])

  function refresh() { setError(''); setLoading(true); setAttempt(value => value + 1) }
  const invalidPage = data && query.page > Math.max(1, data.totalPages)
  return <><Card className="product-card transaction-history" aria-busy={loading || undefined}>
    <div className="card-heading"><h2 className="type-title">{COMMON_LABELS.transactionHistory}</h2>{!preview && <Button variant="outline" loading={loading} onClick={refresh}><RefreshCw aria-hidden="true" />Refresh</Button>}</div>
    {error && <RequestRecovery stale={!!data} onRetry={refresh} />}
    {loading && <PageLoader />}
    {data && <>
      <TransactionList rows={data.pageData} admin={admin && memberId === undefined} disabled={loading || !!error} onSelect={setSelected} />
      {invalidPage ? <Button variant="outline" onClick={() => onPageChange(Math.max(1, data.totalPages))}>Go to the last available page</Button> : data.totalPages > 0 && <div className="pagination"><p className="type-label" role="status">{(query.page - 1) * PAGE_SIZES.transactions + 1}–{(query.page - 1) * PAGE_SIZES.transactions + data.count} of {data.totalItems} transactions{error ? ' · last loaded results' : ''}</p><nav className="pagination-controls" aria-label="Transaction pagination"><Button variant="outline" disabled={loading || !!error || query.page === 1} onClick={() => onPageChange(query.page - 1)}>{COMMON_LABELS.previous}</Button><span className="type-label">Page {query.page} of {data.totalPages}</span><Button variant="outline" disabled={loading || !!error || query.page >= data.totalPages} onClick={() => onPageChange(query.page + 1)}>{COMMON_LABELS.next}</Button></nav></div>}
    </>}
  </Card>
  <Dialog size="wide" open={selected !== null} onOpenChange={open => { if (!open) setSelected(null) }} title={COMMON_LABELS.transactionDetails} description="Payment details from the cooperative record.">{selected && session && <TransactionDetails key={selected.id} id={selected.id} session={session} memberId={memberId} onReviewed={message => { onNotice(message); refresh() }} />}</Dialog>
  </>
}

