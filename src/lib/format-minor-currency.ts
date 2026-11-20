import { APP_CURRENCY, APP_LOCALE } from '@/constants/strings'
import { MONEY_DECIMAL_PLACES, MONEY_MINOR_UNIT_FACTOR } from '@/constants/values'

/** Keep every kobo, including BigInt values beyond Number.MAX_SAFE_INTEGER. */
export function formatMinorCurrency(value: string, currency = APP_CURRENCY, accessible = false): string {
  const minor = BigInt(value)
  const absolute = minor < 0n ? -minor : minor
  const factor = BigInt(MONEY_MINOR_UNIT_FACTOR)
  const whole = absolute / factor
  const base = minor < 0n ? (whole === 0n ? -0 : -whole) : whole
  const fraction = (absolute % factor).toString().padStart(MONEY_DECIMAL_PLACES, '0')
  const formatter = new Intl.NumberFormat(APP_LOCALE, { style: 'currency', currency, currencyDisplay: accessible ? 'name' : 'symbol', minimumFractionDigits: MONEY_DECIMAL_PLACES, maximumFractionDigits: MONEY_DECIMAL_PLACES })
  return formatter.formatToParts(base).map(part => part.type === 'fraction' ? fraction : part.value).join('')
}
