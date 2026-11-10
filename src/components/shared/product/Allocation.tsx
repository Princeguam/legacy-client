import { Currency } from '@/components/shared/currency/currency'
import type { Holding } from '@/lib/product-data'

export function Allocation({ holdings }: { holdings: Holding[] }) {
  const total = holdings.reduce((sum, holding) => sum + holding.amount, 0)
  return <><div className="allocation-bar" aria-hidden="true">{holdings.map(holding => <span key={holding.id} className="allocation-segment" style={{ width: `${holding.amount / total * 100}%` }} />)}</div><dl className="detail-list">{holdings.map(holding => <div key={holding.id}><dt>{holding.name} <span className="type-caption">({new Intl.NumberFormat('en-NG', { style: 'percent', maximumFractionDigits: 1 }).format(holding.amount / total)})</span></dt><dd><Currency value={holding.amount} /></dd></div>)}</dl></>
}
