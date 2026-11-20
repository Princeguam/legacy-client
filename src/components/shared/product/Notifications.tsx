import { notify } from '@/lib/notify'
import { RequestRecovery } from './RequestRecovery'
import { APP_LOCALE, COMMON_LABELS, NOTIFICATION_MESSAGES, NOTIFICATION_TYPE_LABELS } from '@/constants/strings'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { AuthSession } from '@/types/Auth'
import type { NotificationsResponseData } from '@/types/notification'
import { Link } from 'react-router-dom'
import { Bell, BellOff } from 'lucide-react'
import { Button, IconButton } from '@/components/shared/Button'
import { Dialog } from '@/components/shared/ui/dialog'
import { Badge } from '@/components/shared/ui/badge'
import { useProduct } from './product-context'
import { useAuth } from '@/context/useAuth'
import { PageLoader } from '@/components/shared/page-loader/PageLoader'
import { getUnreadNotifications, markAllNotificationsRead, markNotificationRead } from '@/services/userService'
import { formatNotificationDate, notificationDestination } from '@/lib/notifications'

function PreviewNotifications() {
  const [open, setOpen] = useState(false)
  return <><IconButton className="notification-button" label="Notifications, no preview updates" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}><Bell aria-hidden="true" /></IconButton>
    <Dialog open={open} onOpenChange={setOpen} title={NOTIFICATION_MESSAGES.title} description="Layout preview. Account notifications are available after signing in.">
      <div className="empty-state"><BellOff aria-hidden="true" /><p>No preview notifications.</p></div>
    </Dialog>
  </>
}

