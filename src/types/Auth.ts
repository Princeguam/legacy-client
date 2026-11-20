import type { USER_ROLES } from '@/constants/strings'
import type { ApiResponse } from './api'
import type { ApiUser } from './user'
export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES]
export type AuthUser = Partial<Omit<ApiUser, 'id' | 'email' | 'role'>> & {
  id: string | number
  email: string
  role: UserRole
}
export type AuthSession = { user: AuthUser; accessToken: string; refreshToken?: string; expiresAt: number }
export type LoginResponseData = ApiUser & { accessToken: string; refreshToken: string; expiresAt: number }
export type LoginResponse = ApiResponse<LoginResponseData>
export type LoginCredentials = { email: string; password: string }
export type LoginErrors = { email?: string; password?: string }
export type AuthContextValue = {
  session: AuthSession | null
  isSigningIn: boolean
  signIn: (credentials: LoginCredentials) => Promise<void>
  signOut: () => void
  updateUser: (user: ApiUser, accessToken: string) => boolean
}
