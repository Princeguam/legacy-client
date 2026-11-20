import { useState } from 'react'
import { ExternalLink, FileText } from 'lucide-react'
import { COMMON_LABELS } from '@/constants/strings'
import { receiptDestination } from '@/lib/transactions'
import './receipt.css'

function AttachmentPreview({ url }: { url: string }) {
    const [failed, setFailed] = useState(false)
    return <a className="receipt-attachment" href={url} target="_blank" rel="noopener noreferrer" aria-label="Open receipt in a new tab">
        <span className="receipt-attachment-preview">{failed ? <FileText aria-hidden="true" /> : <img src={url} alt="Receipt thumbnail" referrerPolicy="no-referrer" onError={() => setFailed(true)} />}</span>
        <span className="type-label">Open receipt <ExternalLink aria-hidden="true" /></span>
    </a>
}

/** URL extensions are not reliable for storage objects; failed image previews retain a document link. */
export function ReceiptAttachment({ url }: { url: string | null }) {
    const destination = receiptDestination(url)
    return destination ? <AttachmentPreview key={destination} url={destination} /> : <span>{COMMON_LABELS.notProvided}</span>
}