function NotificationsInbox({ session, basePath }: { session: AuthSession; basePath: string }) {
  const { accessToken } = session
  const accountId = session.user.id
  const role = session.user.role
  const [open, setOpen] = useState(false)
  const [data, setData] = useState<NotificationsResponseData | null>(null)
  const [page, setPage] = useState(1)
  const [attempt, setAttempt] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [mutation, setMutation] = useState<number | 'all' | null>(null)
  const submitting = useRef(false)
  const mutationController = useRef<AbortController | null>(null)
  const count = data?.totalItems ?? null

  const refresh = useCallback((nextPage = page) => {
    if (submitting.current) return
    setLoading(true)
    setLoadError('')
    setPage(nextPage)
    setAttempt(value => value + 1)
  }, [page])

  useEffect(() => {
    const controller = new AbortController()
    getUnreadNotifications(accessToken, accountId, page, controller.signal).then(result => {
      if (controller.signal.aborted) return
      if (page > Math.max(result.totalPages, 1)) { setPage(Math.max(result.totalPages, 1)); return }
      setData(result)
      setLoading(false)
    }).catch(error => {
      if (!controller.signal.aborted) {
        setLoadError('failed'); notify.error(error, NOTIFICATION_MESSAGES.unavailable)
        setLoading(false)
      }
    })
    return () => controller.abort()
  }, [accessToken, accountId, page, attempt])

  useEffect(() => {
    const onFocus = () => { if (document.visibilityState === 'visible') refresh() }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [refresh])
  useEffect(() => () => mutationController.current?.abort(), [])

  async function markRead(id: number | 'all') {
    if (submitting.current || loading || loadError || !data) return
    submitting.current = true
    setMutation(id)
    const controller = new AbortController()
    mutationController.current = controller
    try {
      if (id === 'all') await markAllNotificationsRead(accessToken, controller.signal)
      else await markNotificationRead(accessToken, id, controller.signal)
      if (controller.signal.aborted) return
      notify.success(id === 'all' ? NOTIFICATION_MESSAGES.allReadSaved : NOTIFICATION_MESSAGES.readSaved)
      setLoading(true)
      setLoadError('')
      if (id === 'all') setPage(1)
      setAttempt(value => value + 1)
    } catch (error) {
      if (!controller.signal.aborted) {
        notify.error(error, NOTIFICATION_MESSAGES.updateFailed)
      }
    } finally {
      submitting.current = false
      if (!controller.signal.aborted) setMutation(null)
    }
  }

  const countLabel = count === null ? (loading ? ', loading unread count' : ', unread count unavailable') :
    (count === 0 ? ', no unread notifications' : ', ' + new Intl.NumberFormat(APP_LOCALE).format(count) + ' unread notifications') + (loadError ? ', last loaded count' : '')
  const disabled = loading || !!loadError || mutation !== null

  return <>
    <IconButton className="notification-button" label={NOTIFICATION_MESSAGES.title + countLabel} aria-haspopup="dialog" aria-expanded={open} onClick={() => { setOpen(true); refresh(1) }}>
      <Bell aria-hidden="true" />{count !== null && count > 0 && <span className="notification-count" aria-hidden="true">{new Intl.NumberFormat(APP_LOCALE).format(count)}</span>}
    </IconButton>
    <Dialog open={open} onOpenChange={setOpen} title={NOTIFICATION_MESSAGES.title} description={NOTIFICATION_MESSAGES.description} busy={mutation !== null} footer={count !== null && count > 0 ? <Button variant="outline" loading={mutation === 'all'} disabled={loading || !!loadError || (mutation !== null && mutation !== 'all')} onClick={() => void markRead('all')}>{NOTIFICATION_MESSAGES.markAllRead}</Button> : undefined}>
      <div className="notification-inbox">
        {loadError && <RequestRecovery stale={!!data} onRetry={() => refresh()} />}
        {loading ? <PageLoader /> : data && <>
          <div className="notification-toolbar"><span className="type-label">{new Intl.NumberFormat(APP_LOCALE).format(data.totalItems)} unread</span><Button variant="ghost" disabled={mutation !== null} onClick={() => refresh()}>Refresh</Button></div>
          {data.totalItems === 0 ? <div className="empty-state"><BellOff aria-hidden="true" /><p>{NOTIFICATION_MESSAGES.empty}</p></div> : <ul className="notification-list">{data.pageData.map(item => {
            const destination = notificationDestination(item.link, basePath, role)
            return <li key={item.id}>
              <h3 className="type-body">{item.title}</h3>
              <div className="notification-metadata"><Badge icon={false}>{NOTIFICATION_TYPE_LABELS[item.type]}</Badge><time className="type-caption" dateTime={item.created}>{formatNotificationDate(item.created)}</time></div>
              <p className="notification-body type-label">{item.body}</p>
              <div className="notification-actions">{destination && <Link className="standalone-link type-label" to={destination} onClick={() => setOpen(false)}>View details<span className="sr-only"> for {item.title}</span></Link>}<Button variant="outline" loading={mutation === item.id} disabled={loading || !!loadError || (mutation !== null && mutation !== item.id)} aria-label={NOTIFICATION_MESSAGES.markRead + ': ' + item.title} onClick={() => void markRead(item.id)}>{NOTIFICATION_MESSAGES.markRead}</Button></div>
            </li>
          })}</ul>}
          {data.totalPages > 1 && <nav className="notification-pagination" aria-label="Notification pages"><Button variant="outline" disabled={disabled || page <= 1} onClick={() => refresh(page - 1)}>{COMMON_LABELS.previous}</Button><span className="type-label">Page {data.page} of {data.totalPages}</span><Button variant="outline" disabled={disabled || page >= data.totalPages} onClick={() => refresh(page + 1)}>{COMMON_LABELS.next}</Button></nav>}
        </>}
      </div>
    </Dialog>
  </>
}

function ConnectedNotifications({ basePath }: { basePath: string }) {
  const { session } = useAuth()
  if (!session) return null
  return <NotificationsInbox key={[session.accessToken, session.user.id, session.user.role].join(':')} session={session} basePath={basePath} />
}

export function Notifications() {
  const { preview, basePath } = useProduct()
  return preview ? <PreviewNotifications /> : <ConnectedNotifications basePath={basePath} />
}
