import { EMAIL_PATTERN } from '@/constants/values'
import type { LoginCredentials, LoginErrors } from '@/types/Auth'
import { AUTH_MESSAGES } from '@/constants/strings'
export function validateLogin({ email, password }: LoginCredentials): LoginErrors {
  const errors: LoginErrors = {}
  if (!email.trim()) errors.email = AUTH_MESSAGES.emailRequired
  else if (!EMAIL_PATTERN.test(email.trim())) errors.email = AUTH_MESSAGES.emailInvalid
  if (!password) errors.password = AUTH_MESSAGES.passwordRequired
  return errors
}
