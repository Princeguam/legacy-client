import { API_MESSAGES, MEMBER_MESSAGES } from '@/constants/strings'
import { PAGE_SIZES } from '@/constants/values'
import { isRecord } from '@/lib/is-record'
import { validAccountId } from '@/lib/transactions'
import type { ApiUser, MemberListData, MemberOption } from '@/types/user'
import { ApiError } from './apiClient'
import { isApiUser, selectApiUser } from './apiUser'

const validCount = (value: unknown): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0

export function parseMemberOptions(data: unknown): MemberOption[] {
    if (!Array.isArray(data)) throw new ApiError(API_MESSAGES.unavailable)
    const users = data.map(value => {
        if (!isRecord(value) || !validAccountId(value.id) || (value.fullName !== null && typeof value.fullName !== 'string') || typeof value.email !== 'string' || !value.email.trim() || typeof value.phoneNo !== 'string') throw new ApiError(API_MESSAGES.unavailable)
        return { id: value.id, fullName: value.fullName, email: value.email, phoneNo: value.phoneNo }
    })
    if (new Set(users.map(user => user.id)).size !== users.length) throw new ApiError(API_MESSAGES.unavailable)
    return users
}

export function parseMember(data: unknown, id?: number): ApiUser {
    if (!isApiUser(data) || !validAccountId(data.id)) throw new ApiError(API_MESSAGES.unavailable)
    if (id !== undefined && data.id !== id) throw new ApiError(MEMBER_MESSAGES.wrongRecord)
    return selectApiUser(data)
}

export function parseMemberList(data: unknown, page: number): MemberListData {
    if (!isRecord(data) || data.page !== page || !validCount(data.count) || !validCount(data.totalItems) || !validCount(data.totalPages) ||
        !Array.isArray(data.pageData) || data.count !== data.pageData.length || data.count > PAGE_SIZES.members ||
        data.totalPages !== Math.ceil(data.totalItems / PAGE_SIZES.members) ||
        data.count !== Math.min(PAGE_SIZES.members, Math.max(0, data.totalItems - (page - 1) * PAGE_SIZES.members))) throw new ApiError(API_MESSAGES.unavailable)
    const pageData = data.pageData.map(record => parseMember(record))
    if (new Set(pageData.map(record => record.id)).size !== pageData.length) throw new ApiError(API_MESSAGES.unavailable)
    return { page, count: data.count, totalItems: data.totalItems, totalPages: data.totalPages, pageData }
}
