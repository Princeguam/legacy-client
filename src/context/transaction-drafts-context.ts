import { createContext, useContext } from 'react'
import type { DraftInput, TransactionDraft } from '@/lib/transaction-drafts'

export const transactionDraftsContext = createContext<{
  drafts: TransactionDraft[]
  addDraft: (draft: DraftInput) => boolean
  removeDraft: (id: string) => void
} | null>(null)

export function useTransactionDrafts() {
  const context = useContext(transactionDraftsContext)
  if (!context) throw new Error('Transaction drafts require a workspace provider.')
  return context
}
