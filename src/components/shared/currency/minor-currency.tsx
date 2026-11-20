import { APP_CURRENCY } from '@/constants/strings'
import { formatMinorCurrency } from '@/lib/format-minor-currency'

export function MinorCurrency({ value, currency = APP_CURRENCY }: { value: string; currency?: string }) {
  return <span className="financial"><span key={`${value}:${currency}`} className="currency-value" aria-hidden="true">{formatMinorCurrency(value, currency)}</span><span className="sr-only">{formatMinorCurrency(value, currency, true)}</span></span>
}
