import assert from 'node:assert/strict'
import { createServer } from 'vite'

const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
const originalFetch = globalThis.fetch
try {
  const service = await server.ssrLoadModule('/src/services/adminService.ts')
  const { parseMember, parseMemberList } = await server.ssrLoadModule('/src/services/adminUserResponse.ts')
  const { memberQuery, validateNewMember } = await server.ssrLoadModule('/src/lib/members.ts')
  const { profileFormValues } = await server.ssrLoadModule('/src/lib/profile.ts')
  const user = { id: 42, firstName: 'Actual', middleName: null, lastName: 'Member', email: 'member@example.com', phoneNo: '+234 800 000 0000', dob: '1995-01-01', address: null, state: null, lga: null, gender: null, passport: null, occupation: 'Engineer', nextOfKinName: null, role: 'User', isAdmin: false, isDeleted: false, created: '2025-06-12T10:00:00Z', updated: '2026-11-18T10:00:00Z' }
  const admin = { ...user, id: 1, email: 'admin@example.com', role: 'Admin' }
  const session = { user: admin, accessToken: 'test-admin', expiresAt: Date.now() + 60000 }
  const originalSession = JSON.stringify(session)
  const query = { page: 1, sort: 'nameAsc', search: ' Actual ', isActive: true }
  const paymentQuery = { page: 1, sort: 'statusAsc', search: 'payment', status: 'PENDING', from: '2026-01-01', to: '2026-11-30' }
  const page = (rows, totalItems = rows.length, pageNo = 1) => ({ page: pageNo, count: rows.length, totalPages: Math.ceil(totalItems / 10), totalItems, pageData: rows })
  const response = data => new Response(JSON.stringify({ success: true, message: 'Request Successful', data }), { status: 200 })
  const requests = []
  let result = page([user])
  globalThis.fetch = async (url, options) => { requests.push({ url, options }); return response(result) }
  assert.equal((await service.getMembers(session, query)).pageData[0].address, null)
  let url = new URL(requests.at(-1).url, 'http://test.local')
  assert.equal(url.pathname, '/api/admin/user/all')
  assert.deepEqual(Object.fromEntries(url.searchParams), { page: '1', count: '10', by: 'fullName', order: 'asc', isActive: 'true', search: 'Actual' })
  assert.equal(requests.at(-1).options.headers.Authorization, 'Bearer test-admin')
  await service.getMembers(session, { ...query, isActive: false })
  assert.equal(new URL(requests.at(-1).url, 'http://test.local').searchParams.get('isActive'), 'false')
  result = { ...user, password: 'discard-secret', accessToken: 'discard-secret', unexpected: 'discard-secret' }
  const selected = await service.getMember(session, 42)
  assert.equal(requests.at(-1).url, '/api/admin/user/42')
  assert.equal(selected.occupation, 'Engineer')
  assert.ok(!JSON.stringify(selected).includes('discard-secret'))
  assert.equal(JSON.stringify(session), originalSession, 'Selected users must never replace the signed-in administrator.')
  result = admin
  await assert.rejects(service.getMember(session, 42), /different user/)
  assert.equal(parseMember({ ...user, isDeleted: true }).isDeleted, true, 'The details API can return deleted accounts.')
  assert.equal(parseMemberList(page([], 0), 1).totalItems, 0)
  assert.equal(parseMemberList(page([user], 11, 2), 2).count, 1)
  const first = page(Array.from({ length: 10 }, (_, index) => ({ ...user, id: index + 1 })), 11)
  assert.equal(parseMemberList(first, 1).totalPages, 2)
  for (const bad of [null, {}, { ...user, id: 0 }, { ...user, address: 3 }, { ...user, occupation: 3 }, { ...user, role: 'Owner' }]) assert.throws(() => parseMember(bad))
  for (const bad of [{ ...first, count: 9 }, { ...first, page: 2 }, { ...first, totalPages: 1 }, { ...first, pageData: first.pageData.map(() => user) }]) assert.throws(() => parseMemberList(bad, 1))
  assert.deepEqual(memberQuery(new URLSearchParams('page=-1&sort=invalid&activity=invalid')), { page: 1, sort: 'newest', search: '', isActive: true })
  assert.equal(memberQuery(new URLSearchParams('activity=inactive')).isActive, false)
  assert.equal(validateNewMember({ ...profileFormValues(), role: 'User' }).email, 'Enter a valid email address.')
  assert.ok(validateNewMember({ ...profileFormValues(user), dob: '2026-02-30', role: 'User' }).dob)
  assert.deepEqual(validateNewMember({ ...profileFormValues(user), role: 'User' }), {})

  const payment = { id: 7, userId: 42, bankAccountId: 3, status: 'PENDING', type: 'DEPOSIT', amount: '9223372036854775807', currency: 'NGN', note: 'Payment', source: 'User', attachmentUrl: null, reviewedById: null, reviewedBy: null, reviewedAt: null, depositedBy: user, period: '2026-11-01T00:00:00Z', depositedAt: null, created: '2026-11-18T10:00:00Z', updated: '2026-11-18T10:00:00Z', bankAccount: { id: 3, bankName: 'Bank', accountName: 'Cooperative', accountNumber: '0012345678', isActive: true } }
  result = page([payment])
  assert.equal((await service.getMemberTransactions(session, 42, paymentQuery)).pageData[0].amount, payment.amount)
  url = new URL(requests.at(-1).url, 'http://test.local')
  assert.equal(url.pathname, '/api/admin/user/42/transaction/all')
  assert.deepEqual(Object.fromEntries(url.searchParams), { page: '1', count: '10', by: 'status', order: 'asc', search: 'payment', status: 'PENDING', from: '2026-01-01', to: '2026-11-30' })
  result = payment
  await service.getMemberTransaction(session, 42, 7)
  assert.equal(requests.at(-1).url, '/api/admin/user/42/transaction/7')
  const otherPayment = { ...payment, userId: 43, depositedBy: { ...user, id: 43 } }
  result = otherPayment
  await assert.rejects(service.getMemberTransaction(session, 42, 7), /does not match/)
  result = page([otherPayment])
  await assert.rejects(service.getMemberTransactions(session, 42, paymentQuery), /does not match/)
  result = { ...payment, id: 8 }
  await assert.rejects(service.getMemberTransaction(session, 42, 7), /different transaction/)

  let reviewResult = { ...payment, status: 'CONFIRMED', reviewedById: 1, reviewedBy: admin, reviewedAt: '2026-11-19T10:00:00Z' }
  let preflight = payment
  globalThis.fetch = async (url, options) => { requests.push({ url, options }); return response(options.method === 'PUT' ? reviewResult : preflight) }
  assert.equal((await service.reviewMemberTransaction(session, 42, payment, true)).status, 'CONFIRMED')
  assert.equal(requests.at(-2).url, '/api/admin/user/42/transaction/7')
  assert.equal(requests.at(-2).options.method, 'GET')
  assert.equal(requests.at(-1).url, '/api/admin/user/42/transaction/7')
  assert.equal(requests.at(-1).options.method, 'PUT')
  assert.deepEqual(JSON.parse(requests.at(-1).options.body), { isAccepted: true })
  reviewResult = { ...reviewResult, status: 'REJECTED' }
  assert.equal((await service.reviewMemberTransaction(session, 42, payment, false)).status, 'REJECTED')
  reviewResult = { ...reviewResult, status: 'PENDING' }
  await assert.rejects(service.reviewMemberTransaction(session, 42, payment, false), /Unable to review/)
  preflight = { ...payment, amount: '1' }
  const writesBefore = requests.filter(request => request.options.method === 'PUT').length
  await assert.rejects(service.reviewMemberTransaction(session, 42, payment, true), /payment has changed/)
  assert.equal(requests.filter(request => request.options.method === 'PUT').length, writesBefore)
  await assert.rejects(service.reviewMemberTransaction(session, 43, payment, true), /does not match/)
  const before = requests.length
  for (const invalid of [null, { ...session, expiresAt: 1 }, { ...session, user: { ...admin, role: 'user' } }]) {
    await assert.rejects(service.getMembers(invalid, query))
    await assert.rejects(service.getMember(invalid, 42))
    await assert.rejects(service.getMemberTransactions(invalid, 42, paymentQuery))
    await assert.rejects(service.getMemberTransaction(invalid, 42, 7))
    await assert.rejects(service.reviewMemberTransaction(invalid, 42, payment, true))
  }
  for (const id of [0, -1, 1.5, 2147483648, NaN]) {
    await assert.rejects(service.getMember(session, id))
    await assert.rejects(service.getMemberTransactions(session, id, paymentQuery))
    await assert.rejects(service.getMemberTransaction(session, 42, id))
  }
  for (const bad of [{ ...query, page: 0 }, { ...query, sort: 'invalid' }, { ...query, isActive: 'false' }]) await assert.rejects(service.getMembers(session, bad))
  assert.equal(requests.length, before, 'Invalid roles, IDs and queries must fail before a request.')
  console.log('Admin users: pagination, public-field selection, nullable/new profile fields, exact user/transaction scope, review acknowledgement and session isolation verified.')
} finally {
  globalThis.fetch = originalFetch
  await server.close()
}
