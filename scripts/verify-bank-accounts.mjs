import assert from 'node:assert/strict'
import { createServer } from 'vite'

const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
const originalFetch = globalThis.fetch
try {
  const { getBankAccounts, createBankAccount } = await server.ssrLoadModule('/src/services/adminService.ts')
  const { validateBankAccount } = await server.ssrLoadModule('/src/lib/bank-accounts.ts')
  const bank = { id: 3, bankName: 'Actual bank', accountName: 'Cooperative account', accountNumber: '0012345678', isActive: true }
  const session = { user: { id: 1, email: 'admin@example.test', role: 'Admin' }, accessToken: 'test-admin-token', refreshToken: 'test-refresh', expiresAt: Date.now() + 60000 }
  const query = { page: 1, sort: 'newest', isActive: true }
  let data = { page: 1, count: 1, totalItems: 1, totalPages: 1, pageData: [bank] }
  const requests = []
  globalThis.fetch = async (url, options) => { requests.push({ url, options }); return new Response(JSON.stringify({ success: true, message: 'Request Successful', data })) }
  assert.deepEqual((await getBankAccounts(session, query)).pageData, [bank])
  const url = new URL(requests.at(-1).url, 'http://test.local')
  assert.equal(url.pathname, '/api/admin/bank/all')
  assert.deepEqual(Object.fromEntries(url.searchParams), { page: '1', count: '10', by: 'createdAt', order: 'desc', isActive: 'true' })
  assert.equal(requests.at(-1).options.headers.Authorization, 'Bearer test-admin-token')
  data = { page: 1, count: 0, totalItems: 0, totalPages: 0, pageData: [] }
  assert.equal((await getBankAccounts(session, query)).count, 0)
  data = { page: 1, count: 1, totalItems: 1, totalPages: 1, pageData: [{ ...bank, isActive: false }] }
  await getBankAccounts(session, { ...query, isActive: false, sort: 'name' })
  assert.ok(requests.at(-1).url.includes('isActive=false'))
  for (const invalid of [null, { page: 1, count: 1, totalItems: 1, totalPages: 1, pageData: [{ ...bank, accountNumber: 12345678 }] }, { page: 1, count: 1, totalItems: 1, totalPages: 1, pageData: [{ ...bank, isActive: false }] }, { page: 1, count: 2, totalItems: 2, totalPages: 1, pageData: [bank, bank] }, { page: 2, count: 1, totalItems: 1, totalPages: 1, pageData: [bank] }]) { data = invalid; await assert.rejects(getBankAccounts(session, query)) }
  const before = requests.length
  for (const invalid of [null, { ...session, expiresAt: 1 }, { ...session, user: { ...session.user, role: 'user' } }]) await assert.rejects(getBankAccounts(invalid, query))
  for (const invalid of [{ ...query, page: 0 }, { ...query, sort: 'unknown' }, { ...query, isActive: undefined }]) await assert.rejects(getBankAccounts(session, invalid))
  assert.equal(requests.length, before)
  data = { ...bank, unexpected: 'discard' }
  const input = { bankName: ' Actual bank ', accountName: ' Cooperative account ', accountNumber: ' 0012345678 ', isActive: false, id: 999 }
  assert.deepEqual(await createBankAccount(session, input), bank)
  assert.equal(requests.at(-1).url, '/api/admin/bank')
  assert.equal(requests.at(-1).options.method, 'POST')
  assert.deepEqual(JSON.parse(requests.at(-1).options.body), { bankName: bank.bankName, accountName: bank.accountName, accountNumber: bank.accountNumber })
  for (const invalid of [{ ...bank, accountNumber: '12345678' }, { ...bank, bankName: 'Other' }, { ...bank, isActive: false }]) { data = invalid; await assert.rejects(createBankAccount(session, input), /did not confirm/) }
  assert.deepEqual(Object.keys(validateBankAccount({ bankName: '', accountName: '', accountNumber: 'letters' })), ['bankName', 'accountName', 'accountNumber'])
  globalThis.fetch = async () => new Response(JSON.stringify({ success: false, message: 'Bank Account Already Exist', errorCode: 1000 }), { status: 409 })
  await assert.rejects(createBankAccount(session, input), error => error.message === 'Bank Account Already Exist' && error.status === 409)
  globalThis.fetch = async (_url, { signal }) => new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(new DOMException('Cancelled', 'AbortError')), { once: true }))
  const controller = new AbortController()
  const pending = createBankAccount(session, input, controller.signal); controller.abort()
  await assert.rejects(pending, error => error.name === 'AbortError')
  console.log('Bank accounts: exact routes, bearer authorization, pagination/activity, leading zeros, selected request fields, creation acknowledgement, malformed responses, backend errors and cancellation verified.')
} finally { globalThis.fetch = originalFetch; await server.close() }
