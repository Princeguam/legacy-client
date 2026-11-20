import { Search } from 'lucide-react'
import { COMMON_LABELS, PAYMENT_SORTS, PAYMENT_STATUS, PAYMENT_STATUS_LABELS } from '@/constants/strings'
import type { TransactionListQuery } from '@/types/transaction'
import { Button } from '@/components/shared/Button'
import { Card } from '@/components/shared/ui/card'
import { Input } from '@/components/shared/ui/input'
import { NativeSelect } from '@/components/shared/ui/native-select'
import { FormField } from '@/components/shared/form-field/form-field'

export function TransactionFilters({ admin, query, queryError, searchValue, filter, onClear }: { admin: boolean; query: TransactionListQuery; queryError: string | null; searchValue: string; filter: (key: string, value: string) => void; onClear: () => void }) {
  return (
    <Card className="product-card transaction-filters" aria-label="Transaction filters"><div className="transaction-filter-fields">
      {admin && <><FormField label="Search transactions">{bindings => <div className="filter-search"><Search aria-hidden="true" /><Input {...bindings} type="search" value={searchValue} onChange={event => filter('q', event.target.value)} placeholder="Payment note or status" /></div>}</FormField><FormField label={COMMON_LABELS.status}>{bindings => <NativeSelect {...bindings} value={query.status} onChange={event => filter('status', event.target.value)}><option value="">{COMMON_LABELS.allStatuses}</option>{Object.values(PAYMENT_STATUS).map(status => <option key={status} value={status}>{PAYMENT_STATUS_LABELS[status]}</option>)}</NativeSelect>}</FormField><FormField label="From payment period">{bindings => <Input {...bindings} type="date" value={query.from} onChange={event => filter('start', event.target.value)} />}</FormField><FormField label="To payment period" error={queryError ?? undefined}>{bindings => <Input {...bindings} type="date" value={query.to} onChange={event => filter('end', event.target.value)} />}</FormField></>}
      <FormField label="Sort transactions">{bindings => <NativeSelect {...bindings} value={query.sort} onChange={event => filter('sort', event.target.value)}>{Object.entries(PAYMENT_SORTS).map(([value, sort]) => <option key={value} value={value}>{sort.label}</option>)}</NativeSelect>}</FormField>
    </div>{admin && <div className="transaction-filter-footer"><p className="type-label">Dates filter payment periods inclusively.</p><Button variant="ghost" onClick={() => onClear()}>{COMMON_LABELS.clearFilters}</Button></div>}</Card>
  )
}
