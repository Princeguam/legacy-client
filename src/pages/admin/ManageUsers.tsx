import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, Users } from 'lucide-react'
import { Button } from '@/components/shared/Button'
import { Card } from '@/components/shared/ui/card'
import { Badge } from '@/components/shared/ui/badge'
import { Input } from '@/components/shared/ui/input'
import { NativeSelect } from '@/components/shared/ui/native-select'
import { FormField } from '@/components/shared/form-field/form-field'
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell, TableCaption } from '@/components/shared/Table'
import { Currency } from '@/components/shared/currency/currency'
import { PageHeader } from '@/components/shared/product/PageHeader'
import { useProduct } from '@/components/shared/product/product-context'
import { members, memberContributed, annualTarget } from '@/lib/product-data'

export function ManageUsers() {
  const { basePath } = useProduct()
  const [params, setParams] = useSearchParams()
  const [page, setPage] = useState(1)
  const query = params.get('q') ?? '', status = params.get('status') ?? '', sort = params.get('sort') ?? 'name'
  const filtered = members.filter(member => (!status || member.status === status) && `${member.firstName} ${member.lastName} ${member.id} ${member.email}`.toLowerCase().includes(query.trim().toLowerCase())).sort((a, b) => sort === 'contributions' ? memberContributed(b.id) - memberContributed(a.id) : a.firstName.localeCompare(b.firstName))
  const pages = Math.max(1, Math.ceil(filtered.length / 8)), current = Math.min(page, pages)
  const displayed = filtered.slice((current - 1) * 8, current * 8)
  function filter(key: string, value: string) { const next = new URLSearchParams(params); if (value) next.set(key, value); else next.delete(key); setParams(next, { replace: true }); setPage(1) }
  return <div className="page-stack"><PageHeader title="Members" description="A directory of illustrative cooperative members and their contribution progress." />
    <div className="metrics-grid"><Card className="product-card"><h2 className="type-label">Total members</h2><span className="summary-number">{members.length}</span></Card><Card className="product-card"><h2 className="type-label">Active members</h2><span className="summary-number">{members.filter(member => member.status === 'Active').length}</span></Card><Card className="product-card"><h2 className="type-label">Pending membership</h2><span className="summary-number">{members.filter(member => member.status === 'Pending').length}</span></Card></div>
    <Card className="product-card"><div className="filters-grid"><FormField label="Search members">{bindings => <div className="filter-search"><Search aria-hidden="true" /><Input {...bindings} type="search" placeholder="Name, email, or member ID" value={query} onChange={event => filter('q', event.target.value)} /></div>}</FormField><FormField label="Membership status">{bindings => <NativeSelect {...bindings} value={status} onChange={event => filter('status', event.target.value)}><option value="">All statuses</option><option>Active</option><option>Pending</option></NativeSelect>}</FormField><FormField label="Sort members">{bindings => <NativeSelect {...bindings} value={sort} onChange={event => filter('sort', event.target.value)}><option value="name">Name (A–Z)</option><option value="contributions">Highest contributions</option></NativeSelect>}</FormField></div>
    <div className="card-heading"><h2 className="type-title">Member directory</h2><Button variant="ghost" onClick={() => { setParams({}); setPage(1) }}>Clear filters</Button></div>
    <div className="table-region transactions-table" role="region" aria-label="Member directory" tabIndex={0}><Table><TableCaption className="sr-only">Illustrative members and 2026 contributions in Nigerian naira</TableCaption><TableHeader><TableRow><TableHead>Member</TableHead><TableHead>Status</TableHead><TableHead className="numeric">Contributed</TableHead><TableHead>Annual progress</TableHead><TableHead>Details</TableHead></TableRow></TableHeader><TableBody>{displayed.map(member => <TableRow key={member.id}><TableCell><div className="cell-stack"><Link className="member-name-link" to={`${basePath}/members/${encodeURIComponent(member.id)}`}>{member.firstName} {member.lastName}</Link><span className="financial type-caption">{member.id}</span></div></TableCell><TableCell><Badge tone={member.status === 'Active' ? 'success' : 'warning'}>{member.status}</Badge></TableCell><TableCell className="numeric"><Currency value={memberContributed(member.id)} /></TableCell><TableCell>{member.status === 'Active' ? new Intl.NumberFormat('en-NG', { style: 'percent', maximumFractionDigits: 1 }).format(memberContributed(member.id) / annualTarget) : 'Not enrolled'}</TableCell><TableCell><Link className="member-view-link" to={`${basePath}/members/${encodeURIComponent(member.id)}`} aria-label={`View ${member.firstName} ${member.lastName}`}>View</Link></TableCell></TableRow>)}</TableBody></Table></div>
    <div className="transaction-mobile-list">{displayed.map(member => <article key={member.id} className="record-card"><div className="record-card-heading"><h3 className="type-title"><Link className="member-name-link" to={`${basePath}/members/${encodeURIComponent(member.id)}`}>{member.firstName} {member.lastName}</Link></h3><Badge tone={member.status === 'Active' ? 'success' : 'warning'}>{member.status}</Badge></div><dl className="detail-list"><div><dt>Member ID</dt><dd className="financial">{member.id}</dd></div><div><dt>Contributed</dt><dd><Currency value={memberContributed(member.id)} /></dd></div><div><dt>Annual progress</dt><dd>{member.status === 'Active' ? new Intl.NumberFormat('en-NG', { style: 'percent', maximumFractionDigits: 1 }).format(memberContributed(member.id) / annualTarget) : 'Not enrolled'}</dd></div></dl><Link className="member-view-link" to={`${basePath}/members/${encodeURIComponent(member.id)}`} aria-label={`View ${member.firstName} ${member.lastName}`}>View member</Link></article>)}</div>
    {!filtered.length && <div className="empty-state"><Users aria-hidden="true" /><h3 className="type-title">No members found</h3><p>Try a different name or membership status.</p></div>}
    <div className="pagination"><p className="type-label" role="status">{filtered.length} matching members</p><nav className="pagination-controls" aria-label="Member pagination"><Button variant="outline" disabled={current === 1} onClick={() => setPage(current - 1)}>Previous</Button><span className="type-label">Page {current} of {pages}</span><Button variant="outline" disabled={current === pages} onClick={() => setPage(current + 1)}>Next</Button></nav></div></Card>

  </div>
}
