import { notify } from '@/lib/notify'
import { RequestRecovery } from '@/components/shared/product/RequestRecovery'
import type { RefObject } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Plus, RefreshCw, Search, Users } from 'lucide-react'
import { COMMON_LABELS, MEMBER_MESSAGES, MEMBER_SORTS, PAGE_LABELS, PAGE_PATHS } from '@/constants/strings'
import { PAGE_SIZES } from '@/constants/values'
import type { AuthSession } from '@/types/Auth'
import type { ApiUser, MemberListData, MemberListQuery } from '@/types/user'
import { useAuth } from '@/context/useAuth'
import { useProduct } from '@/components/shared/product/product-context'
import { Button } from '@/components/shared/Button'
import { Card } from '@/components/shared/ui/card'
import { Input } from '@/components/shared/ui/input'
import { NativeSelect } from '@/components/shared/ui/native-select'
import { FormField } from '@/components/shared/form-field/form-field'
import { PageHeader } from '@/components/shared/product/PageHeader'
import { PageLoader } from '@/components/shared/page-loader/PageLoader'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/shared/Table'
import { AccountAvatar } from '@/components/shared/account-avatar/account-avatar'
import { AccountRoleBadge } from '@/components/shared/account-information/AccountRoleBadge'
import { AddUserDialog } from '@/components/shared/account-information/AddUserDialog'
import { formatProfileDate } from '@/lib/profile'
import { memberName, memberQuery } from '@/lib/members'
import { getMembers } from '@/services/adminService'
import { toAuthUser } from '@/services/apiUser'
import { isValidSession } from '@/services/authService'
import './Members.css'

function MemberDirectory({ session, preview, query, pageFocusRef, onPageChange }: { session: AuthSession | null; preview: boolean; query: MemberListQuery; pageFocusRef: RefObject<'previous' | 'next' | null>; onPageChange: (page: number) => void }) {
    const { basePath } = useProduct()
    const [data, setData] = useState<MemberListData | null>(preview ? { page: query.page, count: 0, totalItems: 0, totalPages: 0, pageData: [] } : null)
    const [loading, setLoading] = useState(!preview)
    const [error, setError] = useState('')
    const [attempt, setAttempt] = useState(0)
    const paginationRef = useRef<HTMLElement>(null)
    useEffect(() => {
        if (!data || loading || !pageFocusRef.current) return
        const button = paginationRef.current?.querySelector<HTMLButtonElement>(`[data-page-action="${pageFocusRef.current}"]`)
        if (button && !button.disabled) button.focus()
        else paginationRef.current?.focus()
        pageFocusRef.current = null
    }, [data, loading, pageFocusRef])
    useEffect(() => {
        if (preview || !session) return
        const controller = new AbortController()
        getMembers(session, query, controller.signal).then(result => {
            if (controller.signal.aborted || !isValidSession(session)) return
            setData(result); setLoading(false)
        }).catch(error => { if (!controller.signal.aborted) { setError('failed'); notify.error(error, MEMBER_MESSAGES.loadFailed); setLoading(false) } })
        return () => controller.abort()
    }, [session, preview, query, attempt])
    function refresh() { setError(''); setLoading(true); setAttempt(value => value + 1) }
    const disabled = loading || !!error
    function action(user: ApiUser) {
        return disabled ? <Button variant="ghost" disabled>{COMMON_LABELS.view}</Button> : <Link className="action-link member-view" aria-label={`View ${memberName(user)}`} to={`${basePath}/${PAGE_PATHS.members}/${user.id}`}>{COMMON_LABELS.view}</Link>
    }
    const invalidPage = data && query.page > Math.max(1, data.totalPages)
    return <Card className="product-card member-directory" aria-busy={loading || undefined}>
        <div className="card-heading"><h2 className="type-title">{query.isActive ? MEMBER_MESSAGES.active : MEMBER_MESSAGES.inactive} users</h2>{!preview && <Button variant="outline" loading={loading} onClick={refresh}><RefreshCw aria-hidden="true" />Refresh</Button>}</div>
        {error && <RequestRecovery stale={!!data} onRetry={refresh} />}
        {loading && <PageLoader />}
        {data && <>
            {!!data.count && <><p className="table-scroll-hint type-caption">{COMMON_LABELS.tableScrollHint}</p><div className="table-region member-table" role="region" aria-label="User directory" tabIndex={0}><Table><TableCaption className="sr-only">Users, contact details, account roles and joining dates</TableCaption><TableHeader><TableRow><TableHead>User</TableHead><TableHead>{COMMON_LABELS.phoneNumber}</TableHead><TableHead>Account role</TableHead><TableHead>Joined</TableHead><TableHead>{COMMON_LABELS.details}</TableHead></TableRow></TableHeader><TableBody>{data.pageData.map(user => <TableRow key={user.id}><TableCell><div className="member-identity"><AccountAvatar user={toAuthUser(user)} small /><div className="cell-stack"><span>{memberName(user)}</span><span className="type-caption">{user.email}</span></div></div></TableCell><TableCell>{user.phoneNo || COMMON_LABELS.notProvided}</TableCell><TableCell><AccountRoleBadge role={user.role} /></TableCell><TableCell>{formatProfileDate(user.created)}</TableCell><TableCell>{action(user)}</TableCell></TableRow>)}</TableBody></Table></div></>}
            {!data.count && <div className="empty-state"><Users aria-hidden="true" /><h3 className="type-title">No users found</h3><p>{preview ? 'User records appear here when you sign in as an administrator.' : 'Try a different search or switch the activity filter.'}</p></div>}
            {invalidPage ? <Button variant="outline" disabled={disabled} onClick={() => onPageChange(Math.max(1, data.totalPages))}>Go to the last available page</Button> : data.totalPages > 0 && <div className="pagination"><p className="type-label" role="status">{(query.page - 1) * PAGE_SIZES.members + 1}–{(query.page - 1) * PAGE_SIZES.members + data.count} of {data.totalItems} users{error ? ' · last loaded results' : ''}</p><nav ref={paginationRef} tabIndex={-1} className="pagination-controls" aria-label="User pagination"><Button variant="outline" data-page-action="previous" disabled={disabled || query.page === 1} onClick={() => onPageChange(query.page - 1)}>{COMMON_LABELS.previous}</Button><span className="type-label">Page {query.page} of {data.totalPages}</span><Button variant="outline" data-page-action="next" disabled={disabled || query.page >= data.totalPages} onClick={() => onPageChange(query.page + 1)}>{COMMON_LABELS.next}</Button></nav></div>}
        </>}
    </Card>
}

