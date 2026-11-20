import { SERVER_MEMBER_ROLE, USER_ROLES } from '@/constants/strings'
import { isRecord } from '@/lib/is-record'
import type { AuthUser } from '@/types/Auth'
import type { ApiUser } from '@/types/user'

export const profileFields = ['firstName', 'lastName', 'phoneNo', 'created', 'updated'] as const
export const nullableProfileFields = ['middleName', 'dob', 'address', 'state', 'lga', 'gender', 'passport'] as const
const extendedProfileFields = ['occupation', 'nextOfKinName', 'nextOfKinRelationship', 'nextOfKinPhone', 'emergencyContact', 'emergencyContactPhone', 'emergencyContactRelationship'] as const

export function isApiUser(value: unknown): value is ApiUser {
  return isRecord(value) &&
    typeof value.id === 'number' && Number.isSafeInteger(value.id) && value.id > 0 &&
    typeof value.email === 'string' && value.email.trim().length > 0 &&
    (value.role === SERVER_MEMBER_ROLE || value.role === USER_ROLES.admin) &&
    profileFields.every(key => typeof value[key] === 'string') &&
    nullableProfileFields.every(key => value[key] === null || typeof value[key] === 'string') &&
    extendedProfileFields.every(key => value[key] === undefined || value[key] === null || typeof value[key] === 'string') &&
    typeof value.isAdmin === 'boolean' && typeof value.isDeleted === 'boolean'
}

/** Explicitly select public fields, excluding passwords and unexpected response fields. */
export function selectApiUser(data: ApiUser): ApiUser {
  return {
    id: data.id, firstName: data.firstName, middleName: data.middleName, lastName: data.lastName,
    email: data.email, phoneNo: data.phoneNo, dob: data.dob, address: data.address,
    state: data.state, lga: data.lga, gender: data.gender, passport: data.passport,
    role: data.role, isAdmin: data.isAdmin, isDeleted: data.isDeleted, created: data.created, updated: data.updated,
    ...Object.fromEntries(extendedProfileFields.filter(key => data[key] !== undefined).map(key => [key, data[key]])),
  }
}

export function toAuthUser(data: ApiUser): AuthUser {
  return { ...selectApiUser(data), role: data.role === SERVER_MEMBER_ROLE ? USER_ROLES.user : USER_ROLES.admin }
}
