import { isValidSession, type AuthSession } from './authService'

const sessionKey = 'legacy-wealth-session'

export function restoreSession(): AuthSession | null {
  for (const storageName of ['sessionStorage', 'localStorage'] as const) {
    try {
      const stored = window[storageName].getItem(sessionKey)
      if (!stored) continue
      const session: unknown = JSON.parse(stored)
      if (isValidSession(session)) return session
      window[storageName].removeItem(sessionKey)
    } catch { /* A blocked storage API does not prevent an in-memory sign-in. */ }
  }
  return null
}

export function clearSession() {
  for (const storageName of ['sessionStorage', 'localStorage'] as const) {
    try { window[storageName].removeItem(sessionKey) } catch { /* Storage can be unavailable. */ }
  }
}

export function persistSession(session: AuthSession, remember: boolean) {
  clearSession()
  try { window[remember ? 'localStorage' : 'sessionStorage'].setItem(sessionKey, JSON.stringify(session)) } catch { /* Keep the authenticated session in memory. */ }
}
