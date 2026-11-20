import { API_MESSAGES, PAYMENT_SORTS, PAYMENT_STATUS } from '@/constants/strings'
import { MAX_PAYMENT_MINOR, PAGE_SIZES } from '@/constants/values'
import { paymentQueryError, receiptDestination, validAccountId, validPaymentDate } from '@/lib/transactions'
import type { AdminCreateTransactionRequest, CreateTransactionRequest, TransactionListQuery } from '@/types/transaction'
import { ApiError } from './apiClient'

export function transactionSearch(query: TransactionListQuery, admin = false): string {
  if (!Number.isSafeInteger(query.page) || query.page < 1 || !Object.hasOwn(PAYMENT_SORTS, query.sort) || paymentQueryError(query) || (query.status && !Object.values(PAYMENT_STATUS).some(status => status === query.status))) throw new ApiError(API_MESSAGES.unavailable)
  const { by, order } = PAYMENT_SORTS[query.sort]
  const params = new URLSearchParams({ page: String(query.page), count: String(PAGE_SIZES.transactions), by, order })
  if (admin) {
    if (query.search) params.set('search', query.search)
    if (query.status) params.set('status', query.status)
    if (query.from) params.set('from', query.from)
    if (query.to) params.set('to', query.to)
  }
  return params.toString()
}

export function transactionCreateBody(input: CreateTransactionRequest | AdminCreateTransactionRequest, admin = false): CreateTransactionRequest | AdminCreateTransactionRequest {
  if (!validAccountId(input.bankAccountId) || !/^\d+$/.test(input.amount) || BigInt(input.amount) <= 0n || BigInt(input.amount) > MAX_PAYMENT_MINOR || !validPaymentDate(input.period) ||
      (input.depositedAt !== undefined && !Number.isFinite(Date.parse(input.depositedAt)))) throw new ApiError(API_MESSAGES.unavailable)
  if (!admin && !receiptDestination(input.attachmentUrl ?? null)) throw new ApiError('A receipt is required before submitting this payment.')
  if (input.attachmentUrl && !receiptDestination(input.attachmentUrl)) throw new ApiError(API_MESSAGES.unavailable)
  const body = { bankAccountId: input.bankAccountId, amount: BigInt(input.amount).toString(), period: input.period, ...(input.note?.trim() ? { note: input.note.trim() } : {}), ...(input.depositedAt ? { depositedAt: input.depositedAt } : {}), ...(input.attachmentUrl ? { attachmentUrl: input.attachmentUrl } : {}) }
  if (admin) {
    if (!('memberId' in input) || !validAccountId(input.memberId)) throw new ApiError('Enter a valid member ID.')
    return { ...body, memberId: input.memberId }
  }
  return body as CreateTransactionRequest
}
