import { useRef, useState, type ReactNode } from 'react'
import { transactionDraftsContext } from './transaction-drafts-context'
import { draftFingerprint, type DraftInput, type TransactionDraft } from '@/lib/transaction-drafts'

// Memory only. The layout keys this provider by account, role, and preview scope.
export function TransactionDraftsProvider({ children }: { children: ReactNode }) {
  const [drafts, setDrafts] = useState<TransactionDraft[]>([])
  const current = useRef<TransactionDraft[]>([])
  const sequence = useRef(0)
  function addDraft(input: DraftInput) {
    if (current.current.some(draft => draftFingerprint(draft) === draftFingerprint(input))) return false
    const draft = { ...input, id: `local-draft-${++sequence.current}` }
    current.current = [draft, ...current.current]
    setDrafts(current.current)
    return true
  }
  function removeDraft(id: string) {
    current.current = current.current.filter(draft => draft.id !== id)
    setDrafts(current.current)
  }
  return <transactionDraftsContext.Provider value={{ drafts, addDraft, removeDraft }}>{children}</transactionDraftsContext.Provider>
}
