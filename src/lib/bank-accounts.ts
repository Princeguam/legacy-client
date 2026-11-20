import { BANK_ACCOUNT_MESSAGES } from '@/constants/strings'
import type { BankAccount, BankAccountErrors, CreateBankAccountRequest } from '@/types/bank-account'

export function validateBankAccount(input: CreateBankAccountRequest): BankAccountErrors {
  const errors: BankAccountErrors = {}
  if (!input.bankName.trim()) errors.bankName = BANK_ACCOUNT_MESSAGES.bankRequired
  if (!input.accountName.trim()) errors.accountName = BANK_ACCOUNT_MESSAGES.nameRequired
  if (!/^\d+$/.test(input.accountNumber.trim())) errors.accountNumber = BANK_ACCOUNT_MESSAGES.numberRequired
  return errors
}

export function bankAccountLabel(account: BankAccount): string {
  return `${account.bankName} · ${account.accountName} · ${account.accountNumber}`
}
