import { API_MESSAGES, PAYMENT_MESSAGES, PAYMENT_STATUS, PAYMENT_TYPE } from '@/constants/strings'
import { MAX_PAYMENT_MINOR, PAGE_SIZES } from '@/constants/values'
import { isRecord } from '@/lib/is-record'
import { validAccountId } from '@/lib/transactions'
import type { AuthUser } from '@/types/Auth'
import type { ApiTransaction, PaymentPerson, TransactionListData } from '@/types/transaction'
import { ApiError } from './apiClient'
import { isApiUser } from './apiUser'

const validDate = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0 && Number.isFinite(Date.parse(value))
const validCount = (value: unknown): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0

export function parseTransactionAmount(value: unknown): string {
  if (!((typeof value === 'number' && Number.isSafeInteger(value)) || (typeof value === 'string' && /^-?\d+$/.test(value)))) throw new ApiError(API_MESSAGES.unavailable)
  const amount = BigInt(value)
  if (amount < -MAX_PAYMENT_MINOR - 1n || amount > MAX_PAYMENT_MINOR) throw new ApiError(API_MESSAGES.unavailable)
  return amount.toString()
}

function person(value: unknown): PaymentPerson {
  if (!isApiUser(value)) throw new ApiError(API_MESSAGES.unavailable)
  const { id, firstName, middleName, lastName, email, role } = value
  return { id, firstName, middleName, lastName, email, role }
}

export function parseTransaction(value: unknown, owner?: Pick<AuthUser, 'id'>): ApiTransaction {
  if (!isRecord(value) || !validAccountId(value.id) || !validAccountId(value.userId) || !validAccountId(value.bankAccountId) ||
      !Object.values(PAYMENT_STATUS).some(status => status === value.status) || !Object.values(PAYMENT_TYPE).some(type => type === value.type) ||
      typeof value.currency !== 'string' || !/^[A-Z]{3}$/.test(value.currency) || (value.note !== null && typeof value.note !== 'string') ||
      !['User', 'Admin'].includes(String(value.source)) || (value.attachmentUrl !== null && typeof value.attachmentUrl !== 'string') ||
      (value.reviewedById !== null && !validAccountId(value.reviewedById)) || !validDate(value.period) || !validDate(value.created) || !validDate(value.updated) ||
      (value.depositedAt !== null && !validDate(value.depositedAt)) || (value.reviewedAt !== null && !validDate(value.reviewedAt)) ||
      !isRecord(value.bankAccount) || value.bankAccount.id !== value.bankAccountId || typeof value.bankAccount.bankName !== 'string' ||
      typeof value.bankAccount.accountName !== 'string' || typeof value.bankAccount.accountNumber !== 'string' || typeof value.bankAccount.isActive !== 'boolean') throw new ApiError(API_MESSAGES.unavailable)
  const depositedBy = person(value.depositedBy)
  const reviewedBy = value.reviewedBy === null ? null : person(value.reviewedBy)
  if (depositedBy.id !== value.userId || (reviewedBy?.id ?? null) !== value.reviewedById) throw new ApiError(API_MESSAGES.unavailable)
  if (owner && String(value.userId) !== String(owner.id)) throw new ApiError(PAYMENT_MESSAGES.wrongAccount)
  return {
    id: value.id, userId: value.userId, bankAccountId: value.bankAccountId,
    status: value.status as ApiTransaction['status'], type: value.type as ApiTransaction['type'],
    amount: parseTransactionAmount(value.amount), currency: value.currency, note: value.note,
    source: value.source as ApiTransaction['source'], attachmentUrl: value.attachmentUrl, reviewedById: value.reviewedById,
    period: value.period, depositedAt: value.depositedAt, reviewedAt: value.reviewedAt, created: value.created, updated: value.updated,
    depositedBy, reviewedBy,
    bankAccount: { id: value.bankAccountId, bankName: value.bankAccount.bankName, accountName: value.bankAccount.accountName, accountNumber: value.bankAccount.accountNumber, isActive: value.bankAccount.isActive },
  }
}

export function parseTransactionList(value: unknown, page: number, owner?: Pick<AuthUser, 'id'>): TransactionListData {
  if (!isRecord(value) || value.page !== page || !validCount(value.count) || !validCount(value.totalItems) || !validCount(value.totalPages) ||
      !Array.isArray(value.pageData) || value.count !== value.pageData.length || value.count > PAGE_SIZES.transactions ||
      value.totalPages !== Math.ceil(value.totalItems / PAGE_SIZES.transactions) ||
      value.count !== Math.min(PAGE_SIZES.transactions, Math.max(0, value.totalItems - (page - 1) * PAGE_SIZES.transactions))) throw new ApiError(API_MESSAGES.unavailable)
  const pageData = value.pageData.map(record => parseTransaction(record, owner))
  if (new Set(pageData.map(record => record.id)).size !== pageData.length) throw new ApiError(API_MESSAGES.unavailable)
  return { page, count: value.count, totalItems: value.totalItems, totalPages: value.totalPages, pageData }
}
