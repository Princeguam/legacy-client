import assert from 'node:assert/strict'
import { createServer } from 'vite'

const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
const originalFetch = globalThis.fetch
try {
  const { uploadFile } = await server.ssrLoadModule('/src/services/utilService.ts')
  const { createMember } = await server.ssrLoadModule('/src/services/adminService.ts')
  const { updateProfile } = await server.ssrLoadModule('/src/services/userService.ts')
  const { selectedFileError, uploadDestination } = await server.ssrLoadModule('/src/lib/uploads.ts')
  const { requestApi } = await server.ssrLoadModule('/src/services/apiClient.ts')
  const user = { id: 42, firstName: 'Actual', middleName: null, lastName: 'Member', email: 'member@example.com', phoneNo: '+234 800 000 0000', dob: null, address: null, state: null, lga: null, gender: null, passport: null, role: 'User', isAdmin: false, isDeleted: false, created: '2025-06-12T10:00:00Z', updated: '2026-11-18T10:00:00Z' }
  const admin = { ...user, id: 1, role: 'Admin' }
  const session = { user: admin, accessToken: 'test-upload', refreshToken: 'test-refresh', expiresAt: Date.now() + 60000 }
  const originalSession = JSON.stringify(session)
  const file = new File([new Uint8Array([137, 80, 78, 71])], 'avatar.png', { type: 'image/png' })
  const uploaded = { fileUrl: 'https://files.example.test/avatar.png', bucket: 'test-bucket', key: 'uploads/avatar.png', mimeType: file.type, originalName: file.name }
  const response = data => new Response(JSON.stringify({ success: true, message: 'Request Successful', data }), { status: 200 })
  const requests = []
  let result = [uploaded]
  globalThis.fetch = async (url, options) => { requests.push({ url, options }); return response(result) }
  assert.deepEqual(await uploadFile(session, file), uploaded)
  assert.equal(requests.at(-1).url, '/api/util/upload')
  assert.equal(requests.at(-1).options.method, 'POST')
  assert.equal(requests.at(-1).options.headers.Authorization, 'Bearer test-upload')
  assert.equal(requests.at(-1).options.headers['Content-Type'], undefined, 'Multipart boundary must be supplied by the browser.')
  assert.ok(requests.at(-1).options.body instanceof FormData)
  assert.deepEqual([...requests.at(-1).options.body.keys()], ['files'])
  assert.equal(requests.at(-1).options.body.get('files').name, file.name)
  const beforeInvalid = requests.length
  for (const bad of [null, { ...session, expiresAt: 1 }]) await assert.rejects(uploadFile(bad, file), /sign in/)
  for (const bad of [null, new File([], 'empty.png', { type: 'image/png' }), new File([new Uint8Array(10 * 1024 * 1024 + 1)], 'large.png', { type: 'image/png' })]) await assert.rejects(uploadFile(session, bad))
  assert.equal(requests.length, beforeInvalid)
  for (const bad of [null, [], [uploaded, uploaded], [{ ...uploaded, fileUrl: 'javascript:alert(1)' }], [{ ...uploaded, fileUrl: '/local.png' }], [{ ...uploaded, mimeType: 'text/html' }], [{ ...uploaded, originalName: 'wrong.png' }], [{ ...uploaded, key: '' }]]) { result = bad; await assert.rejects(uploadFile(session, file)) }
  for (const url of ['javascript:alert(1)', 'http://files.test/a.png', '//files.test/a.png', 'https://name:password@files.test/a.png']) assert.equal(uploadDestination(url), null)
  assert.equal(selectedFileError(file, 'avatar'), undefined)
  assert.ok(selectedFileError(new File(['svg'], 'avatar.svg', { type: 'image/svg+xml' }), 'avatar'))
  assert.equal(selectedFileError(new File(['pdf'], 'receipt.pdf', { type: 'application/pdf' }), 'receipt'), undefined)

  const input = { firstName: ' Actual ', lastName: ' Member ', email: 'member@example.com', phoneNo: '+234 800 000 0000', occupation: ' Engineer ', nextOfKinName: ' Kin ', nextOfKinRelationship: ' Sibling ', nextOfKinPhone: '+234 800 000 0001', emergencyContact: ' Contact ', emergencyContactPhone: '+234 800 000 0002', emergencyContactRelationship: ' Friend ', passport: uploaded.fileUrl }
  const body = Object.fromEntries(Object.entries(input).map(([key, value]) => [key, value.trim()]))
  result = { ...user, ...body, password: 'discard', accessToken: 'discard' }
  const created = await createMember(session, { ...input, role: 'Admin', isAdmin: true })
  assert.equal(requests.at(-1).url, '/api/admin/user')
  assert.deepEqual(JSON.parse(requests.at(-1).options.body), body)
  assert.equal(created.dob, null)
  assert.equal(created.role, 'User')
  assert.ok(!JSON.stringify(created).includes('discard'))
  assert.equal(JSON.stringify(session), originalSession, 'Creation must not replace the signed-in administrator.')
  result = { ...user, ...body, occupation: null }
  await assert.rejects(createMember(session, input), /did not confirm/)
  result = { ...user, ...body, role: 'Admin' }
  await assert.rejects(createMember(session, input))
  result = { ...user, ...body }
  const profile = await updateProfile('test-member', { id: 42, role: 'user' }, input)
  assert.equal(requests.at(-1).url, '/api/profile')
  assert.equal(profile.passport, uploaded.fileUrl)
  assert.deepEqual(JSON.parse(requests.at(-1).options.body), body)
  result = { ...user, ...body, emergencyContact: null }
  await assert.rejects(updateProfile('test-member', { id: 42, role: 'user' }, input), /did not confirm/)
  result = { ...user, ...body, passport: null }
  await assert.rejects(updateProfile('test-member', { id: 42, role: 'user' }, input), /did not confirm/)

  globalThis.fetch = async () => new Response(JSON.stringify({ success: false, message: 'Upload rejected', errorCode: 1000 }), { status: 400 })
  await assert.rejects(uploadFile(session, file), error => error.errorCode === 1000 && error.status === 400)
  globalThis.fetch = async (_url, { signal }) => new Promise((_resolve, reject) => {
    if (signal.aborted) reject(new DOMException('Cancelled', 'AbortError'))
    else signal.addEventListener('abort', () => reject(new DOMException('Cancelled', 'AbortError')), { once: true })
  })
  const controller = new AbortController()
  const pending = uploadFile(session, file, controller.signal); controller.abort()
  await assert.rejects(pending, error => error.name === 'AbortError')
  await assert.rejects(requestApi('/util/upload', { formData: new FormData(), timeoutMs: 5 }, data => data), /timed out/)
  await assert.rejects(requestApi('/util/upload', { formData: new FormData(), body: {} }, data => data), /unexpected response/)
  console.log('Uploads: authenticated multipart contract, response identity/URLs, cancellation/timeouts, nullable DOB, expanded profile and user-creation acknowledgements verified.')
} finally {
  globalThis.fetch = originalFetch
  await server.close()
}
