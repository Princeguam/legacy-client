import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { FEEDBACK_MESSAGES, PAGE_LABELS, PAGE_PATHS, USER_ROLES } from '@/constants/strings'
import { useAuth } from '@/context/useAuth'
import { useProduct } from '@/components/shared/product/product-context'
import { PageHeader } from '@/components/shared/product/PageHeader'
import { FeedbackForm } from '@/components/shared/feedback/FeedbackForm'

export function Feedback() {
    const { preview, role, basePath } = useProduct()
    const { session } = useAuth()
    const admin = role === USER_ROLES.admin
    return <div className="page-stack feedback-screen">
        {admin && <Link to={`${basePath}/${PAGE_PATHS.feedback}`} className="standalone-link type-label"><ArrowLeft aria-hidden="true" />Back to feedback</Link>}
        <PageHeader title={admin ? FEEDBACK_MESSAGES.create : PAGE_LABELS.feedback} description="Help shape the cooperative workspace. Share an idea or describe an issue." />
        <FeedbackForm key={preview ? `${basePath}:preview` : `${session?.user.id}:${session?.user.role}:${session?.accessToken}`} session={preview ? null : session} preview={preview} />
    </div>
}
