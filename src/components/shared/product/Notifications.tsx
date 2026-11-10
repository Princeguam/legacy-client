import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, BellOff } from 'lucide-react'
import { Button, IconButton } from '@/components/shared/Button'
import { Dialog } from '@/components/shared/ui/dialog'
import { Badge } from '@/components/shared/ui/badge'
import { Currency } from '@/components/shared/currency/currency'
import { getTransactions, members } from '@/lib/product-data'
import { useProduct } from './product-context'

export function Notifications() {
  const { role, basePath } = useProduct()
  const [open, setOpen] = useState(false)
  const [read, setRead] = useState(false)
  const pending = getTransactions(role).filter(row => row.status === 'Pending')
  const contributions = pending.filter(row => row.type === 'Contribution')
  const expenses = pending.filter(row => row.type === 'Expense')
  const pendingMembers = members.filter(member => member.status === 'Pending')
  const count = read ? 0 : (contributions.length ? 1 : 0) + (role === 'Admin' ? (pendingMembers.length ? 1 : 0) + (expenses.length ? 1 : 0) : 0)
  return <><IconButton className="notification-button" label={`Notifications${count ? `, ${count} unread sample updates` : ', no unread sample updates'}`} aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}><Bell aria-hidden="true" />{count > 0 && <span className="notification-count" aria-hidden="true">{new Intl.NumberFormat('en-NG').format(count)}</span>}</IconButton>
    <Dialog open={open} onOpenChange={setOpen} title="Notifications" description="Illustrative updates. Live notifications are not connected." footer={count > 0 ? <Button variant="outline" onClick={() => setRead(true)}>Mark sample updates as read</Button> : undefined}>
      {read ? <div className="empty-state"><BellOff aria-hidden="true" /><p>No unread sample updates.</p></div> : <ul className="notification-list"><li><div className="card-heading"><h3 className="type-body">{role === 'Admin' ? 'Pending contributions' : 'Your November contribution'}</h3><Badge tone="warning">Pending</Badge></div><p className="type-label">{contributions.length} illustrative {contributions.length === 1 ? 'record' : 'records'} totalling <Currency value={contributions.reduce((sum, row) => sum + row.amount, 0)} />.</p><Link className="standalone-link type-label" to={`${basePath}/transactions?status=Pending&type=Contribution`} onClick={() => setOpen(false)}>View contributions</Link></li>{role === 'Admin' && <><li><h3 className="type-body">Membership requests</h3><p className="type-label">{pendingMembers.length} sample members are awaiting enrolment.</p><Link className="standalone-link type-label" to={`${basePath}/members?status=Pending`} onClick={() => setOpen(false)}>View members</Link></li><li><h3 className="type-body">Spending awaiting confirmation</h3><p className="type-label"><Currency value={expenses.reduce((sum, row) => sum + row.amount, 0)} /> in illustrative pending expenses.</p><Link className="standalone-link type-label" to={`${basePath}/transactions?status=Pending&type=Expense`} onClick={() => setOpen(false)}>View expenses</Link></li></>}</ul>}
    </Dialog>
  </>
}
