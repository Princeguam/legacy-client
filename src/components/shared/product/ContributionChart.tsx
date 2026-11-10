import { useEffect, useId, useRef, useState } from 'react'
import { Button } from '@/components/shared/Button'
import { Card } from '@/components/shared/ui/card'
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell, TableCaption } from '@/components/shared/Table'
import { Currency } from '@/components/shared/currency/currency'
import { contributionHistory } from '@/lib/product-data'
import { useProduct } from './product-context'

export function ContributionChart() {
  const { role } = useProduct()
  const [range, setRange] = useState('YTD')
  const [showData, setShowData] = useState(false)
  const [chartWidth, setChartWidth] = useState(720)
  const chartRef = useRef<SVGSVGElement>(null)
  useEffect(() => {
    const chart = chartRef.current
    if (!chart || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(entries => {
      const width = entries[0]?.contentRect.width
      if (width) setChartWidth(Math.max(240, Math.round(width)))
    })
    observer.observe(chart)
    return () => observer.disconnect()
  }, [])
  const titleId = useId(), tableId = useId()
  const history = contributionHistory(role)
  const selected = history.slice(range === '3M' ? -3 : range === '6M' ? -6 : 0)
  const max = history.at(-1)!.cumulative
  const plotEnd = chartWidth - 24
  const points = selected.map((item, index) => ({ ...item, x: 80 + index * (plotEnd - 80) / Math.max(1, selected.length - 1), y: 200 - item.cumulative / max * 160 }))
  const compact = (value: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', notation: 'compact', maximumFractionDigits: 1 }).format(value)
  return <Card className="product-card"><div className="card-heading"><div><h2 id={titleId} className="type-title">The long view</h2><p className="type-label">Cumulative contributions · January–October 2026</p></div><div className="segment-group" role="group" aria-label="Chart period">{['3M', '6M', 'YTD'].map(value => <button type="button" key={value} aria-pressed={range === value} onClick={() => setRange(value)}>{value}</button>)}</div></div>
    <figure className="chart-figure" aria-labelledby={titleId}><svg ref={chartRef} className="contribution-chart" viewBox={`0 0 ${chartWidth} 250`} role="img" aria-label={`Illustrative contributions from ${selected[0].label} to October 2026. Full amounts in the data table.`}>
      {[0, 0.5, 1].map(ratio => <g key={ratio}><line className="chart-grid" x1={80} x2={plotEnd} y1={200 - ratio * 160} y2={200 - ratio * 160} /><text className="chart-label" x={0} y={205 - ratio * 160}>{compact(max * ratio)}</text></g>)}
      <polyline key={range} pathLength={1} className="chart-line" points={points.map(point => `${point.x},${point.y}`).join(' ')} />{points.map((point, index) => <g key={point.month}><circle className="chart-point" cx={point.x} cy={point.y} r={3} />{(index === 0 || index === points.length - 1 || (chartWidth >= 480 && index % 2 === 0)) && <text className="chart-label" x={point.x} y={240} textAnchor="middle">{point.label}</text>}</g>)}
    </svg><figcaption className="type-label">Illustrative contributions reached <Currency value={max} /> by October. This shows contributions, without investment returns.</figcaption></figure>
    <Button className="chart-data-toggle" variant="ghost" aria-expanded={showData} aria-controls={tableId} onClick={() => setShowData(!showData)}>{showData ? 'Hide' : 'View'} data table</Button>
    {showData && <div id={tableId} className="table-region" role="region" aria-label="Contribution chart data" tabIndex={0}><Table><TableCaption>Illustrative chart data · {range} · Nigerian naira</TableCaption><TableHeader><TableRow><TableHead>Month</TableHead><TableHead className="numeric">Contributed</TableHead><TableHead className="numeric">Cumulative</TableHead></TableRow></TableHeader><TableBody>{selected.map(item => <TableRow key={item.month}><TableCell>{item.label} 2026</TableCell><TableCell className="numeric"><Currency value={item.amount} /></TableCell><TableCell className="numeric"><Currency value={item.cumulative} /></TableCell></TableRow>)}</TableBody></Table></div>}
  </Card>
}
