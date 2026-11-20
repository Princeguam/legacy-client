import { useEffect, useState } from 'react'
import type { AuthSession } from '@/types/Auth'
import type { BankAccount } from '@/types/bank-account'
import { BANK_ACCOUNT_MESSAGES } from '@/constants/strings'
import { getBankAccountOptions } from '@/services/utilService'
import { isValidSession } from '@/services/authService'
import { notify } from '@/lib/notify'

export function useBankAccountOptions(session: AuthSession | null, preview: boolean) {
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [loading, setLoading] = useState(!preview)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    if (preview || !session) return
    const controller = new AbortController()
    getBankAccountOptions(session, controller.signal).then(result => {
      if (!controller.signal.aborted && isValidSession(session)) { setAccounts(result); setLoading(false) }
    }).catch(error => { if (!controller.signal.aborted) { setLoading(false); setFailed(true); notify.error(error, BANK_ACCOUNT_MESSAGES.unavailable) } })
    return () => controller.abort()
  }, [session, preview, attempt])
  return { accounts, loading, failed, retry: () => { setFailed(false); setLoading(true); setAttempt(current => current + 1) } }
}
