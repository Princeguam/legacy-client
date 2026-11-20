import { notify } from '@/lib/notify'
import { RequestRecovery } from '@/components/shared/product/RequestRecovery'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { PAGE_LABELS, PAGE_PATHS, MEMBER_MESSAGES, USER_ROLES } from '@/constants/strings'
import type { AuthSession } from '@/types/Auth'
import type { ApiUser } from '@/types/user'
import { useAuth } from '@/context/useAuth'
import { useProduct } from '@/components/shared/product/product-context'
import { PageHeader } from '@/components/shared/product/PageHeader'
import { PageLoader } from '@/components/shared/page-loader/PageLoader'
import { Alert } from '@/components/shared/ui/alert'
import { AccountInformation } from '@/components/shared/account-information/AccountInformation'
import { TransactionHistory } from '@/components/shared/transactions/TransactionHistory'
import { TransactionFilters } from '@/components/shared/transactions/TransactionFilters'
import { paymentQuery, paymentQueryError, validAccountId } from '@/lib/transactions'
import { getMember } from '@/services/adminService'
import { toAuthUser } from '@/services/apiUser'
import { isValidSession } from '@/services/authService'
import '../user/Transactions.css'
import './Members.css'

function ConnectedMember({ session, memberId }: { session: AuthSession; memberId: number }) {
    const [user, setUser] = useState<ApiUser | null>(null)
    const [error, setError] = useState('')
    const [attempt, setAttempt] = useState(0)
    const [params, setParams] = useSearchParams()
    const query = useMemo(() => paymentQuery(params, USER_ROLES.admin), [params])
    const queryError = paymentQueryError(query)
    useEffect(() => {
        const controller = new AbortController()
        getMember(session, memberId, controller.signal).then(result => {
            if (!controller.signal.aborted && isValidSession(session)) setUser(result)
        }).catch(error => { if (!controller.signal.aborted) { setError('failed'); notify.error(error, MEMBER_MESSAGES.loadFailed) } })
        return () => controller.abort()
    }, [session, memberId, attempt])
    function filter(key: string, value: string) {
        const next = new URLSearchParams(params)
        if (value) next.set(key, value); else next.delete(key)
        next.delete('page'); setParams(next, { replace: true })
    }
    function changePage(page: number) { const next = new URLSearchParams(params); next.set('page', String(page)); setParams(next) }
    if (error) return <RequestRecovery onRetry={() => { setError(''); setAttempt(value => value + 1) }} />
    if (!user) return <PageLoader />
    return <>
        <AccountInformation user={toAuthUser(user)} accountLabel="Selected user" />
        <TransactionFilters admin query={query} queryError={queryError} searchValue={params.get('q') ?? ''} filter={filter} onClear={() => setParams({})} />
        {queryError ? <Alert tone="danger" title="Check the date range" role="alert">{queryError}</Alert> : <TransactionHistory key={`${memberId}:${JSON.stringify(query)}`} session={session} preview={false} memberId={memberId} query={query} onPageChange={changePage} onNotice={notify.success} />}
    </>
}

export function MemberDetails() {
    const { memberId: value } = useParams()
    const memberId = value && /^\d+$/.test(value) ? Number(value) : NaN
    const { session } = useAuth()
    const { preview, basePath } = useProduct()
    return <div className="page-stack transactions-page members-page">
        <PageHeader title={PAGE_LABELS.memberDetails} description="Personal information and transactions for the selected user." actions={<Link className="action-link" to={`${basePath}/${PAGE_PATHS.members}`}><ArrowLeft aria-hidden="true" />Back to members</Link>} />
        {preview ? <Alert title="User details preview">Sign in as an administrator and select a user to view their profile and transactions.</Alert> : !validAccountId(memberId) ? <Alert tone="danger" title="Invalid user" role="alert">Select a user from the member directory.</Alert> : session && <ConnectedMember key={`${session.accessToken}:${session.user.id}:${basePath}:${memberId}`} session={session} memberId={memberId} />}
    </div>
}
