import { PASSWORD_MESSAGES } from '@/constants/strings'
import type { PasswordErrors, PasswordForm } from '@/types/settings'

export function validatePassword(input: PasswordForm): PasswordErrors {
  const errors: PasswordErrors = {}
  if (!input.oldPassword) errors.oldPassword = PASSWORD_MESSAGES.currentRequired
  if (!input.newPassword) errors.newPassword = PASSWORD_MESSAGES.newRequired
  else if (input.newPassword === input.oldPassword) errors.newPassword = PASSWORD_MESSAGES.different
  if (!input.confirmPassword) errors.confirmPassword = PASSWORD_MESSAGES.confirmRequired
  else if (input.confirmPassword !== input.newPassword) errors.confirmPassword = PASSWORD_MESSAGES.mismatch
  return errors
}
