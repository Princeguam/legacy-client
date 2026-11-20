import { COMMON_LABELS, FEEDBACK_MESSAGES } from '@/constants/strings'
import { formatFeedbackDate } from '@/lib/feedback'
import type { ApiFeedback } from '@/types/feedback'
import { Badge } from '@/components/shared/ui/badge'

export function FeedbackDetails({ feedback }: { feedback: ApiFeedback }) {
    return <div className="feedback-details">
        <dl className="detail-list">
            <div><dt>{COMMON_LABELS.subject}</dt><dd>{feedback.subject || COMMON_LABELS.notProvided}</dd></div>
            <div><dt>{COMMON_LABELS.category}</dt><dd><Badge icon={false}>{feedback.category}</Badge></dd></div>
            <div><dt>{FEEDBACK_MESSAGES.sender}</dt><dd>{feedback.member.firstName} {feedback.member.lastName}<br />{feedback.member.email}</dd></div>
            <div><dt>Feedback ID</dt><dd className="financial">{feedback.id}</dd></div>
            <div><dt>{FEEDBACK_MESSAGES.created}</dt><dd><time dateTime={feedback.created}>{formatFeedbackDate(feedback.created)}</time></dd></div>
        </dl>
        <div><h3 className="type-title">{FEEDBACK_MESSAGES.message}</h3><p className="feedback-message">{feedback.message}</p></div>
    </div>
}
