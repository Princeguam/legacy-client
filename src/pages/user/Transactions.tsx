import { useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { Download, Plus, Search } from 'lucide-react'
import { Button } from '@/components/shared/Button'
import { Card } from '@/components/shared/ui/card'
import { Input } from '@/components/shared/ui/input'
import { NativeSelect } from '@/components/shared/ui/native-select'
import { FormField } from '@/components/shared/form-field/form-field'
import { Currency } from '@/components/shared/currency/currency'
import { PageHeader } from '@/components/shared/product/PageHeader'
import { TransactionDraftList } from '@/components/shared/product/TransactionDraftList'
import { TransactionList } from '@/components/shared/product/TransactionList'
import { useProduct } from '@/components/shared/product/product-context'
import { filterTransactions, getTransactions } from '@/lib/product-data'

function csvCell(value: string | number) {
  const safe = String(value).replace(/^[=+@-]/, "'$&")
  return `"${safe.replaceAll('"', '""')}"`
}
export function Transactions() {
  const { role, basePath } = useProduct()
  const location = useLocation()
  const [params, setParams] = useSearchParams()
  const [page, setPage] = useState(1)
  const [downloaded, setDownloaded] = useState(false)
  const filters = { query: params.get('q') ?? '', status: params.get('status') ?? '', type: params.get('type') ?? '', start: params.get('start') ?? '', end: params.get('end') ?? '' }
  const invalidRange = Boolean(filters.start && filters.end && filters.start > filters.end)
  const rows = invalidRange ? [] : filterTransactions(getTransactions(role), filters)
  const pages = Math.max(1, Math.ceil(rows.length / 10)), currentPage = Math.min(page, pages)
  const selected = rows.slice((currentPage - 1) * 10, currentPage * 10)
  const confirmed = rows.filter(row => row.status === 'Completed')
  const inflow = confirmed.filter(row => row.direction === 'in').reduce((sum, row) => sum + row.amount, 0)
  const outflow = confirmed.filter(row => row.direction === 'out').reduce((sum, row) => sum + row.amount, 0)
  function filter(key: string, value: string) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value); else next.delete(key)
    setParams(next, { replace: true }); setPage(1); setDownloaded(false)
  }
  function download() {
    const csv = [['Illustrative transactions — not a financial statement'], ['Reference', 'Date', 'Description', 'Member ID', 'Type', 'Status', 'Direction', 'Amount', 'Currency'], ...rows.map(row => [row.reference, row.date, row.description, row.memberId ?? 'Cooperative', row.type, row.status, row.direction, row.amount, 'NGN'])].map(row => row.map(csvCell).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a'); link.href = url; link.download = `legacy-wealth-illustrative-${role === 'Admin' ? 'cooperative' : 'member'}-transactions.csv`; link.click(); URL.revokeObjectURL(url); setDownloaded(true)
  }
  return <div className="page-stack"><PageHeader title="Transactions" description={role === 'Admin' ? 'A complete view of illustrative cooperative contributions, investments, and spending.' : 'Follow your contributions and investment allocations.'} actions={<>{role === 'user' && <Link className="action-link" to={`${basePath}/transactions/new`}><Plus aria-hidden="true" />Add transaction</Link>}<Button variant="outline" disabled={!rows.length || invalidRange} onClick={download}><Download aria-hidden="true" />Export sample CSV</Button></>} />
    {role === 'user' && <>{location.state?.draftSaved && <p role="status" className="type-label">Transaction draft saved locally. It has not been submitted.</p>}<TransactionDraftList /></>}
    <Card className="product-card"><div className="filters-grid"><FormField label="Search transactions">{bindings => <div className="filter-search"><Search aria-hidden="true" /><Input {...bindings} type="search" value={filters.query} onChange={event => filter('q', event.target.value)} placeholder="Description, reference, or member" /></div>}</FormField><FormField label="Status">{bindings => <NativeSelect {...bindings} value={filters.status} onChange={event => filter('status', event.target.value)}><option value="">All statuses</option><option>Completed</option><option>Pending</option></NativeSelect>}</FormField><FormField label="Type">{bindings => <NativeSelect {...bindings} value={filters.type} onChange={event => filter('type', event.target.value)}><option value="">All types</option><option>Contribution</option><option>Investment</option>{role === 'Admin' && <option>Expense</option>}</NativeSelect>}</FormField></div>
      <div className="date-filters"><FormField label="From date" hint="Inclusive date, in 2026.">{bindings => <Input {...bindings} type="date" min="2026-01-01" max="2026-11-10" value={filters.start} onChange={event => filter('start', event.target.value)} />}</FormField><FormField label="To date" hint="Inclusive date, in 2026." error={invalidRange ? 'The end date must be on or after the start date.' : undefined}>{bindings => <Input {...bindings} type="date" min="2026-01-01" max="2026-11-10" value={filters.end} onChange={event => filter('end', event.target.value)} />}</FormField></div><div className="inline-actions"><Button variant="ghost" onClick={() => { setParams({}); setPage(1); setDownloaded(false) }}>Clear filters</Button><span className="type-label" role="status">{invalidRange ? 'Choose a valid date range.' : `${rows.length} matching transactions`}</span></div>
    </Card>
    <Card className="product-card"><div className="card-heading"><div><h2 className="type-title">Transaction history</h2><p className="type-label">Completed inflows: <Currency value={inflow} /> · outflows: <Currency value={outflow} /> for the current filters.</p></div></div><TransactionList rows={selected} admin={role === 'Admin'} /><div className="pagination"><p className="type-label" role="status">{rows.length ? `${(currentPage - 1) * 10 + 1}–${Math.min(currentPage * 10, rows.length)} of ${rows.length} records` : '0 records'}</p><nav className="pagination-controls" aria-label="Transaction pagination"><Button variant="outline" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Previous</Button><span className="type-label">Page {currentPage} of {pages}</span><Button variant="outline" disabled={currentPage === pages} onClick={() => setPage(currentPage + 1)}>Next</Button></nav></div></Card>
    {downloaded && <p role="status" className="type-label">Sample CSV downloaded. It contains the current filtered illustrative records.</p>}
  </div>
}
