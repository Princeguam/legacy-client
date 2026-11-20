import assert from 'node:assert/strict'
import { createServer } from 'vite'

const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
const originalFetch = globalThis.fetch
try {
  const { getBankAccountOptions } = await server.ssrLoadModule('/src/services/utilService.ts')
  const { getMemberOptions } = await server.ssrLoadModule('/src/services/adminService.ts')
  const admin = { user: { id: 1, email: 'admin@example.test', role: 'Admin' }, accessToken: 'test-admin', expiresAt: Date.now() + 60000 }
  const member = { ...admin, user: { id: 42, email: 'member@example.test', role: 'user' }, accessToken: 'test-member' }
  const bank = { id: 3, bankName: 'Actual bank', accountName: 'Cooperative account', accountNumber: '0012345678', isActive: true }
  const user = { id: 42, fullName: 'Actual Member', email: 'member@example.test', phoneNo: '+234 800 000 0000' }
  const requests = []
  let data = [bank]
  globalThis.fetch = async (url, options) => { requests.push({ url, options }); return new Response(JSON.stringify({ success: true, message: 'Request Successful', data })) }
  for (const session of [member, admin]) {
    assert.deepEqual(await getBankAccountOptions(session), [bank])
    assert.equal(requests.at(-1).url, '/api/bank/no')
    assert.equal(requests.at(-1).options.headers.Authorization, 'Bearer ' + session.accessToken)
  }
  data = [{ ...bank, createdAt: '2026-11-19T10:00:00Z' }]
  assert.deepEqual(await getBankAccountOptions(member), [bank])
  for (const invalid of [null, {}, [bank, bank], [{ ...bank, isActive: false }], [{ ...bank, accountNumber: 12345678 }], [{ ...bank, id: 0 }]]) { data = invalid; await assert.rejects(getBankAccountOptions(member)) }
  data = []; assert.deepEqual(await getBankAccountOptions(member), [])
  data = [{ ...user, password: 'discard', passport: 'discard' }]
  assert.deepEqual(await getMemberOptions(admin), [user])
  assert.equal(requests.at(-1).url, '/api/admin/user/no')
  assert.equal(requests.at(-1).options.headers.Authorization, 'Bearer test-admin')
  data = [{ ...user, fullName: null }]; assert.equal((await getMemberOptions(admin))[0].fullName, null)
  for (const invalid of [null, {}, [user, user], [{ ...user, id: 0 }], [{ ...user, fullName: 42 }], [{ ...user, email: '' }]]) { data = invalid; await assert.rejects(getMemberOptions(admin)) }
  data = []; assert.deepEqual(await getMemberOptions(admin), [])
  const before = requests.length
  await assert.rejects(getMemberOptions(member))
  await assert.rejects(getBankAccountOptions({ ...member, expiresAt: 1 }))
  assert.equal(requests.length, before)
  globalThis.fetch = async () => new Response(JSON.stringify({ success: false, message: 'Not Authorized', errorCode: 1000 }), { status: 403 })
  await assert.rejects(getMemberOptions(admin), error => error.message === 'Not Authorized' && error.status === 403)
  globalThis.fetch = async (_url, { signal }) => new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(new DOMException('Cancelled', 'AbortError')), { once: true }))
  const controller = new AbortController(), pending = getBankAccountOptions(member, controller.signal); controller.abort()
  await assert.rejects(pending, error => error.name === 'AbortError')
  console.log('Payment lookups: exact unpaginated routes, member/admin bank access, admin-only recipients, minimal field selection, active/duplicate/invalid record checks, empty lists, errors and cancellation verified.')
} finally { globalThis.fetch = originalFetch; await server.close() }
