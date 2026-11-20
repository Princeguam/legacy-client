import { COMMON_LABELS, FEEDBACK_MESSAGES } from '@/constants/strings'
import type { ApiFeedback } from '@/types/feedback'
import { Button } from '@/components/shared/Button'
import { Badge } from '@/components/shared/ui/badge'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/shared/Table'
import { formatFeedbackDate } from '@/lib/feedback'

export function FeedbackList({ rows, disabled, onSelect }: { rows: ApiFeedback[]; disabled: boolean; onSelect: (record: ApiFeedback) => void }) {
    return <><p className="table-scroll-hint type-caption">{COMMON_LABELS.tableScrollHint}</p><div className="table-region" role="region" aria-label="Feedback table" tabIndex={0}><Table><TableCaption className="sr-only">Feedback subjects, categories, senders and dates</TableCaption><TableHeader><TableRow><TableHead>{COMMON_LABELS.subject}</TableHead><TableHead>{COMMON_LABELS.category}</TableHead><TableHead>{FEEDBACK_MESSAGES.sender}</TableHead><TableHead>{FEEDBACK_MESSAGES.created}</TableHead><TableHead>{COMMON_LABELS.details}</TableHead></TableRow></TableHeader><TableBody>{rows.map(record => <TableRow key={record.id}><TableCell>{record.subject || COMMON_LABELS.notProvided}</TableCell><TableCell><Badge icon={false}>{record.category}</Badge></TableCell><TableCell><div className="cell-stack"><span>{record.member.firstName} {record.member.lastName}</span><span className="type-caption">{record.member.email}</span></div></TableCell><TableCell><time dateTime={record.created}>{formatFeedbackDate(record.created)}</time></TableCell><TableCell><Button variant="outline" disabled={disabled} onClick={() => onSelect(record)} aria-label={`${FEEDBACK_MESSAGES.view}: ${record.subject || record.id}`}>{FEEDBACK_MESSAGES.view}</Button></TableCell></TableRow>)}</TableBody></Table></div></>
}
