import assert from 'node:assert/strict'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { createServer } from 'vite'

const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
const originalFetch = globalThis.fetch
try {
    const { createFeedback } = await server.ssrLoadModule('/src/services/userService.ts')
    const { getFeedbacks, getFeedback } = await server.ssrLoadModule('/src/services/adminService.ts')
    const { parseFeedback, parseFeedbackList } = await server.ssrLoadModule('/src/services/feedbackResponse.ts')
    const { validateFeedback, feedbackQuery, formatFeedbackDate } = await server.ssrLoadModule('/src/lib/feedback.ts')
    const { ApiError } = await server.ssrLoadModule('/src/services/apiClient.ts')
    const member = {
        id: 42, firstName: 'Actual', middleName: null, lastName: 'Member', email: 'member@example.com',
        phoneNo: '+234 800 000 0000', dob: '1995-01-01', address: 'Lagos', state: null, lga: null,
        gender: null, passport: null, role: 'User', isAdmin: false, isDeleted: false,
        created: '2025-06-12T10:00:00Z', updated: '2026-11-18T10:00:00Z', password: 'exclude-this',
    }
    const record = { id: 7, userId: 42, subject: 'Reporting issue', message: 'Please review this\nissue.', category: 'Bug', created: '2026-11-18T10:00:00Z', updated: '2026-11-18T10:00:00Z', member, unexpected: true }
    const account = { id: 42, role: 'user' }
    const admin = { user: { id: 1, email: 'admin@example.com', role: 'Admin' }, accessToken: 'feedback-test-token', refreshToken: 'feedback-refresh', expiresAt: Date.now() + 60_000 }
    const response = data => new Response(JSON.stringify({ success: true, message: 'Request Successful', data }), { status: 200 })
    const requests = []
    globalThis.fetch = async (url, options) => { requests.push({ url, options }); return response(record) }
    const sent = await createFeedback('member-token', account, { category: 'Bug', subject: ' Reporting issue ', message: ' Please review this\nissue. ', userId: 99, role: 'Admin' })
    assert.equal(sent.userId, 42)
    assert.deepEqual(JSON.parse(requests[0].options.body), { category: 'Bug', subject: 'Reporting issue', message: 'Please review this\nissue.' })
    assert.equal(requests[0].url, '/api/feedback')
    assert.equal(requests[0].options.method, 'POST')
    assert.equal(requests[0].options.headers.Authorization, 'Bearer member-token')
    assert.equal(sent.member.phoneNo, undefined)
    assert.equal(sent.member.password, undefined)
    assert.equal(sent.unexpected, undefined)
    for (const category of ['General', 'Bug', 'Suggestion']) {
        globalThis.fetch = async () => response({ ...record, category })
        assert.equal((await createFeedback('member-token', account, { category, subject: 'Test', message: 'Test' })).category, category)
    }
    globalThis.fetch = async () => response({ ...record, userId: 1, member: { ...member, id: 1, role: 'Admin' } })
    assert.equal((await createFeedback(admin.accessToken, admin.user, { category: 'Bug', subject: 'Test', message: 'Test' })).member.role, 'Admin')
    await assert.rejects(createFeedback('member-token', account, { category: 'Bug', subject: 'Test', message: 'Test' }), /does not match/)
    globalThis.fetch = async () => response({ ...record, member: { ...member, role: 'Admin' } })
    await assert.rejects(createFeedback('member-token', account, { category: 'Bug', subject: 'Test', message: 'Test' }), /does not match/)
    const before = requests.length
    await assert.rejects(createFeedback('', account, { category: 'Bug', subject: 'Test', message: 'Test' }), ApiError)
    for (const input of [{ category: 'Bug Feedback', subject: 'Test', message: 'Test' }, { category: 'Bug', subject: ' ', message: 'Test' }, { category: 'Bug', subject: 'Test', message: ' ' }]) await assert.rejects(createFeedback('member-token', account, input), ApiError)
    assert.equal(requests.length, before)

    const firstPage = { page: 1, count: 10, totalItems: 11, totalPages: 2, pageData: Array.from({ length: 10 }, (_, index) => ({ ...record, id: index + 1 })) }
    globalThis.fetch = async (url, options) => { requests.push({ url, options }); return response(firstPage) }
    for (const [sort, by, order] of [['newest', 'created', 'desc'], ['oldest', 'created', 'asc'], ['categoryAsc', 'category', 'asc'], ['categoryDesc', 'category', 'desc']]) {
        const list = await getFeedbacks(admin, { page: 1, sort })
        const request = requests.at(-1)
        const url = new URL(request.url, 'http://localhost')
        assert.equal(url.pathname, '/api/admin/feedback/all')
        assert.deepEqual(Object.fromEntries(url.searchParams), { page: '1', count: '10', by, order })
        assert.equal(request.options.method, 'GET')
        assert.equal(request.options.body, undefined)
        assert.equal(request.options.headers.Authorization, 'Bearer feedback-test-token')
        assert.deepEqual(list.pageData.map(item => item.id), firstPage.pageData.map(item => item.id), 'The frontend must preserve server order, including category sorting.')
        assert.equal(list.totalItems, 11)
    }
    globalThis.fetch = async () => response({ page: 2, count: 1, totalItems: 11, totalPages: 2, pageData: [record] })
    assert.equal((await getFeedbacks(admin, { page: 2, sort: 'categoryAsc' })).count, 1)
    globalThis.fetch = async () => response({ page: 1, count: 0, totalItems: 0, totalPages: 0, pageData: [] })
    assert.equal((await getFeedbacks(admin, { page: 1, sort: 'newest' })).totalItems, 0)
    for (const invalid of [null, { ...firstPage, page: 2 }, { ...firstPage, count: 1 }, { ...firstPage, totalPages: null }, { ...firstPage, pageData: firstPage.pageData.map(() => record) }]) assert.throws(() => parseFeedbackList(invalid, 1), ApiError)
    for (const invalid of [{ ...record, category: 'Unknown' }, { ...record, created: 'not-a-date' }, { ...record, member: { ...member, id: 99 } }, { ...record, id: -1 }]) assert.throws(() => parseFeedback(invalid), ApiError)
    assert.equal(parseFeedback({ ...record, subject: null }).subject, null)
    for (const invalid of [{ ...admin, user: { ...admin.user, role: 'user' } }, { ...admin, expiresAt: 1 }, null]) await assert.rejects(getFeedbacks(invalid, { page: 1, sort: 'newest' }), ApiError)
    for (const query of [{ page: 0, sort: 'newest' }, { page: 1, sort: 'invalid' }]) await assert.rejects(getFeedbacks(admin, query), ApiError)

    globalThis.fetch = async (url, options) => { requests.push({ url, options }); return response(record) }
    assert.equal((await getFeedback(admin, 7)).id, 7)
    assert.equal(requests.at(-1).url, '/api/admin/feedback/7')
    await assert.rejects(getFeedback(admin, 8), /different feedback/)
    await assert.rejects(getFeedback(admin, 0), ApiError)
    globalThis.fetch = async () => new Response(JSON.stringify({ success: false, message: 'Feedback Not Found', errorCode: 1036 }), { status: 404 })
    await assert.rejects(getFeedback(admin, 7), error => error instanceof ApiError && error.errorCode === 1036 && error.status === 404 && error.message === 'Feedback Not Found')
    globalThis.fetch = async () => { throw new TypeError('Network unavailable') }
    await assert.rejects(getFeedbacks(admin, { page: 1, sort: 'newest' }), /Unable to connect/)
    globalThis.fetch = async (_url, { signal }) => new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(new DOMException('Cancelled', 'AbortError')), { once: true }))
    const controller = new AbortController()
    const cancelled = createFeedback('member-token', account, { category: 'Bug', subject: 'Test', message: 'Test' }, controller.signal)
    controller.abort()
    await assert.rejects(cancelled, error => error.name === 'AbortError')
    assert.deepEqual(validateFeedback({ category: 'Bug', subject: 'Test', message: 'Test' }), {})
    assert.ok(validateFeedback({ category: 'Bug', subject: 'x'.repeat(121), message: 'Test' }).subject)
    assert.deepEqual(feedbackQuery(new URLSearchParams('page=-1&sort=invalid')), { page: 1, sort: 'newest' })
    assert.deepEqual(feedbackQuery(new URLSearchParams('page=2&sort=categoryAsc')), { page: 2, sort: 'categoryAsc' })
    assert.match(formatFeedbackDate(record.created), /UTC$/)

    let previewRequests = 0
    globalThis.fetch = async () => { previewRequests++; throw new Error('Preview must not request account data') }
    const { authContext } = await server.ssrLoadModule('/src/context/auth-context.ts')
    const { productContext } = await server.ssrLoadModule('/src/components/shared/product/product-context.ts')
    for (const [file, name, role] of [['user/Feedback', 'Feedback', 'user'], ['admin/Feedback', 'Feedback', 'Admin'], ['admin/CreateFeedback', 'CreateFeedback', 'Admin']]) {
        const module = await server.ssrLoadModule('/src/pages/' + file + '.tsx')
        const html = renderToString(React.createElement(authContext.Provider, { value: { session: null } }, React.createElement(productContext.Provider, { value: { preview: true, role, basePath: role === 'Admin' ? '/preview/admin' : '/preview/user' } }, React.createElement(MemoryRouter, null, React.createElement(module[name])))))
        if (file === 'admin/Feedback') assert.ok(html.includes('Sort feedback') && html.includes('Category (A–Z)') && html.includes('Feedback layout preview'))
        else assert.ok(html.includes('Save feedback draft') && !html.includes('Send feedback'))
    }
    assert.equal(previewRequests, 0)
    console.log('Feedback checks passed: shared POST, exact categories/body, acknowledgement/ownership validation, admin list/detail contracts, server category/date sorting, pagination, errors/cancellation and preview isolation.')
} finally {
    globalThis.fetch = originalFetch
    await server.close()
}
