import { API_PATHS, AUTH_MESSAGES, USER_ROLES } from '@/constants/strings'
import type { AuthSession, AuthUser, LoginCredentials, LoginResponseData } from '@/types/Auth'
import { isRecord } from '@/lib/is-record'
import { isApiResponse } from './apiResponse'
import { ApiError, requestApi } from './apiClient'
import { isApiUser, nullableProfileFields, profileFields, toAuthUser } from './apiUser'

export class AuthError extends ApiError {
  constructor(message: string, errorCode?: number, status?: number) {
    super(message, errorCode, status)
    this.name = 'AuthError'
  }
}

function validUser(value: unknown): value is AuthUser {
  return isRecord(value) &&
    ((typeof value.id === 'string' && value.id.trim().length > 0) ||
      (typeof value.id === 'number' && Number.isSafeInteger(value.id) && value.id > 0)) &&
    typeof value.email === 'string' && value.email.trim().length > 0 &&
    (value.role === USER_ROLES.user || value.role === USER_ROLES.admin) &&
    profileFields.every(key => value[key] === undefined || typeof value[key] === 'string') &&
    nullableProfileFields.every(key => value[key] === undefined || value[key] === null || typeof value[key] === 'string') &&
    (value.isAdmin === undefined || typeof value.isAdmin === 'boolean') &&
    (value.isDeleted === undefined || value.isDeleted === false)
}

export function isValidSession(value: unknown): value is AuthSession {
  return isRecord(value) && validUser(value.user) &&
    typeof value.accessToken === 'string' && value.accessToken.trim().length > 0 &&
    (value.refreshToken === undefined || (typeof value.refreshToken === 'string' && value.refreshToken.trim().length > 0)) &&
    typeof value.expiresAt === 'number' && Number.isFinite(value.expiresAt) && value.expiresAt > Date.now()
}

function isLoginResponseData(value: unknown): value is LoginResponseData {
  if (!isRecord(value)) return false
  const { accessToken, refreshToken, expiresAt } = value
  return isApiUser(value) && value.isDeleted === false &&
    typeof accessToken === 'string' && accessToken.trim().length > 0 &&
    typeof refreshToken === 'string' && refreshToken.trim().length > 0 &&
    typeof expiresAt === 'number' && Number.isFinite(expiresAt) && expiresAt > Date.now()
}

/** Match the backend login serializer; only the returned role grants navigation access. */
export function parseLoginResponse(value: unknown): AuthSession {
  if (!isApiResponse(value)) throw new AuthError(AUTH_MESSAGES.unavailable)
  if (!value.success) throw new AuthError(value.message, value.errorCode)
  return parseLoginData(value.data)
}

function parseLoginData(data: unknown): AuthSession {
  if (!isLoginResponseData(data)) throw new AuthError(AUTH_MESSAGES.unverified)
  return {
    user: toAuthUser(data),
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    expiresAt: data.expiresAt,
  }
}

export async function login(credentials: LoginCredentials): Promise<AuthSession> {
  try {
    return await requestApi(API_PATHS.login, {
      method: 'POST',
      body: { email: credentials.email.trim(), password: credentials.password },
      messages: AUTH_MESSAGES,
    }, parseLoginData)
  } catch (error) {
    if (error instanceof AuthError) throw error
    if (error instanceof ApiError) throw new AuthError(error.message, error.errorCode, error.status)
    throw new AuthError(AUTH_MESSAGES.connection)
  }
}
