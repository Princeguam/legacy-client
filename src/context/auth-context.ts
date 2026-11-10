import { createContext } from 'react'
import type { AuthSession, LoginCredentials } from '@/services/authService'

export type AuthContextValue = {
  session: AuthSession | null
  isSigningIn: boolean
  signIn: (credentials: LoginCredentials, remember: boolean) => Promise<void>
  signOut: () => void
}

export const authContext = createContext<AuthContextValue | null>(null)
