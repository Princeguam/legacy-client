import type { AuthSession } from '@/types/Auth'
import { STORAGE_KEYS } from '@/constants/strings'
import { isValidSession } from './authService'
import { isApiUser, toAuthUser } from './apiUser'
import type { ApiUser } from '@/types/user'

/** Late responses cannot replace an expired, signed-out or different account session. */
export function mergeSessionUser(session: AuthSession | null, user: ApiUser, accessToken: string): AuthSession | null {
  if (!isValidSession(session) || !isApiUser(user) || user.isDeleted || session.accessToken !== accessToken) return null
  const normalized = toAuthUser(user)
  if (String(normalized.id) !== String(session.user.id) || normalized.role !== session.user.role) return null
  return { ...session, user: normalized }
}

export function restoreSession(): AuthSession | null {
  for (const storageName of ['localStorage', 'sessionStorage'] as const) {
    try {
      const stored = window[storageName].getItem(STORAGE_KEYS.session)
      if (!stored) continue
      const session: unknown = JSON.parse(stored)
      if (isValidSession(session)) {
        if (storageName === 'sessionStorage') persistSession(session)
        else {
          try { window.sessionStorage.removeItem(STORAGE_KEYS.session) } catch { /* Storage can be unavailable. */ }
        }
        return session
      }
      window[storageName].removeItem(STORAGE_KEYS.session)
    } catch {
      try { window[storageName].removeItem(STORAGE_KEYS.session) } catch { /* Storage can be unavailable. */ }
    }
  }
  return null
}

export function clearSession() {
  for (const storageName of ['sessionStorage', 'localStorage'] as const) {
    try { window[storageName].removeItem(STORAGE_KEYS.session) } catch { /* Storage can be unavailable. */ }
  }
}

export function persistSession(session: AuthSession) {
  if (!isValidSession(session)) return
  clearSession()
  try { window.localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session)) } catch { /* Keep the authenticated session in memory. */ }
}
