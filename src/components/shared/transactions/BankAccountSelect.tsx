import { BANK_ACCOUNT_MESSAGES } from '@/constants/strings'
import type { BankAccount } from '@/types/bank-account'
import { FormField } from '@/components/shared/form-field/form-field'
import { NativeSelect } from '@/components/shared/ui/native-select'
import { Button } from '@/components/shared/Button'
import { bankAccountLabel } from '@/lib/bank-accounts'

export function BankAccountSelect({ accounts, value, onChange, loading, failed, onRetry, busy = false, error }: { accounts: BankAccount[]; value: string; onChange: (value: string) => void; loading: boolean; failed: boolean; onRetry: () => void; busy?: boolean; error?: string }) {
  const selected = accounts.find(bank => String(bank.id) === value)
  return <div className="settings-form"><FormField label={BANK_ACCOUNT_MESSAGES.label} error={error} hint={loading ? BANK_ACCOUNT_MESSAGES.loading : failed ? BANK_ACCOUNT_MESSAGES.unavailable : !accounts.length ? BANK_ACCOUNT_MESSAGES.empty : selected ? bankAccountLabel(selected) : undefined}>{bindings => <NativeSelect {...bindings} name="bankAccountId" required value={value} disabled={busy || loading || failed || !accounts.length} aria-busy={loading || undefined} onChange={event => onChange(event.target.value)}>
    <option value="">{BANK_ACCOUNT_MESSAGES.choose}</option>
    {accounts.map(bank => <option key={bank.id} value={bank.id} disabled={!bank.isActive}>{bank.bankName} · {bank.accountNumber}</option>)}
  </NativeSelect>}</FormField>{failed && <div><Button variant="outline" disabled={busy || loading} onClick={onRetry}>Try again</Button></div>}</div>
}
