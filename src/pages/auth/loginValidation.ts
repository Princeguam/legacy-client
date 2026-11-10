import type { LoginCredentials } from '@/services/authService'

export type LoginErrors = { email?: string; password?: string }

export function validateLogin({ email, password }: LoginCredentials): LoginErrors {
  const errors: LoginErrors = {}
  if (!email.trim()) errors.email = 'Enter your email address.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = 'Enter a valid email address, such as name@example.com.'
  if (!password) errors.password = 'Enter your password.'
  return errors
}
