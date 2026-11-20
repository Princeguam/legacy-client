import assert from 'node:assert/strict'
import { createServer } from 'vite'

const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
const originalFetch = globalThis.fetch
try {
  const { updatePassword } = await server.ssrLoadModule('/src/services/userService.ts')
  const { validatePassword } = await server.ssrLoadModule('/src/lib/password.ts')
  const input = { oldPassword: ' current password ', newPassword: ' new password ', confirmPassword: ' new password ', role: 'Admin' }
  const requests = []
  let data = null
  globalThis.fetch = async (url, options) => { requests.push({ url, options }); return new Response(JSON.stringify({ success: true, message: 'Request Successful', data })) }
  assert.deepEqual(validatePassword(input), {})
  assert.deepEqual(Object.keys(validatePassword({ oldPassword: '', newPassword: '', confirmPassword: '' })), ['oldPassword', 'newPassword', 'confirmPassword'])
  assert.ok(validatePassword({ ...input, confirmPassword: 'different' }).confirmPassword)
  assert.ok(validatePassword({ ...input, newPassword: input.oldPassword }).newPassword)
  for (const token of ['test-member-token', 'test-admin-token']) {
    assert.equal(await updatePassword(token, input), null)
    assert.equal(requests.at(-1).url, '/api/setting/password')
    assert.equal(requests.at(-1).options.method, 'PUT')
    assert.equal(requests.at(-1).options.headers.Authorization, 'Bearer ' + token)
    assert.deepEqual(JSON.parse(requests.at(-1).options.body), { oldPassword: input.oldPassword, newPassword: input.newPassword })
  }
  for (const invalid of [undefined, {}, { id: 42 }, true]) { data = invalid; await assert.rejects(updatePassword('test-token', input)) }
  const before = requests.length
  await assert.rejects(updatePassword('', input))
  for (const invalid of [{ oldPassword: '', newPassword: 'new' }, { oldPassword: 'old', newPassword: '' }, { oldPassword: 'same', newPassword: 'same' }, { oldPassword: 1, newPassword: 'new' }]) await assert.rejects(updatePassword('test-token', invalid))
  assert.equal(requests.length, before)
  globalThis.fetch = async () => new Response(JSON.stringify({ success: false, message: 'Incorrect Password', errorCode: 1000 }), { status: 400 })
  await assert.rejects(updatePassword('test-token', input), error => error.message === 'Incorrect Password' && error.status === 400)
  globalThis.fetch = async (_url, { signal }) => new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(new DOMException('Cancelled', 'AbortError')), { once: true }))
  const controller = new AbortController()
  const pending = updatePassword('test-token', input, controller.signal); controller.abort()
  await assert.rejects(pending, error => error.name === 'AbortError')
  console.log('Settings: shared password route, exact untrimmed body, confirmation validation, null acknowledgement, authorization, backend errors and cancellation verified.')
} finally { globalThis.fetch = originalFetch; await server.close() }
