import { Button } from '@/components/shared/Button'

export function RequestRecovery({ onRetry, stale = false }: { onRetry: () => void; stale?: boolean }) {
    return <div className="settings-form">{stale && <p className="type-label">Showing the last loaded results. Refresh to check for updates.</p>}<div><Button variant="outline" onClick={onRetry}>Try again</Button></div></div>
}
