import assert from 'node:assert/strict'
import { createServer } from 'vite'

const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
const originalFetch = globalThis.fetch
try {
  const { getUnreadNotifications, markNotificationRead, markAllNotificationsRead } = await server.ssrLoadModule('/src/services/userService.ts')
  const { ApiError } = await server.ssrLoadModule('/src/services/apiClient.ts')
  const { notificationDestination } = await server.ssrLoadModule('/src/lib/notifications.ts')
  const notification = { id: 8, userId: 42, type: 'Deposit_Approved', title: 'Deposit confirmed', body: 'Your deposit was confirmed.', link: '/transactions?type=Contribution', readAt: null, created: '2026-11-18T10:00:00.000Z' }
  const page = { page: 1, count: 1, totalPages: 2, totalItems: 11, pageData: [notification] }
  const response = data => new Response(JSON.stringify({ success: true, message: 'Request Successful', data }), { status: 200 })
  const requests = []
  globalThis.fetch = async (url, options) => { requests.push({ url, options }); return response({ ...page, pageData: [{ ...notification, secret: 'exclude-me' }] }) }
  assert.deepEqual(await getUnreadNotifications('notifications-test-token', 42), page)
  const request = requests[0]
  const url = new URL(request.url, 'https://frontend.test')
  assert.equal(url.pathname, '/api/notification/all')
  assert.deepEqual(Object.fromEntries(url.searchParams), { page: '1', count: '10', unRead: 'true', by: 'created', order: 'desc' })
  assert.equal(request.options.headers.Authorization, 'Bearer notifications-test-token')
  assert.equal(request.options.method, 'GET')
  assert.equal(request.options.body, undefined)
  const secondPage = { ...page, page: 2 }
  globalThis.fetch = async () => response(secondPage)
  assert.deepEqual(await getUnreadNotifications('notifications-test-token', 42, 2), secondPage)
  globalThis.fetch = async () => response({ page: 1, count: 0, totalPages: 0, totalItems: 0, pageData: [] })
  assert.equal((await getUnreadNotifications('notifications-test-token', 42)).totalItems, 0)

  for (const invalid of [null, {}, { ...page, page: 2 }, { ...page, count: 2 }, { ...page, totalItems: -1 }, { ...page, totalPages: 1 }, { ...page, pageData: [{ ...notification, readAt: notification.created }] }, { ...page, pageData: [{ ...notification, created: 'invalid-date' }] }, { ...page, pageData: [{ ...notification, type: 'Unknown' }] }, { ...page, pageData: [{ ...notification, userId: 9 }] }, { ...page, count: 2, pageData: [notification, notification] }]) {
    globalThis.fetch = async () => response(invalid)
    await assert.rejects(getUnreadNotifications('notifications-test-token', 42), ApiError)
  }
  for (const invalidPage of [0, -1, 1.5, NaN]) await assert.rejects(getUnreadNotifications('notifications-test-token', 42, invalidPage), ApiError)
  await assert.rejects(getUnreadNotifications(' ', 42), ApiError)

  globalThis.fetch = async (url, options) => { requests.push({ url, options }); return response(null) }
  assert.equal(await markNotificationRead('notifications-test-token', 8), null)
  assert.equal(requests.at(-1).url, '/api/notification/8?isRead=true')
  assert.equal(requests.at(-1).options.method, 'PUT')
  assert.equal(requests.at(-1).options.body, undefined)
  assert.equal(requests.at(-1).options.headers.Authorization, 'Bearer notifications-test-token')
  assert.equal(await markAllNotificationsRead('notifications-test-token'), null)
  assert.equal(requests.at(-1).url, '/api/notification/all')
  assert.equal(requests.at(-1).options.method, 'PUT')
  for (const id of [0, -1, 1.5, 2147483648, NaN]) await assert.rejects(markNotificationRead('notifications-test-token', id), ApiError)
  await assert.rejects(markAllNotificationsRead(''), ApiError)
  globalThis.fetch = async () => response({ count: 1 })
  await assert.rejects(markNotificationRead('notifications-test-token', 8), ApiError)
  globalThis.fetch = async () => new Response(JSON.stringify({ success: false, message: 'Notification Not Found', errorCode: 1031 }), { status: 400 })
  await assert.rejects(markNotificationRead('notifications-test-token', 8), error => error instanceof ApiError && error.message === 'Notification Not Found' && error.errorCode === 1031 && error.status === 400)
  globalThis.fetch = async () => new Response('Not Found', { status: 404 })
  await assert.rejects(getUnreadNotifications('notifications-test-token', 42), error => error instanceof ApiError && error.status === 404)
  globalThis.fetch = async () => { throw new TypeError('Network unavailable') }
  await assert.rejects(getUnreadNotifications('notifications-test-token', 42), /Unable to connect/)
  globalThis.fetch = async (_url, { signal }) => new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(new DOMException('Cancelled', 'AbortError')), { once: true }))
  const controller = new AbortController()
  const pending = markAllNotificationsRead('notifications-test-token', controller.signal)
  controller.abort()
  await assert.rejects(pending, error => error.name === 'AbortError')

  assert.equal(notificationDestination('/transactions?q=abc#history', '/user', 'user'), '/user/transactions?q=abc#history')
  assert.equal(notificationDestination('/user/profile', '/user', 'user'), '/user/profile')
  assert.equal(notificationDestination('/members/42', '/admin', 'Admin'), '/admin/members/42')
  for (const link of [null, 'javascript:alert(1)', 'https://example.com/user/profile', '//example.com', '/admin/profile', '/members', '/preview/user/profile', '/transactions/abc', '/user/../admin/profile', '/user/unknown', '/user/transactions\\evil', '/profile\n']) {
    assert.equal(notificationDestination(link, '/user', 'user'), null, 'Unsupported or cross-workspace links must not be used: ' + link)
  }
  console.log('Notification checks passed: unread pagination/counts, account ownership, exact GET/PUT contracts, null acknowledgements, backend errors, cancellation and workspace links.')
} finally {
  globalThis.fetch = originalFetch
  await server.close()
}
