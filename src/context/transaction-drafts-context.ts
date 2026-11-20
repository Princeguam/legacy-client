import type { TransactionDraftsContextValue } from '@/types/transaction'
import { createContext, useContext } from 'react'

export const transactionDraftsContext = createContext<TransactionDraftsContextValue | null>(null)

export function useTransactionDrafts() {
  const context = useContext(transactionDraftsContext)
  if (!context) throw new Error('Transaction drafts require a workspace provider.')
  return context
}
