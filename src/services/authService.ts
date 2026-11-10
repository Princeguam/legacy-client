export type UserRole = 'user' | 'Admin'

export type AuthUser = {
  id: string | number
  email: string
  firstName?: string
  lastName?: string
  role: UserRole
}

export type AuthSession = {
  user: AuthUser
  accessToken: string
  expiresAt: number
}

export type LoginCredentials = { email: string; password: string }

export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function validUser(value: unknown): value is AuthUser {
  return isRecord(value) && ((typeof value.id === 'string' && value.id.length > 0) || (typeof value.id === 'number' && Number.isFinite(value.id))) && typeof value.email === 'string' && value.email.length > 0 && (value.role === 'user' || value.role === 'Admin') && (value.firstName === undefined || typeof value.firstName === 'string') && (value.lastName === undefined || typeof value.lastName === 'string')
}

export function isValidSession(value: unknown): value is AuthSession {
  return isRecord(value) && validUser(value.user) && typeof value.accessToken === 'string' && value.accessToken.length > 0 && typeof value.expiresAt === 'number' && Number.isFinite(value.expiresAt) && value.expiresAt > Date.now()
}

// Match the existing server's sendResponse envelope and Prisma User/Admin roles.
// Only the server role determines access; isAdmin flags are not consulted.
export function parseLoginResponse(value: unknown): AuthSession {
  if (!isRecord(value) || value.success !== true || !isRecord(value.data)) {
    throw new AuthError('Unable to sign in. Please try again.')
  }
  const data = value.data
  const role = data.role === 'User' || data.role === 'user' ? 'user' : data.role === 'Admin' ? 'Admin' : null
  const session = {
    user: { id: data.id, email: data.email, ...(typeof data.firstName === 'string' ? { firstName: data.firstName } : {}), ...(typeof data.lastName === 'string' ? { lastName: data.lastName } : {}), role },
    accessToken: data.accessToken,
    expiresAt: data.expiresAt,
  }
  if (data.isDeleted === true || !isValidSession(session)) {
    throw new AuthError('Your account could not be verified. Please contact your cooperative administrator.')
  }
  return session
}

export async function login(credentials: LoginCredentials): Promise<AuthSession> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 20000)
  const baseUrl = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')
  try {
    const response = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email: credentials.email.trim(), password: credentials.password }),
      signal: controller.signal,
    })
    let payload: unknown
    try { payload = await response.json() } catch {
      throw new AuthError('The sign-in service is unavailable. Please try again shortly.')
    }
    if (!response.ok || !isRecord(payload) || payload.success !== true) {
      if (response.status >= 500) throw new AuthError('The sign-in service is unavailable. Please try again shortly.')
      if (response.status === 429) throw new AuthError('Too many sign-in attempts. Please wait a moment and try again.')
      throw new AuthError(isRecord(payload) && typeof payload.message === 'string' ? payload.message : 'Unable to sign in. Check your email and password, then try again.')
    }
    return parseLoginResponse(payload)
  } catch (error) {
    if (error instanceof AuthError) throw error
    if (controller.signal.aborted) throw new AuthError('The sign-in request timed out. Please try again.')
    throw new AuthError('Unable to connect to the sign-in service. Please try again shortly.')
  } finally { clearTimeout(timeout) }
}
