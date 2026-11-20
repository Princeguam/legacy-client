import { API_MESSAGES } from '@/constants/strings'
import { PAGE_SIZES } from '@/constants/values'
import { isRecord } from '@/lib/is-record'
import { validAccountId } from '@/lib/transactions'
import type { BankAccount, BankAccountListData } from '@/types/bank-account'
import { ApiError } from './apiClient'

const validCount = (value: unknown): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0

export function parseBankAccount(value: unknown): BankAccount {
  if (!isRecord(value) || !validAccountId(value.id) || typeof value.bankName !== 'string' || !value.bankName.trim() ||
      typeof value.accountName !== 'string' || !value.accountName.trim() || typeof value.accountNumber !== 'string' ||
      !/^\d+$/.test(value.accountNumber) || typeof value.isActive !== 'boolean') throw new ApiError(API_MESSAGES.unavailable)
  return { id: value.id, bankName: value.bankName, accountName: value.accountName, accountNumber: value.accountNumber, isActive: value.isActive }
}

export function parseBankAccountList(value: unknown, page: number, isActive: boolean): BankAccountListData {
  if (!isRecord(value) || value.page !== page || !validCount(value.count) || !validCount(value.totalItems) || !validCount(value.totalPages) ||
      !Array.isArray(value.pageData) || value.count !== value.pageData.length || value.count > PAGE_SIZES.bankAccounts ||
      value.totalPages !== Math.ceil(value.totalItems / PAGE_SIZES.bankAccounts) ||
      value.count !== Math.min(PAGE_SIZES.bankAccounts, Math.max(0, value.totalItems - (page - 1) * PAGE_SIZES.bankAccounts))) throw new ApiError(API_MESSAGES.unavailable)
  const pageData = value.pageData.map(parseBankAccount)
  if (new Set(pageData.map(bank => bank.id)).size !== pageData.length || pageData.some(bank => bank.isActive !== isActive)) throw new ApiError(API_MESSAGES.unavailable)
  return { page, count: value.count, totalItems: value.totalItems, totalPages: value.totalPages, pageData }
}

export function parseBankAccountOptions(value: unknown): BankAccount[] {
  if (!Array.isArray(value)) throw new ApiError(API_MESSAGES.unavailable)
  const banks = value.map(parseBankAccount)
  if (banks.some(bank => !bank.isActive) || new Set(banks.map(bank => bank.id)).size !== banks.length) throw new ApiError(API_MESSAGES.unavailable)
  return banks
}
