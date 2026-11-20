import { APP_LOCALE, COMMON_LABELS, LEDGER_TIME_ZONE, PROFILE_MESSAGES } from '@/constants/strings'
import { EMAIL_PATTERN } from '@/constants/values'
import type { ApiUser, ProfileFormErrors, ProfileFormValues, UpdateProfileRequest } from '@/types/user'
import { localToday } from '@/lib/transaction-drafts'

export function validateProfile(input: UpdateProfileRequest, today = localToday()): ProfileFormErrors {
  const errors: ProfileFormErrors = {}
  if (!input.firstName.trim()) errors.firstName = PROFILE_MESSAGES.firstNameRequired
  if (!input.lastName.trim()) errors.lastName = PROFILE_MESSAGES.lastNameRequired
  if (!EMAIL_PATTERN.test(input.email.trim())) errors.email = PROFILE_MESSAGES.emailInvalid
  if (!input.phoneNo.trim()) errors.phoneNo = PROFILE_MESSAGES.phoneRequired
  const dob = input.dob?.trim()
  if (dob) {
    const date = new Date(`${dob}T00:00:00Z`)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dob) || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== dob) errors.dob = PROFILE_MESSAGES.dobInvalid
    else if (dob > today) errors.dob = PROFILE_MESSAGES.dobFuture
  }
  return errors
}

export function profileFormValues(profile?: ApiUser): ProfileFormValues {
  return {
    firstName: profile?.firstName ?? '', middleName: profile?.middleName ?? '', lastName: profile?.lastName ?? '',
    email: profile?.email ?? '', phoneNo: profile?.phoneNo ?? '', dob: profileDateInput(profile?.dob),
    address: profile?.address ?? '', state: profile?.state ?? '', lga: profile?.lga ?? '', gender: profile?.gender ?? '',
    occupation: profile?.occupation ?? '', nextOfKinName: profile?.nextOfKinName ?? '', nextOfKinRelationship: profile?.nextOfKinRelationship ?? '', nextOfKinPhone: profile?.nextOfKinPhone ?? '',
    emergencyContact: profile?.emergencyContact ?? '', emergencyContactPhone: profile?.emergencyContactPhone ?? '', emergencyContactRelationship: profile?.emergencyContactRelationship ?? '',
  }
}

export function profileDateInput(value?: string | null): string {
  if (!value) return ''
  const date = new Date(value)
  return Number.isFinite(date.getTime()) ? date.toISOString().slice(0, 10) : ''
}

export function formatProfileDate(value?: string | null): string {
  if (!value) return COMMON_LABELS.notProvided
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return COMMON_LABELS.notProvided
  return new Intl.DateTimeFormat(APP_LOCALE, { day: 'numeric', month: 'short', year: 'numeric', timeZone: LEDGER_TIME_ZONE }).format(date)
}
