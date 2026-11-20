import type { ApiResponse, PaginatedApiData } from './api'
import type { BANK_ACCOUNT_SORTS } from '@/constants/strings'

export type BankAccount = {
  id: number
  bankName: string
  accountName: string
  accountNumber: string
  isActive: boolean
}

export type BankAccountInput = Omit<BankAccount, 'id'>
export type CreateBankAccountRequest = Pick<BankAccount, 'bankName' | 'accountName' | 'accountNumber'>
export type BankAccountErrors = Partial<Record<keyof CreateBankAccountRequest, string>>
export type BankAccountListQuery = { page: number; sort: keyof typeof BANK_ACCOUNT_SORTS; isActive: boolean }
export type BankAccountListData = PaginatedApiData<BankAccount>
export type BankAccountResponse = ApiResponse<BankAccount>
export type BankAccountListResponse = ApiResponse<BankAccountListData>
