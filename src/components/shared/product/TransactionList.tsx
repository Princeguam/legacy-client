import { COMMON_LABELS, PAYMENT_TYPE_LABELS, ROLE_LABELS } from '@/constants/strings'
import type { ApiTransaction } from '@/types/transaction'
import { FileText } from 'lucide-react'
import { Button } from '@/components/shared/Button'
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell, TableCaption } from '@/components/shared/Table'
import { MinorCurrency } from '@/components/shared/currency/minor-currency'
import { PaymentStatusBadge } from '@/components/shared/transactions/PaymentStatusBadge'
import { formatPaymentDate } from '@/lib/transactions'

export function TransactionList({ rows, admin = false, disabled = false, onSelect }: { rows: ApiTransaction[]; admin?: boolean; disabled?: boolean; onSelect: (record: ApiTransaction) => void }) {
  const memberName = (row: ApiTransaction) => [row.depositedBy.firstName, row.depositedBy.middleName, row.depositedBy.lastName].filter(Boolean).join(' ') || row.depositedBy.email
  const description = (row: ApiTransaction) => row.note || PAYMENT_TYPE_LABELS[row.type]
  return <>
    <p className="table-scroll-hint type-caption">{COMMON_LABELS.tableScrollHint}</p>
    <div className="table-region transactions-table" role="region" aria-label="Transactions table" tabIndex={0}><Table><TableCaption className="sr-only">Payment transactions, with currency and exact amounts</TableCaption><TableHeader><TableRow><TableHead>Transaction</TableHead>{admin && <TableHead>{ROLE_LABELS.user}</TableHead>}<TableHead>{COMMON_LABELS.type}</TableHead><TableHead>{COMMON_LABELS.status}</TableHead><TableHead className="numeric">{COMMON_LABELS.amount}</TableHead><TableHead>{COMMON_LABELS.details}</TableHead></TableRow></TableHeader><TableBody>{rows.map(row => <TableRow key={row.id}><TableCell><div className="cell-stack"><span>{description(row)}</span><span className="type-caption">{formatPaymentDate(row.depositedAt || row.created)}</span></div></TableCell>{admin && <TableCell>{memberName(row)}</TableCell>}<TableCell>{PAYMENT_TYPE_LABELS[row.type]}</TableCell><TableCell><PaymentStatusBadge status={row.status} /></TableCell><TableCell className="numeric"><MinorCurrency value={row.amount} currency={row.currency} /></TableCell><TableCell><Button variant="ghost" disabled={disabled} onClick={() => onSelect(row)} aria-label={`View transaction ${row.id}`}>{COMMON_LABELS.view}</Button></TableCell></TableRow>)}</TableBody></Table></div>

    {!rows.length && <div className="empty-state"><FileText aria-hidden="true" /><h3 className="type-title">No transactions found</h3><p>Payments will appear here once they are recorded.</p></div>}
  </>
}
