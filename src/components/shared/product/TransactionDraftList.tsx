import { useState } from 'react'
import { Button } from '@/components/shared/Button'
import { Modal as Dialog } from '@/components/shared/Modal'
import { Card } from '@/components/shared/ui/card'
import { Badge } from '@/components/shared/ui/badge'
import { Currency } from '@/components/shared/currency/currency'
import { Receipt } from '@/components/shared/receipt/Receipt'
import { useTransactionDrafts } from '@/context/transaction-drafts-context'

export function TransactionDraftList() {
  const { drafts, removeDraft } = useTransactionDrafts()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [removeId, setRemoveId] = useState<string | null>(null)
  const selected = drafts.find(draft => draft.id === selectedId)
  return <Card className="product-card local-transaction-drafts"><div className="card-heading"><div><h2 className="type-title">Your local drafts</h2><p className="type-label">Not submitted. Receipts and entries clear on reload, sign out, or workspace change. Balances stay unchanged.</p></div><Badge icon={false}>{drafts.length} drafts</Badge></div>
    {drafts.length ? <ul className="transaction-draft-list">{drafts.map(draft => <li key={draft.id}><div><p>{draft.description}</p><p className="type-label">{draft.date} · {draft.type} · {draft.receipt ? 'Receipt attached' : 'No receipt'}</p></div><Currency value={draft.amountMinor / 100} /><div className="inline-actions"><Button variant="outline" onClick={() => setSelectedId(draft.id)} aria-label={`View draft: ${draft.description}`}>View draft</Button><Button variant="ghost" onClick={() => setRemoveId(draft.id)} aria-label={`Remove draft: ${draft.description}`}>Remove</Button></div></li>)}</ul> : <p>Add a transaction to keep its details and receipt together for review.</p>}
    <Dialog open={Boolean(selected)} onOpenChange={open => { if (!open) setSelectedId(null) }} title="Transaction draft" description="Saved locally. This entry has not been submitted.">
      {selected && <><dl className="detail-list"><div><dt>Description</dt><dd>{selected.description}</dd></div><div><dt>Type</dt><dd>{selected.type}</dd></div><div><dt>Date</dt><dd>{selected.date}</dd></div><div><dt>Amount</dt><dd><Currency value={selected.amountMinor / 100} /></dd></div><div><dt>Payment reference</dt><dd className="financial">{selected.reference || 'Not provided'}</dd></div></dl>{selected.notes && <p className="transaction-notes">{selected.notes}</p>}{selected.receipt ? <Receipt file={selected.receipt} /> : <p>No receipt attached.</p>}</>}
    </Dialog>
    <Dialog open={Boolean(removeId)} onOpenChange={open => { if (!open) setRemoveId(null) }} title="Remove local draft?" description="This removes the local entry and its receipt. It cannot be recovered after removal." footer={<Button variant="danger" onClick={() => { if (removeId) removeDraft(removeId); setRemoveId(null) }}>Remove draft</Button>} />
  </Card>
}
