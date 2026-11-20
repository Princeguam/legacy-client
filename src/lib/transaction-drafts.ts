import { RECEIPT_EXTENSIONS, TRANSACTION_LIMITS } from '@/constants/values'
import type { DraftInput, TransactionErrors, TransactionForm } from '@/types/transaction'
import { APP_LOCALE, BANK_ACCOUNT_MESSAGES, MIN_TRANSACTION_DATE, PAYMENT_MESSAGES, TRANSACTION_MESSAGES } from '@/constants/strings'
import { parsePaymentAmount, validAccountId, validPaymentDate } from '@/lib/transactions'

export function localToday(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

export const parseAmountMinor = parsePaymentAmount

export function receiptError(file: Pick<File, 'name' | 'type' | 'size'>): string | undefined {
  if (!RECEIPT_EXTENSIONS[file.type]?.test(file.name)) return TRANSACTION_MESSAGES.receiptType
  if (!file.size) return TRANSACTION_MESSAGES.receiptEmpty
  if (file.size > TRANSACTION_LIMITS.receiptBytes) return TRANSACTION_MESSAGES.receiptSize
}

export function validateTransaction(form: TransactionForm, receipt: File | null, today = localToday()): TransactionErrors {
  const errors: TransactionErrors = {}
  if (!/^\d+$/.test(form.bankAccountId) || !validAccountId(Number(form.bankAccountId))) errors.bankAccountId = BANK_ACCOUNT_MESSAGES.required
  if (!/^\d{4}-\d{2}$/.test(form.period) || !validPaymentDate(`${form.period}-01`)) errors.period = 'Choose a valid payment month.'
  if (!validPaymentDate(form.date) || form.date < MIN_TRANSACTION_DATE) errors.date = TRANSACTION_MESSAGES.dateInvalid
  else if (form.date > today) errors.date = TRANSACTION_MESSAGES.dateFuture
  if (!parsePaymentAmount(form.amount)) errors.amount = PAYMENT_MESSAGES.invalidAmount
  if (form.notes.trim().length > TRANSACTION_LIMITS.notes) errors.notes = TRANSACTION_MESSAGES.notesLength
  if (receipt) errors.receipt = receiptError(receipt)
  return Object.fromEntries(Object.entries(errors).filter(([, value]) => value))
}

export function draftFingerprint(draft: DraftInput) {
  return JSON.stringify([draft.bankAccountId, draft.period, draft.date, draft.amountMinor, draft.notes.trim().replace(/\s+/g, ' ').toLocaleLowerCase(APP_LOCALE)])
}
