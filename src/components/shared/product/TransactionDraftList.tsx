import { COMMON_LABELS } from '@/constants/strings'
import { useState } from 'react'
import { Button } from '@/components/shared/Button'
import { Modal as Dialog } from '@/components/shared/Modal'
import { Card } from '@/components/shared/ui/card'
import { Badge } from '@/components/shared/ui/badge'
import { MinorCurrency } from '@/components/shared/currency/minor-currency'
import { Receipt } from '@/components/shared/receipt/Receipt'
import { useTransactionDrafts } from '@/context/transaction-drafts-context'
import { formatPaymentDate } from '@/lib/transactions'

export function TransactionDraftList() {
  const { drafts, removeDraft } = useTransactionDrafts()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [removeId, setRemoveId] = useState<string | null>(null)
  const selected = drafts.find(draft => draft.id === selectedId)
  return <Card className="product-card local-transaction-drafts"><div className="card-heading"><div><h2 className="type-title">Your local drafts</h2><p className="type-label">Not submitted. Receipts and entries clear on reload, sign out or workspace change. Payment records stay unchanged.</p></div><Badge icon={false}>{drafts.length} drafts</Badge></div>
    {drafts.length ? <ul className="transaction-draft-list">{drafts.map(draft => <li key={draft.id}><div><p>{formatPaymentDate(`${draft.period}-01`, true)} payment</p><p className="type-label">{draft.date} · Bank account {draft.bankAccountId} · {draft.receipt ? 'Receipt attached' : 'No receipt'}</p></div><MinorCurrency value={draft.amountMinor} /><div className="inline-actions"><Button variant="outline" onClick={() => setSelectedId(draft.id)}>View draft</Button><Button variant="ghost" onClick={() => setRemoveId(draft.id)}>Remove</Button></div></li>)}</ul> : <p>Add a transaction draft to keep payment details and a receipt together.</p>}
    <Dialog open={Boolean(selected)} onOpenChange={open => { if (!open) setSelectedId(null) }} title="Transaction draft" description="Saved locally. This payment has not been submitted.">{selected && <><dl className="detail-list"><div><dt>Bank account ID</dt><dd className="financial">{selected.bankAccountId}</dd></div><div><dt>Payment period</dt><dd>{formatPaymentDate(`${selected.period}-01`, true)}</dd></div><div><dt>Payment date</dt><dd>{selected.date}</dd></div><div><dt>{COMMON_LABELS.amount}</dt><dd><MinorCurrency value={selected.amountMinor} /></dd></div><div><dt>Note</dt><dd>{selected.notes || COMMON_LABELS.notProvided}</dd></div></dl>{selected.receipt ? <Receipt file={selected.receipt} /> : <p>No receipt attached.</p>}</>}</Dialog>
    <Dialog open={Boolean(removeId)} onOpenChange={open => { if (!open) setRemoveId(null) }} title="Remove local draft?" description="This removes the local entry and its receipt. It cannot be recovered after removal." footer={<Button variant="danger" onClick={() => { if (removeId) removeDraft(removeId); setRemoveId(null) }}>Remove draft</Button>} />
  </Card>
}
