import { APP_LOCALE, COMMON_LABELS, LEDGER_TIME_ZONE, PAYMENT_SORTS, PAYMENT_STATUS, USER_ROLES } from '@/constants/strings'
import { API_ID_MAX, MAX_PAYMENT_MINOR, MONEY_DECIMAL_PLACES, MONEY_MINOR_UNIT_FACTOR } from '@/constants/values'
import type { UserRole } from '@/types/Auth'
import type { TransactionListQuery } from '@/types/transaction'

export function parsePaymentAmount(value: string): string | null {
  const trimmed = value.trim()
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return null
  const [whole, fraction = ''] = trimmed.split('.')
  const minor = BigInt(whole) * BigInt(MONEY_MINOR_UNIT_FACTOR) + BigInt(fraction.padEnd(MONEY_DECIMAL_PLACES, '0'))
  return minor > 0n && minor <= MAX_PAYMENT_MINOR ? minor.toString() : null
}

export function validAccountId(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0 && value <= API_ID_MAX
}

export function validPaymentDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
}

export function paymentQuery(params: URLSearchParams, role: UserRole): TransactionListQuery {
  const page = Number(params.get('page') ?? 1)
  const sort = params.get('sort')
  const status = params.get('status')
  return {
    page: Number.isSafeInteger(page) && page > 0 ? page : 1,
    sort: sort && Object.hasOwn(PAYMENT_SORTS, sort) ? sort as TransactionListQuery['sort'] : 'newest',
    search: role === USER_ROLES.admin ? params.get('q')?.trim() ?? '' : '',
    status: role === USER_ROLES.admin && Object.values(PAYMENT_STATUS).some(value => value === status) ? status as TransactionListQuery['status'] : '',
    from: role === USER_ROLES.admin ? params.get('start') ?? '' : '',
    to: role === USER_ROLES.admin ? params.get('end') ?? '' : '',
  }
}

export function paymentQueryError(query: TransactionListQuery): string | null {
  if ((query.from && !validPaymentDate(query.from)) || (query.to && !validPaymentDate(query.to))) return 'Choose valid calendar dates.'
  if (query.from && query.to && query.from > query.to) return 'The end date must be on or after the start date.'
  return null
}

export function formatPaymentDate(value: string | null, month = false): string {
  const date = value ? new Date(value) : null
  if (!date || !Number.isFinite(date.getTime())) return COMMON_LABELS.notProvided
  return new Intl.DateTimeFormat(APP_LOCALE, { ...(month ? { month: 'long', year: 'numeric' } : { day: 'numeric', month: 'short', year: 'numeric' }), timeZone: LEDGER_TIME_ZONE }).format(date)
}

export function receiptDestination(value: string | null): string | null {
  if (!value?.trim()) return null
  if (!value.startsWith('/') && !/^https?:\/\//i.test(value)) return null
  try {
    const url = new URL(value, 'https://legacy-wealth.invalid')
    return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password && (!value.startsWith('//')) ? value : null
  } catch { return null }
}
