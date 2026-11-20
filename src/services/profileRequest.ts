import { API_MESSAGES, PROFILE_OPTIONAL_FIELDS, UPLOAD_MESSAGES } from '@/constants/strings'
import type { ApiUser, UpdateProfileRequest } from '@/types/user'
import { validateProfile } from '@/lib/profile'
import { uploadDestination } from '@/lib/uploads'
import { ApiError } from './apiClient'

export function profileBody(input: UpdateProfileRequest): UpdateProfileRequest {
    if (!input || !['firstName', 'lastName', 'email', 'phoneNo'].every(key => typeof input[key as keyof UpdateProfileRequest] === 'string') ||
        !PROFILE_OPTIONAL_FIELDS.every(key => input[key] == null || typeof input[key] === 'string')) throw new ApiError(API_MESSAGES.unavailable)
    const errors = validateProfile(input)
    if (Object.keys(errors).length) throw new ApiError(Object.values(errors)[0]!)
    if (input.passport && !uploadDestination(input.passport.trim())) throw new ApiError(API_MESSAGES.unavailable)
    const body: UpdateProfileRequest = { firstName: input.firstName.trim(), lastName: input.lastName.trim(), email: input.email.trim(), phoneNo: input.phoneNo.trim() }
    for (const key of PROFILE_OPTIONAL_FIELDS) {
        const value = input[key]?.trim()
        // Current profile handler retains most blank fields; omission keeps that behavior explicit.
        if (value) body[key] = value
    }
    return body
}

export function assertProfileSaved(data: ApiUser, body: UpdateProfileRequest): void {
    for (const [key, value] of Object.entries(body) as [keyof UpdateProfileRequest, string][]) {
        const actual = data[key]
        if (key === 'dob' ? actual?.slice(0, 10) !== value : actual !== value) throw new ApiError(UPLOAD_MESSAGES.profileNotSaved)
    }
}
