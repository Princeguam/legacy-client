import { MEMBER_SORTS } from '@/constants/strings'
import type { ApiUser, MemberListQuery, MemberOption, NewMemberFormValues, ProfileFormErrors } from '@/types/user'
import { validateProfile } from './profile'

export function memberQuery(params: URLSearchParams): MemberListQuery {
    const page = Number(params.get('page') ?? 1)
    const sort = params.get('sort')
    return {
        page: Number.isSafeInteger(page) && page > 0 ? page : 1,
        sort: sort && Object.hasOwn(MEMBER_SORTS, sort) ? sort as MemberListQuery['sort'] : 'newest',
        search: params.get('q')?.trim() ?? '',
        isActive: params.get('activity') !== 'inactive',
    }
}

export function memberName(user: Pick<ApiUser, 'firstName' | 'middleName' | 'lastName' | 'email'>): string {
    return [user.firstName, user.middleName, user.lastName].filter(Boolean).join(' ') || user.email
}

export function memberOptionName(user: MemberOption): string {
    return user.fullName?.trim() || user.email
}

export function validateNewMember(input: NewMemberFormValues): ProfileFormErrors {
    return validateProfile(input)
}
