import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Building2, Landmark, Sprout } from 'lucide-react'
import { Button } from '@/components/shared/Button'
import { Dialog } from '@/components/shared/ui/dialog'
import { Card } from '@/components/shared/ui/card'
import { Badge } from '@/components/shared/ui/badge'
import { MetricCard } from '@/components/shared/metric-card/metric-card'
import { Currency } from '@/components/shared/currency/currency'
import { PageHeader } from '@/components/shared/product/PageHeader'
import { Allocation } from '@/components/shared/product/Allocation'
import { useProduct } from '@/components/shared/product/product-context'
import { cooperativeHoldings, personalHoldings, getSummary, type Holding } from '@/lib/product-data'

const icons = [Landmark, Building2, Sprout]
export function Portfolio() {
  const { role, basePath } = useProduct()
  const summary = getSummary(role)
  const holdings = role === 'Admin' ? cooperativeHoldings : personalHoldings
  const [selected, setSelected] = useState<Holding | null>(null)
  return <div className="page-stack"><PageHeader title={role === 'Admin' ? 'Cooperative portfolio' : 'Your portfolio'} description="See where contributions have been allocated. All holdings are illustrative." actions={<Link to={`${basePath}/transactions?type=Investment`} className="action-link">Investment activity<ArrowRight aria-hidden="true" /></Link>} />
    <div className="metrics-grid"><MetricCard label="Total allocated" value={summary.invested} period="Across three illustrative funds" /><MetricCard label="Available cash" value={summary.cash} period="Contributions less investments and spending" /><MetricCard label="Investment returns" value={null} period="Returns have not been provided." /></div>
    <div className="dashboard-columns"><Card className="product-card"><h2 className="type-title">Allocation breakdown</h2><Allocation holdings={holdings} /><p className="type-label">Allocation percentages describe invested capital. Available cash is separate.</p></Card><Card className="product-card"><h2 className="type-title">A considered approach</h2><p>Contributions are allocated across fixed income, property, and enterprise funds.</p><p className="type-label">These examples describe allocation only. Valuations, maturity dates, and returns are unavailable.</p><Badge tone="info">Illustrative holdings</Badge></Card></div>
    <div className="holdings-grid">{holdings.map((holding, index) => { const Icon = icons[index]; return <Card key={holding.id} className="product-card"><div className="card-heading"><span className="holding-icon"><Icon aria-hidden="true" size={24} /></span><Badge icon={false}>{holding.category}</Badge></div><div><h2 className="type-title">{holding.name}</h2><p className="type-label">Illustrative invested capital</p></div><Currency className="holding-value" value={holding.amount} /><p className="type-label">{role === 'Admin' ? `Cooperative allocation to ${holding.name.toLowerCase()}.` : holding.note}</p><Button variant="outline" onClick={() => setSelected(holding)}>View fund details</Button></Card> })}</div>
    <Dialog open={selected !== null} onOpenChange={open => { if (!open) setSelected(null) }} title={selected?.name ?? 'Fund details'} description="Illustrative allocation. No investment is placed from this view.">{selected && <dl className="detail-list"><div><dt>Fund identifier</dt><dd className="financial">{selected.id}</dd></div><div><dt>Category</dt><dd>{selected.category}</dd></div><div><dt>Allocated capital</dt><dd><Currency value={selected.amount} /></dd></div><div><dt>Share of invested capital</dt><dd>{new Intl.NumberFormat('en-NG', { style: 'percent', maximumFractionDigits: 1 }).format(selected.amount / summary.invested)}</dd></div><div><dt>Valuation</dt><dd>Not available</dd></div><div><dt>Returns</dt><dd>Not available</dd></div><div><dt>Maturity date</dt><dd>Not available</dd></div></dl>}</Dialog>
  </div>
}
