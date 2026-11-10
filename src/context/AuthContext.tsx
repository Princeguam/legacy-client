import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { login, AuthError } from '@/services/authService'
import { clearSession, persistSession, restoreSession } from '@/services/authSession'
import { authContext, type AuthContextValue } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState(restoreSession)
  const [isSigningIn, setIsSigningIn] = useState(false)
  const submitting = useRef(false)
  const signOut = useCallback(() => { clearSession(); setSession(null) }, [])
  const signIn: AuthContextValue['signIn'] = useCallback(async (credentials, remember) => {
    if (submitting.current) throw new AuthError('A sign-in request is already in progress.')
    submitting.current = true
    setIsSigningIn(true)
    try {
      const nextSession = await login(credentials)
      persistSession(nextSession, remember)
      setSession(nextSession)
    } finally { submitting.current = false; setIsSigningIn(false) }
  }, [])

  useEffect(() => {
    if (!session) return
    const timeout = setTimeout(signOut, Math.min(Math.max(session.expiresAt - Date.now(), 0), 2147483647))
    const checkExpiry = () => { if (session.expiresAt <= Date.now()) signOut() }
    document.addEventListener('visibilitychange', checkExpiry)
    return () => { clearTimeout(timeout); document.removeEventListener('visibilitychange', checkExpiry) }
  }, [session, signOut])

  return <authContext.Provider value={{ session, isSigningIn, signIn, signOut }}>{children}</authContext.Provider>
}
