import assert from 'node:assert/strict'
import { createServer } from 'vite'

const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
const originalFetch = globalThis.fetch
try {
  const memberService = await server.ssrLoadModule('/src/services/userService.ts')
  const adminService = await server.ssrLoadModule('/src/services/adminService.ts')
  const { parseTransaction, parseTransactionList, parseTransactionAmount } = await server.ssrLoadModule('/src/services/transactionResponse.ts')
  const { parsePaymentAmount, paymentQuery, paymentQueryError, receiptDestination } = await server.ssrLoadModule('/src/lib/transactions.ts')
  const { formatMinorCurrency } = await server.ssrLoadModule('/src/lib/format-minor-currency.ts')
  const { ApiError } = await server.ssrLoadModule('/src/services/apiClient.ts')
  const person = { id: 42, firstName: 'Actual', middleName: null, lastName: 'Member', email: 'member@example.com', phoneNo: '+234 800 000 0000', dob: '1995-01-01', address: 'Lagos', state: null, lga: null, gender: null, passport: null, role: 'User', isAdmin: false, isDeleted: false, created: '2025-06-12T10:00:00Z', updated: '2026-11-18T10:00:00Z' }
  const administrator = { ...person, id: 1, firstName: 'Actual', lastName: 'Admin', role: 'Admin' }
  const account = { id: 42, role: 'user' }
  const session = { user: { ...administrator, role: 'Admin' }, accessToken: 'test-admin-token', refreshToken: 'test-refresh', expiresAt: Date.now() + 60_000 }
  const record = { id: 7, bankAccountId: 3, userId: 42, status: 'PENDING', type: 'DEPOSIT', amount: 8000001, currency: 'NGN', note: 'November payment', source: 'User', attachmentUrl: '/receipts/payment.pdf', reviewedById: null, period: '2026-11-01T00:00:00Z', depositedAt: '2026-11-18T00:00:00Z', reviewedAt: null, created: '2026-11-18T10:00:00Z', updated: '2026-11-18T10:00:00Z', depositedBy: person, reviewedBy: null, bankAccount: { id: 3, bankName: 'Test bank', accountName: 'Cooperative account', accountNumber: '0012345678', isActive: true } }
  const query = { page: 1, sort: 'newest', search: '', status: '', from: '', to: '' }
  const response = data => new Response(JSON.stringify({ success: true, message: 'Request Successful', data }), { status: 200 })
  const page = (items, totalItems = items.length, pageNo = 1) => ({ page: pageNo, count: items.length, totalPages: Math.ceil(totalItems / 10), totalItems, pageData: items })
  const requests = []
  globalThis.fetch = async (url, options) => { requests.push({ url, options }); return response(page([record])) }
  const list = await memberService.getTransactions('test-user-token', account, query)
  assert.equal(list.pageData[0].amount, '8000001')
  assert.equal(requests.at(-1).url, '/api/transaction/all?page=1&count=10&by=created&order=desc')
  assert.equal(requests.at(-1).options.headers.Authorization, 'Bearer test-user-token')
  assert.equal(requests.at(-1).options.method, 'GET')
  assert.equal(requests.at(-1).options.body, undefined)
  assert.equal(list.pageData[0].depositedBy.phoneNo, undefined, 'Unused personal fields must not be retained in transaction records.')
  assert.equal(parseTransaction({ ...record, amount: '9223372036854775807', depositedBy: { ...person, password: 'discard' }, unexpected: 'discard' }).amount, '9223372036854775807')
  assert.ok(!JSON.stringify(parseTransaction({ ...record, depositedBy: { ...person, password: 'discard' }, unexpected: 'discard' })).includes('discard'))
  assert.equal(parseTransactionAmount(Number.MAX_SAFE_INTEGER), '9007199254740991')
  assert.equal(parsePaymentAmount('90071992547409.91'), '9007199254740991')
  assert.equal(parsePaymentAmount('92233720368547758.07'), '9223372036854775807')
  assert.equal(parsePaymentAmount('92233720368547758.08'), null)
  assert.equal(parsePaymentAmount('0.01'), '1')
  assert.match(formatMinorCurrency('9007199254740991'), /90,071,992,547,409\.91/)
  assert.match(formatMinorCurrency('9223372036854775807'), /92,233,720,368,547,758\.07/)
  assert.match(formatMinorCurrency('1'), /0\.01/)
  assert.match(formatMinorCurrency('-1'), /-.*0\.01/)
  assert.match(formatMinorCurrency('8000001', 'NGN', true), /Nigerian naira/)
  for (const value of [9007199254740992, 1.5, null, '1.01', '1e3', '9223372036854775808', '-9223372036854775809']) assert.throws(() => parseTransactionAmount(value), ApiError)
  for (const value of ['0', '-1', '1.001', '1e3', '8,000', 'NaN']) assert.equal(parsePaymentAmount(value), null)
  for (const invalid of [null, {}, { ...record, status: 'Completed' }, { ...record, bankAccount: { ...record.bankAccount, id: 4 } }, { ...record, depositedBy: { ...person, id: 1 } }, { ...record, reviewedById: 1 }, { ...record, created: 'bad' }, { ...record, depositedAt: 'bad' }, { ...record, amount: 9007199254740992 }]) assert.throws(() => parseTransaction(invalid), ApiError)
  assert.throws(() => parseTransaction(record, { id: 99 }), /does not match/)
  const firstPage = page(Array.from({ length: 10 }, (_, index) => ({ ...record, id: index + 1 })), 11)
  assert.equal(parseTransactionList(firstPage, 1).totalItems, 11)
  assert.equal(parseTransactionList(page([record], 11, 2), 2).count, 1)
  assert.equal(parseTransactionList(page([], 0), 1).totalItems, 0)
  for (const invalid of [{ ...firstPage, page: 2 }, { ...firstPage, count: 9 }, { ...firstPage, totalPages: null }, { ...firstPage, pageData: firstPage.pageData.map(() => record) }]) assert.throws(() => parseTransactionList(invalid, 1), ApiError)

  const filtered = { ...query, search: 'monthly payment', status: 'PENDING', from: '2026-01-01', to: '2026-11-30', sort: 'statusAsc' }
  globalThis.fetch = async (url, options) => { requests.push({ url, options }); return response(firstPage) }
  assert.equal((await adminService.getTransactions(session, filtered)).totalItems, 11)
  const adminUrl = new URL(requests.at(-1).url, 'http://localhost')
  assert.equal(adminUrl.pathname, '/api/admin/transaction/all')
  assert.deepEqual(Object.fromEntries(adminUrl.searchParams), { page: '1', count: '10', by: 'status', order: 'asc', search: 'monthly payment', status: 'PENDING', from: '2026-01-01', to: '2026-11-30' })
  await memberService.getTransactions('test-user-token', account, filtered)
  assert.deepEqual(Object.fromEntries(new URL(requests.at(-1).url, 'http://localhost').searchParams), { page: '1', count: '10', by: 'status', order: 'asc' }, 'Unsupported member filters must not be advertised as server filtering.')
  for (const bad of [null, { ...session, expiresAt: 1 }, { ...session, user: { ...session.user, role: 'user' } }]) await assert.rejects(adminService.getTransactions(bad, query), ApiError)
  for (const bad of [{ ...query, page: 0 }, { ...query, sort: 'invalid' }, { ...query, from: '2026-02-30' }, { ...query, from: '2026-12-01', to: '2026-01-01' }]) await assert.rejects(adminService.getTransactions(session, bad), ApiError)
  assert.equal(paymentQueryError({ ...query, from: '2026-02-30' }), 'Choose valid calendar dates.')
  assert.equal(paymentQuery(new URLSearchParams('page=-1&sort=invalid&q=test&status=PENDING'), 'user').search, '')
  assert.equal(paymentQuery(new URLSearchParams('page=2&sort=statusAsc&status=REJECTED'), 'Admin').status, 'REJECTED')

  globalThis.fetch = async (url, options) => { requests.push({ url, options }); return response(record) }
  assert.equal((await memberService.getTransaction('test-user-token', account, 7)).id, 7)
  assert.equal(requests.at(-1).url, '/api/transaction/7')
  assert.equal((await adminService.getTransaction(session, 7)).id, 7)
  assert.equal(requests.at(-1).url, '/api/admin/transaction/7')
  await assert.rejects(memberService.getTransaction('test-user-token', account, 8), /different transaction/)
  await assert.rejects(memberService.getTransaction('test-user-token', { id: 99 }, 7), /does not match/)
  await assert.rejects(adminService.getTransaction(session, 0), ApiError)

  const input = { bankAccountId: 3, amount: '8000001', period: '2026-11-01', attachmentUrl: '/receipts/payment.pdf', note: ' November payment ', depositedAt: '2026-11-18T00:00:00Z' }
  assert.equal((await memberService.createTransaction('test-user-token', account, { ...input, userId: 99, status: 'CONFIRMED' })).status, 'PENDING')
  assert.equal(requests.at(-1).options.method, 'POST')
  assert.deepEqual(JSON.parse(requests.at(-1).options.body), { bankAccountId: 3, amount: '8000001', period: '2026-11-01', note: 'November payment', depositedAt: '2026-11-18T00:00:00Z', attachmentUrl: '/receipts/payment.pdf' })
  const noUpload = requests.length
  await assert.rejects(memberService.createTransaction('test-user-token', account, { ...input, attachmentUrl: '' }), /receipt is required/)
  assert.equal(requests.length, noUpload, 'Member submissions cannot pretend a local File is an uploaded attachment.')
  const confirmed = { ...record, status: 'CONFIRMED', source: 'Admin', reviewedById: 1, reviewedBy: administrator, reviewedAt: '2026-11-18T11:00:00Z' }
  globalThis.fetch = async (url, options) => { requests.push({ url, options }); return response(confirmed) }
  assert.equal((await adminService.createTransaction(session, { ...input, memberId: 42, status: 'PENDING', reviewedById: 99 })).status, 'CONFIRMED')
  assert.equal(requests.at(-1).url, '/api/admin/transaction')
  const body = JSON.parse(requests.at(-1).options.body)
  assert.equal(body.memberId, 42)
  assert.equal(body.amount, '8000001')
  assert.equal(body.status, undefined)
  assert.equal(body.reviewedById, undefined)
  const normalized = parseTransaction(record)
  globalThis.fetch = async (url, options) => { requests.push({ url, options }); return response(options.method === 'GET' ? record : confirmed) }
  assert.equal((await adminService.reviewTransaction(session, normalized, true)).status, 'CONFIRMED')
  assert.deepEqual(JSON.parse(requests.at(-1).options.body), { isAccepted: true })
  assert.equal(requests.at(-1).options.method, 'PUT')
  assert.equal(requests.at(-1).url, '/api/admin/transaction/7')
  globalThis.fetch = async (url, options) => { requests.push({ url, options }); return response(options.method === 'GET' ? record : { ...confirmed, status: 'REJECTED' }) }
  assert.equal((await adminService.reviewTransaction(session, normalized, false)).status, 'REJECTED')
  assert.deepEqual(JSON.parse(requests.at(-1).options.body), { isAccepted: false })
  await assert.rejects(adminService.reviewTransaction(session, { ...normalized, status: 'CONFIRMED' }, true), /Only pending/)
  globalThis.fetch = async (_url, options) => response(options.method === 'GET' ? record : { ...confirmed, amount: '8000002' })
  await assert.rejects(adminService.reviewTransaction(session, normalized, true), /Unable to review/)
  globalThis.fetch = async (_url, options) => response(options.method === 'GET' ? record : { ...confirmed, reviewedById: 2, reviewedBy: { ...administrator, id: 2 } })
  await assert.rejects(adminService.reviewTransaction(session, normalized, true), /Unable to review/)
  const beforeReviewedRetry = requests.filter(request => request.options.method === 'PUT').length
  globalThis.fetch = async (url, options) => { requests.push({ url, options }); return response(confirmed) }
  await assert.rejects(adminService.reviewTransaction(session, normalized, true), /payment has changed/)
  assert.equal(requests.filter(request => request.options.method === 'PUT').length, beforeReviewedRetry, 'A retry must not review a payment already processed by the server.')
  globalThis.fetch = async () => new Response(JSON.stringify({ success: false, message: 'Payment Already Exist', errorCode: 1020 }), { status: 409 })
  await assert.rejects(adminService.createTransaction(session, { ...input, memberId: 42 }), error => error instanceof ApiError && error.status === 409 && error.errorCode === 1020)
  globalThis.fetch = async () => { throw new Error('Network unavailable') }
  await assert.rejects(memberService.getTransactions('test-user-token', account, query), /Unable to connect/)
  globalThis.fetch = async (_url, { signal }) => new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(new DOMException('Cancelled', 'AbortError')), { once: true }))
  const controller = new AbortController()
  const cancelled = adminService.getTransactions(session, query, controller.signal)
  controller.abort()
  await assert.rejects(cancelled, error => error.name === 'AbortError')
  for (const destination of ['javascript:alert(1)', 'data:text/html,test', '//external.test/file', 'https://user:pass@example.com/file']) assert.equal(receiptDestination(destination), null)
  assert.equal(receiptDestination('/receipts/file.pdf'), '/receipts/file.pdf')
  console.log('Transaction checks passed: exact BigInt kobo, member ownership, server pagination and filters, fresh details, creation and approval acknowledgement, request whitelists, missing-upload protection, errors and cancellation.')
} finally { globalThis.fetch = originalFetch; await server.close() }