export function ManageUsers() {
    const { preview, basePath } = useProduct()
    const { session } = useAuth()
    const [params, setParams] = useSearchParams()
    const [adding, setAdding] = useState(false)
    const [createdVersion, setCreatedVersion] = useState(0)
    const pageFocusRef = useRef<'previous' | 'next' | null>(null)
    const query = useMemo(() => memberQuery(params), [params])
    function filter(key: string, value: string) {
        const next = new URLSearchParams(params)
        if (value) next.set(key, value); else next.delete(key)
        next.delete('page'); setParams(next, { replace: true })
    }
    function changePage(page: number) { pageFocusRef.current = page > query.page ? 'next' : 'previous'; const next = new URLSearchParams(params); next.set('page', String(page)); setParams(next) }
    return <div className="page-stack members-page">
        <PageHeader title={PAGE_LABELS.members} description="Find users, view their account details and review their transactions." actions={<Button onClick={() => setAdding(true)}><Plus aria-hidden="true" />{MEMBER_MESSAGES.add}</Button>} />
        <Card className="product-card member-filters" aria-label="User filters"><div className="member-filter-fields">
            <FormField label="Search users">{bindings => <div className="filter-search"><Search aria-hidden="true" /><Input {...bindings} type="search" value={params.get('q') ?? ''} onChange={event => filter('q', event.target.value)} placeholder="Name, email, phone or address" /></div>}</FormField>
            <FormField label="Account activity">{bindings => <NativeSelect {...bindings} value={query.isActive ? 'active' : 'inactive'} onChange={event => filter('activity', event.target.value)}><option value="active">{MEMBER_MESSAGES.active}</option><option value="inactive">{MEMBER_MESSAGES.inactive}</option></NativeSelect>}</FormField>
            <FormField label="Sort users">{bindings => <NativeSelect {...bindings} value={query.sort} onChange={event => filter('sort', event.target.value)}>{Object.entries(MEMBER_SORTS).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}</NativeSelect>}</FormField>
        </div><div className="inline-actions"><Button variant="ghost" onClick={() => setParams({})}>{COMMON_LABELS.clearFilters}</Button></div></Card>
        <MemberDirectory key={`${preview ? 'preview' : session?.accessToken}:${session?.user.id}:${basePath}:${JSON.stringify(query)}:${createdVersion}`} session={preview ? null : session} preview={preview} query={query} pageFocusRef={pageFocusRef} onPageChange={changePage} />
        {adding && <AddUserDialog key={`${basePath}:${preview ? 'preview' : session?.user.id}`} session={preview ? null : session} onClose={() => setAdding(false)} onCreated={user => { setAdding(false); notify.success(`${memberName(user)} has been created.`); setCreatedVersion(value => value + 1) }} />}
    </div>
}
