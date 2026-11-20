import assert from 'node:assert/strict'
import { createServer } from 'vite'

const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
const originalFetch = globalThis.fetch
try {
  const { getProfile, updateProfile } = await server.ssrLoadModule('/src/services/userService.ts')
  const { ApiError } = await server.ssrLoadModule('/src/services/apiClient.ts')
  const { mergeSessionUser } = await server.ssrLoadModule('/src/services/authSession.ts')
  const { validateProfile, formatProfileDate, profileDateInput, profileFormValues } = await server.ssrLoadModule('/src/lib/profile.ts')
  const profile = {
    id: 42, firstName: 'Actual', middleName: null, lastName: 'Person',
    email: 'actual@example.com', phoneNo: '+234 801 234 5678', dob: '1995-01-01T00:00:00.000Z',
    address: 'Account address', state: 'Lagos', lga: null, gender: null, passport: null,
    role: 'User', isAdmin: false, isDeleted: false,
    created: '2025-06-12T10:00:00.000Z', updated: '2026-11-18T10:00:00.000Z',
  }
  const account = { id: 42, role: 'user' }
  const response = (data, status = 200) => new Response(JSON.stringify({ success: true, message: 'Request Successful', data }), { status })
  let requests = []
  globalThis.fetch = async (url, options) => {
    requests.push({ url, options })
    return response({ ...profile, password: 'must-not-be-retained', accessToken: 'unexpected-token' })
  }
  assert.deepEqual(await getProfile('profile-test-token', account), profile)
  assert.equal(requests[0].url, '/api/profile')
  assert.equal(requests[0].options.method, 'GET')
  assert.equal(requests[0].options.headers.Authorization, 'Bearer profile-test-token')
  assert.equal(requests[0].options.headers.Accept, 'application/json')
  assert.equal(requests[0].options.body, undefined)

  const input = { firstName: ' Updated ', lastName: ' Person ', email: ' updated@example.com ', phoneNo: ' +234 809 876 5432 ' }
  const updated = { ...profile, firstName: 'Updated', email: 'updated@example.com', phoneNo: '+234 809 876 5432' }
  globalThis.fetch = async (url, options) => { requests.push({ url, options }); return response(updated) }
  assert.deepEqual(await updateProfile('profile-test-token', account, { ...input, role: 'Admin', id: 1, password: 'extra' }), updated)
  assert.equal(requests[1].options.method, 'PUT')
  assert.equal(requests[1].options.headers.Authorization, 'Bearer profile-test-token')
  assert.equal(requests[1].options.headers['Content-Type'], 'application/json')
  assert.deepEqual(JSON.parse(requests[1].options.body), { firstName: 'Updated', lastName: 'Person', email: 'updated@example.com', phoneNo: '+234 809 876 5432' })

  const expanded = { ...input, middleName: ' Ada ', dob: '1996-02-29', address: ' New address ', state: ' Oyo ', lga: ' Ibadan North ', gender: ' Female ' }
  const expandedBody = { firstName: 'Updated', lastName: 'Person', email: 'updated@example.com', phoneNo: '+234 809 876 5432', middleName: 'Ada', dob: '1996-02-29', address: 'New address', state: 'Oyo', lga: 'Ibadan North', gender: 'Female' }
  const withPassport = { ...updated, ...expandedBody, dob: '1996-02-29T00:00:00.000Z', passport: 'https://example.com/passport.png' }
  globalThis.fetch = async (url, options) => { requests.push({ url, options }); return response(withPassport) }
  assert.deepEqual(await updateProfile('profile-test-token', account, { ...expanded, passport: 'https://example.com/passport.png', role: 'Admin', id: 1 }), withPassport)
  assert.deepEqual(JSON.parse(requests.at(-1).options.body), { ...expandedBody, passport: withPassport.passport }, 'Expanded updates must select personal/avatar fields without changing ID or role.')
  await updateProfile('profile-test-token', account, { ...input, middleName: ' ', dob: '', address: '', state: null, lga: '', gender: null })
  assert.deepEqual(JSON.parse(requests.at(-1).options.body), { firstName: 'Updated', lastName: 'Person', email: 'updated@example.com', phoneNo: '+234 809 876 5432' }, 'Blank optional fields must leave existing server values intact.')
  assert.deepEqual(profileFormValues(withPassport), { ...expandedBody, dob: '1996-02-29', occupation: '', nextOfKinName: '', nextOfKinRelationship: '', nextOfKinPhone: '', emergencyContact: '', emergencyContactPhone: '', emergencyContactRelationship: '' })
  assert.equal(profileFormValues(profile).middleName, '')
  assert.equal(profileFormValues(profile).lga, '')
  assert.equal(profileDateInput(profile.dob), '1995-01-01')
  assert.equal(profileDateInput('not-a-date'), '')
  assert.equal(profileDateInput('1995-01-01T23:30:00-02:00'), '1995-01-02', 'Date inputs must match the profile display’s UTC calendar day.')
  assert.deepEqual(validateProfile(expanded, '2026-11-18'), {})
  for (const dob of ['1995-02-29', '1996-02-30', 'not-a-date', '2026-13-01', '2026-11-19']) assert.ok(validateProfile({ ...input, dob }, '2026-11-18').dob)
  const beforeInvalid = requests.length
  await assert.rejects(updateProfile('profile-test-token', account, { ...expanded, dob: '1995-02-29' }), /valid date of birth/)
  assert.equal(requests.length, beforeInvalid, 'Invalid birth dates must not be submitted.')

  const before = requests.length
  await assert.rejects(getProfile(' ', account), ApiError)
  await assert.rejects(updateProfile('', account, input), ApiError)
  assert.equal(requests.length, before, 'Missing credentials must not send a request.')

  const admin = { ...profile, role: 'Admin', isAdmin: false }
  globalThis.fetch = async () => response(admin)
  assert.deepEqual(await getProfile('admin-token', { id: 42, role: 'Admin' }), admin)
  await assert.rejects(getProfile('profile-test-token', account), /does not match/)
  globalThis.fetch = async () => response({ ...profile, id: 1 })
  await assert.rejects(getProfile('profile-test-token', account), /does not match/)
  for (const invalid of [null, {}, { ...profile, isDeleted: true }, { ...profile, phoneNo: undefined }, { ...profile, state: 42 }, { ...profile, role: 'owner' }, { ...profile, dob: 123 }]) {
    globalThis.fetch = async () => response(invalid)
    await assert.rejects(getProfile('profile-test-token', account), ApiError)
  }
  globalThis.fetch = async () => new Response(JSON.stringify({ success: false, message: 'Email Already Exist', errorCode: 1006 }), { status: 409 })
  await assert.rejects(updateProfile('profile-test-token', account, input), error => error instanceof ApiError && error.message === 'Email Already Exist' && error.errorCode === 1006 && error.status === 409)
  globalThis.fetch = async () => new Response(JSON.stringify({ success: false, message: 'Invalid Authorization Token', errorCode: 1005 }), { status: 400 })
  await assert.rejects(getProfile('profile-test-token', account), error => error.errorCode === 1005 && error.status === 400)
  globalThis.fetch = async () => response(profile, 500)
  await assert.rejects(getProfile('profile-test-token', account), ApiError)
  globalThis.fetch = async () => new Response('not-json', { status: 502 })
  await assert.rejects(getProfile('profile-test-token', account), ApiError)
  globalThis.fetch = async () => { throw new TypeError('Network unavailable') }
  await assert.rejects(getProfile('profile-test-token', account), /Unable to connect/)
  globalThis.fetch = async (_url, { signal }) => new Promise((_resolve, reject) => {
    if (signal.aborted) reject(new DOMException('Cancelled', 'AbortError'))
    else signal.addEventListener('abort', () => reject(new DOMException('Cancelled', 'AbortError')), { once: true })
  })
  const controller = new AbortController()
  const cancelled = getProfile('profile-test-token', account, controller.signal)
  controller.abort()
  await assert.rejects(cancelled, error => error.name === 'AbortError')

  const session = { user: { ...profile, role: 'user' }, accessToken: 'profile-test-token', refreshToken: 'profile-test-refresh', expiresAt: Date.now() + 60000 }
  const merged = mergeSessionUser(session, updated, session.accessToken)
  assert.equal(merged.user.firstName, 'Updated')
  assert.equal(merged.user.role, 'user')
  assert.equal(merged.accessToken, session.accessToken)
  assert.equal(merged.refreshToken, session.refreshToken)
  assert.equal(merged.expiresAt, session.expiresAt)
  assert.equal(session.user.firstName, 'Actual', 'Merging must not mutate the previous session.')
  for (const value of [null, { ...session, expiresAt: Date.now() - 1 }, { ...session, accessToken: 'new-account-token' }, { ...session, user: { ...session.user, id: 1 } }, { ...session, user: { ...session.user, role: 'Admin' } }]) {
    assert.equal(mergeSessionUser(value, updated, session.accessToken), null, 'Late profile responses must not replace an invalid or changed session.')
  }
  assert.equal(mergeSessionUser(session, { ...updated, isDeleted: true }, session.accessToken), null)
  assert.ok(!JSON.stringify(mergeSessionUser(session, { ...updated, password: 'unexpected-secret' }, session.accessToken)).includes('unexpected-secret'))
  assert.equal(mergeSessionUser(session, withPassport, session.accessToken).user.passport, withPassport.passport)
  assert.deepEqual(validateProfile(input), {})
  assert.deepEqual(Object.keys(validateProfile({ firstName: ' ', lastName: '', email: 'invalid', phoneNo: '' })), ['firstName', 'lastName', 'email', 'phoneNo'])
  assert.equal(formatProfileDate(profile.dob), formatProfileDate('1995-01-01'))
  assert.equal(formatProfileDate('not-a-date'), 'Not provided')
  console.log('Profile checks passed: expanded GET/PUT fields, bearer tokens, request whitelist, exact-account validation, backend errors, cancellation, session/passport retention and calendar-date validation.')
} finally {
  globalThis.fetch = originalFetch
  await server.close()
}
