import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Search } from 'lucide-react'
import { Button } from '@/components/shared/Button'
import { Card } from '@/components/shared/ui/card'
import { Badge } from '@/components/shared/ui/badge'
import { Input } from '@/components/shared/ui/input'
import { NativeSelect } from '@/components/shared/ui/native-select'
import { Progress } from '@/components/shared/ui/progress'
import { FormField } from '@/components/shared/form-field/form-field'
import { MetricCard } from '@/components/shared/metric-card/metric-card'
import { Currency } from '@/components/shared/currency/currency'
import { PageHeader } from '@/components/shared/product/PageHeader'
import { TransactionList } from '@/components/shared/product/TransactionList'
import { Allocation } from '@/components/shared/product/Allocation'
import { useProduct } from '@/components/shared/product/product-context'
import { filterTransactions, formatDate, getMemberSummary, getMemberTransactions, members, personalHoldings, previewMemberId, type Member } from '@/lib/product-data'

export function MemberDetails() {
  const { memberId } = useParams()
  const { basePath } = useProduct()
  const member = members.find(person => person.id === memberId)
  if (!member) return <div className="page-stack"><Link to={`${basePath}/members`} className="standalone-link"><ArrowLeft size={20} aria-hidden="true" />Back to members</Link><PageHeader title="Member not found" description="This member record is unavailable. Return to the directory to choose a member." /></div>
  return <MemberRecord key={member.id} member={member} />
}
function MemberRecord({ member }: { member: Member }) {
  const { basePath } = useProduct()
  const summary = getMemberSummary(member.id)!
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [type, setType] = useState('')
  const [page, setPage] = useState(1)
  const rows = filterTransactions(getMemberTransactions(member.id), { query, status, type, start: '', end: '' })
  const pages = Math.max(1, Math.ceil(rows.length / 10)), current = Math.min(page, pages)
  const displayed = rows.slice((current - 1) * 10, current * 10)
  return <div className="page-stack"><Link to={`${basePath}/members`} className="standalone-link type-label"><ArrowLeft size={20} aria-hidden="true" />Back to members</Link><PageHeader title={`${member.firstName} ${member.lastName}`} description={`Member ${member.id} · illustrative membership record`} actions={<Link to={`${basePath}/transactions?q=${encodeURIComponent(member.id)}`} className="action-link">Open transaction ledger<ArrowRight aria-hidden="true" /></Link>} />
    <Card className="product-card"><div className="profile-summary"><span className="avatar" aria-hidden="true">{member.firstName[0]}{member.lastName[0]}</span><div><h2 className="type-heading">{member.firstName} {member.lastName}</h2><p>{member.email}</p><div><Badge tone={member.status === 'Active' ? 'success' : 'warning'}>{member.status}</Badge> <Badge icon={false}>Sample member</Badge></div></div></div></Card>
    <div className="metrics-grid metrics-grid-four"><MetricCard label="Confirmed contributions" value={summary.contributed} period="2026 · completed contribution records" /><MetricCard label="Remaining annual commitment" value={summary.remaining} period={summary.target === null ? 'Member is not enrolled in an annual commitment.' : '2026 annual commitment'} /><MetricCard label="Pending contributions" value={summary.pending} period="Excluded from confirmed totals" /><MetricCard label="Investment allocation" value={summary.invested} period={summary.invested === null ? 'Allocation data has not been provided.' : 'Across three illustrative cooperative funds'} /></div>
    <div className="dashboard-columns"><Card className="product-card"><h2 className="type-title">Member information</h2><dl className="profile-fields"><div><dt>First name</dt><dd>{member.firstName}</dd></div><div><dt>Last name</dt><dd>{member.lastName}</dd></div><div><dt>Email address</dt><dd>{member.email}</dd></div><div><dt>Phone number</dt><dd>{member.phone}</dd></div><div><dt>Member identifier</dt><dd className="financial">{member.id}</dd></div><div><dt>Joined</dt><dd>{formatDate(member.joined)}</dd></div><div><dt>Membership status</dt><dd>{member.status}</dd></div><div><dt>Account role</dt><dd>Member</dd></div></dl></Card><Card className="product-card"><h2 className="type-title">Annual commitment</h2>{summary.target === null ? <p>This member has not been enrolled in the annual contribution plan.</p> : <><dl className="detail-list"><div><dt>2026 target</dt><dd><Currency value={summary.target} /></dd></div><div><dt>Illustrative monthly contribution</dt><dd><Currency value={member.monthly} /></dd></div><div><dt>Confirmed to date</dt><dd><Currency value={summary.contributed} /></dd></div></dl><Progress label={`${member.firstName}’s annual contribution progress`} value={summary.contributed} max={summary.target} /><p className="type-label">Pending contributions are excluded until confirmed.</p></>}</Card></div>
    <Card className="product-card"><div className="card-heading"><div><h2 className="type-title">Transaction history</h2><p className="type-label">Only {member.firstName}’s illustrative contributions and allocations appear here.</p></div></div><div className="filters-grid"><FormField label="Search member transactions">{bindings => <div className="filter-search"><Search aria-hidden="true" /><Input {...bindings} type="search" placeholder="Description or reference" value={query} onChange={event => { setQuery(event.target.value); setPage(1) }} /></div>}</FormField><FormField label="Transaction status">{bindings => <NativeSelect {...bindings} value={status} onChange={event => { setStatus(event.target.value); setPage(1) }}><option value="">All statuses</option><option>Completed</option><option>Pending</option></NativeSelect>}</FormField><FormField label="Transaction type">{bindings => <NativeSelect {...bindings} value={type} onChange={event => { setType(event.target.value); setPage(1) }}><option value="">All types</option><option>Contribution</option><option>Investment</option></NativeSelect>}</FormField></div><div className="inline-actions"><Button variant="ghost" onClick={() => { setQuery(''); setStatus(''); setType(''); setPage(1) }}>Clear filters</Button><span className="type-label" role="status">{rows.length} matching records</span></div><TransactionList rows={displayed} /><div className="pagination"><p className="type-label">{rows.length ? `${(current - 1) * 10 + 1}–${Math.min(current * 10, rows.length)} of ${rows.length} records` : '0 records'}</p><nav className="pagination-controls" aria-label="Member transaction pagination"><Button variant="outline" disabled={current === 1} onClick={() => setPage(current - 1)}>Previous</Button><span className="type-label">Page {current} of {pages}</span><Button variant="outline" disabled={current === pages} onClick={() => setPage(current + 1)}>Next</Button></nav></div></Card>
    <Card className="product-card"><h2 className="type-title">Investment information</h2>{member.id === previewMemberId ? <><Allocation holdings={personalHoldings} /><dl className="detail-list"><div><dt>Illustrative available cash</dt><dd><Currency value={summary.cash!} /></dd></div><div><dt>Returns and current valuations</dt><dd>Not provided</dd></div></dl></> : <p>Investment allocations, cash balances, and returns have not been provided for this sample member.</p>}</Card>
  </div>
}
