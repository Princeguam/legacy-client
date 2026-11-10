import { Link } from 'react-router-dom'
import { ArrowRight, Plus } from 'lucide-react'
import { Card } from '@/components/shared/ui/card'
import { Badge } from '@/components/shared/ui/badge'
import { Progress } from '@/components/shared/ui/progress'
import { Currency } from '@/components/shared/currency/currency'
import { MetricCard } from '@/components/shared/metric-card/metric-card'
import { PageHeader } from '@/components/shared/product/PageHeader'
import { ContributionChart } from '@/components/shared/product/ContributionChart'
import { TransactionList } from '@/components/shared/product/TransactionList'
import { Allocation } from '@/components/shared/product/Allocation'
import { useProduct } from '@/components/shared/product/product-context'
import { getSummary, getTransactions, personalHoldings } from '@/lib/product-data'

export function Dashboard() {
  const { basePath, user } = useProduct()
  const summary = getSummary('user')
  return <div className="page-stack"><PageHeader title={`Welcome back${user?.firstName ? `, ${user.firstName}` : ''}.`} description="A clear view of your contributions and the future you’re building." actions={<Link className="action-link" to={`${basePath}/transactions/new`}><Plus aria-hidden="true" />Add transaction</Link>} />
    <div className="dashboard-columns"><Card className="product-card wealth-card"><div className="card-heading"><p className="type-label">Your total balance</p><Badge icon={false}>Illustrative</Badge></div><Currency className="wealth-value" value={summary.wealth} /><p className="type-label">Contributions less spending · as of 10 November 2026</p><dl className="wealth-breakdown"><div><dt className="type-label">Invested</dt><dd><Currency value={summary.invested} /></dd></div><div><dt className="type-label">Available cash</dt><dd><Currency value={summary.cash} /></dd></div></dl></Card>
      <Card className="product-card card-watermark"><h2 className="type-title">Your annual commitment</h2><div className="goal-summary"><Currency value={summary.contributed} /><p className="type-label">contributed toward <Currency value={summary.target} /></p></div><Progress label="2026 contribution progress" value={summary.contributed} max={summary.target} /><p className="type-label"><Currency value={summary.remaining} /> remaining for the year.</p><Link to={`${basePath}/contributions`} className="standalone-link type-label">View contribution history<ArrowRight size={16} aria-hidden="true" /></Link></Card></div>
    <div className="metrics-grid"><MetricCard label="Total invested" value={summary.invested} period="Across three cooperative funds" /><MetricCard label="Remaining annual contribution" value={summary.remaining} period="2026 annual commitment" /><MetricCard label="Pending contribution" value={80_000} period="November 2026 · illustrative pending record" note="Excluded from your confirmed balance." /></div>
    <ContributionChart />
    <div className="dashboard-columns"><Card className="product-card"><div className="card-heading"><h2 className="type-title">Recent transactions</h2><Link to={`${basePath}/transactions`} className="standalone-link type-label">View all<ArrowRight size={16} aria-hidden="true" /></Link></div><TransactionList rows={getTransactions('user').slice(0, 4)} compact /></Card><Card className="product-card"><h2 className="type-title">Your investment allocation</h2><Allocation holdings={personalHoldings} /><Link to={`${basePath}/portfolio`} className="standalone-link type-label">Explore your portfolio<ArrowRight size={16} aria-hidden="true" /></Link></Card></div>
  </div>
}
