import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Card } from '@/components/shared/ui/card'
import { Currency } from '@/components/shared/currency/currency'
import { MetricCard } from '@/components/shared/metric-card/metric-card'
import { Progress } from '@/components/shared/ui/progress'
import { PageHeader } from '@/components/shared/product/PageHeader'
import { TransactionList } from '@/components/shared/product/TransactionList'
import { useProduct } from '@/components/shared/product/product-context'
import { getSummary, getTransactions } from '@/lib/product-data'

export function Contributions() {
  const { role, basePath } = useProduct()
  const summary = getSummary(role), rows = getTransactions(role).filter(row => row.type === 'Contribution')
  const pending = rows.filter(row => row.status === 'Pending').reduce((sum, row) => sum + row.amount, 0)
  return <div className="page-stack"><PageHeader title="Contributions" description={role === 'Admin' ? 'Track cooperative funding against the active members’ annual commitments.' : 'Every contribution is a step toward your annual commitment.'} actions={<Link to={`${basePath}/transactions?type=Contribution`} className="action-link">View all records<ArrowRight aria-hidden="true" /></Link>} />
    <div className="metrics-grid"><MetricCard label="Confirmed contributions" value={summary.contributed} period="January–October 2026" /><MetricCard label="Remaining for the year" value={summary.remaining} period="Against the 2026 annual commitment" /><MetricCard label="Pending contributions" value={pending} period="November 2026 · excluded from confirmed totals" /></div>
    <Card className="product-card"><div className="card-heading"><div><h2 className="type-title">Your shared commitment</h2><p className="type-label">2026 annual target: <Currency value={summary.target} /></p></div></div><Progress label={role === 'Admin' ? 'Cooperative annual progress' : 'Your annual progress'} value={summary.contributed} max={summary.target} /><p>{role === 'Admin' ? 'The cooperative' : 'You'} contributed <Currency value={summary.contributed} /> so far. <Currency value={summary.remaining} /> remains for the year.</p><p className="type-label">Pending records do not count until confirmed. Financial figures and commitments are illustrative.</p></Card>
    <Card className="product-card"><div className="card-heading"><h2 className="type-title">Latest contributions</h2><Link to={`${basePath}/transactions?type=Contribution`} className="standalone-link type-label">Full history<ArrowRight size={16} aria-hidden="true" /></Link></div><TransactionList rows={rows.slice(0, 10)} admin={role === 'Admin'} /></Card>
  </div>
}
