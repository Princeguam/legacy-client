import assert from 'node:assert/strict'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { createServer } from 'vite'

const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
const originalFetch = globalThis.fetch
let requests = 0
try {
  globalThis.fetch = async () => { requests++; throw new Error('Product pages must not request backend data.') }
  const data = await server.ssrLoadModule('/src/lib/product-data.ts')
  const { parseAmountMinor, validateTransaction, receiptError, draftFingerprint, localToday } = await server.ssrLoadModule('/src/lib/transaction-drafts.ts')
  assert.equal(parseAmountMinor('80000.01'), 8000001)
  assert.equal(parseAmountMinor('0.01'), 1)
  for (const amount of ['0', '-1', '1e3', 'NaN', '1.001', '80,000', '99999999999999999', '90071992547409.91']) assert.equal(parseAmountMinor(amount), null)
  const form = { description: 'November contribution', type: 'Contribution', date: '2026-11-11', amount: '80000.01', reference: 'BANK-42', notes: '' }
  assert.deepEqual(validateTransaction(form, null, '2026-11-11'), {})
  for (const date of ['', '2026-02-30', '2026-13-01', '2026-11-12']) assert.ok(validateTransaction({ ...form, date }, null, '2026-11-11').date)
  assert.deepEqual(validateTransaction({ ...form, date: '2024-02-29' }, null, '2026-11-11'), {})
  assert.ok(validateTransaction({ ...form, type: 'Admin' }, null).type)
  assert.ok(validateTransaction({ ...form, description: '  ' }, null).description)
  const file = { name: 'receipt.pdf', type: 'application/pdf', size: 1024 }
  assert.equal(receiptError(file), undefined)
  assert.equal(receiptError({ ...file, name: 'image.png', type: 'image/png' }), undefined)
  assert.equal(receiptError({ ...file, name: 'image.jpeg', type: 'image/jpeg' }), undefined)
  assert.equal(receiptError({ ...file, size: 10 * 1024 * 1024 }), undefined)
  assert.ok(receiptError({ ...file, size: 10 * 1024 * 1024 + 1 }))
  assert.ok(receiptError({ ...file, name: 'receipt.svg', type: 'image/svg+xml' }))
  assert.ok(receiptError({ ...file, name: 'receipt.exe' }))
  assert.ok(receiptError({ ...file, size: 0 }))
  const draft = { ...form, amountMinor: 8000001, receipt: null }
  assert.equal(draftFingerprint(draft), draftFingerprint({ ...draft, reference: ' bank-42  ', description: 'Changed text', receipt: file }))
  assert.notEqual(draftFingerprint(draft), draftFingerprint({ ...draft, amountMinor: 8000002 }))
  assert.equal(localToday(new Date(2026, 10, 11)), '2026-11-11')
  const personal = data.getSummary('user'), cooperative = data.getSummary('Admin')
  assert.deepEqual(personal, { contributed: 800000, invested: 650000, expenses: 0, target: 1200000, remaining: 400000, cash: 150000, wealth: 800000 })
  assert.deepEqual(cooperative, { contributed: 7100000, invested: 4900000, expenses: 240000, target: 12000000, remaining: 4900000, cash: 1960000, wealth: 6860000 })
  assert.equal(data.members.reduce((sum, member) => sum + data.memberContributed(member.id), 0), cooperative.contributed)
  for (const [role, holdings] of [['user', data.personalHoldings], ['Admin', data.cooperativeHoldings]]) {
    const summary = data.getSummary(role)
    assert.equal(holdings.reduce((sum, holding) => sum + holding.amount, 0), summary.invested)
    assert.equal(summary.cash + summary.invested, summary.wealth)
    assert.equal(data.contributionHistory(role).at(-1).cumulative, summary.contributed)
    assert.equal(summary.remaining + summary.contributed, summary.target)
  }
  assert.equal(data.getTransactions('Admin').filter(row => row.type === 'Investment').length, 3, 'Member allocations must not double-count cooperative investments.')
  assert.equal(data.getTransactions('user').filter(row => row.status === 'Pending').length, 1)
  const filters = { query: 'LW-001', status: 'Completed', type: 'Contribution', start: '2026-10-05', end: '2026-10-05' }
  const filtered = data.filterTransactions(data.getTransactions('Admin'), filters)
  assert.equal(filtered.length, 1, 'Inclusive dates, member matching and status/type filters must work together.')
  assert.equal(filtered[0].amount, 80000)
  assert.equal(data.filterTransactions(data.getTransactions('Admin'), { ...filters, query: 'NO-SUCH-MEMBER' }).length, 0)

  assert.equal(data.getMemberTransactions('LW-001').length, 14)
  assert.ok(data.getMemberTransactions('LW-002').every(row => row.memberId === 'LW-002' && row.scope === 'member'))
  assert.equal(data.getMemberSummary('LW-001').cash, 150000)
  assert.equal(data.getMemberSummary('LW-002').invested, null, 'Missing member investments must remain unavailable.')
  assert.equal(data.getMemberSummary('LW-011').target, null, 'Pending membership must not imply an annual commitment.')
  assert.equal(data.getMemberSummary('unknown-member'), null)

  const { authContext } = await server.ssrLoadModule('/src/context/auth-context.ts')
  const { ProductLayout } = await server.ssrLoadModule('/src/layouts/ProductLayout.tsx')
  const { ProtectedRoute } = await server.ssrLoadModule('/src/routes/ProtectedRoute.tsx')
  const auth = session => ({ session, isSigningIn: false, signIn: async () => {}, signOut: () => {} })
  const session = role => ({ user: { id: 'account-42', email: 'account@example.com', firstName: 'Actual', lastName: 'Person', role }, accessToken: 'test-only', expiresAt: Date.now() + 60000 })
  const guard = value => renderToString(React.createElement(authContext.Provider, { value: auth(value) }, React.createElement(MemoryRouter, { initialEntries: ['/admin/members'] }, React.createElement(Routes, null, React.createElement(Route, { element: React.createElement(ProtectedRoute, { roles: ['Admin'] }) }, React.createElement(Route, { path: '/admin/members', element: React.createElement('p', null, 'protected-members-marker') }))))))
  assert.ok(guard(session('Admin')).includes('protected-members-marker'))
  for (const value of [null, session('user'), { ...session('Admin'), expiresAt: Date.now() - 1 }, session('owner')]) assert.ok(!guard(value).includes('protected-members-marker'))

  let rendered = 0
  for (const [folder, role] of [['user', 'user'], ['admin', 'Admin']]) {
    const pages = [['Dashboard', 'Dashboard'], ...(role === 'user' ? [['AddTransaction', 'AddTransaction']] : []), ['Transactions', 'Transactions'], ['Contributions', 'Contributions'], ['Portfolio', 'Portfolio'], ['Profile', 'Profile'], ['Settings', 'Settings'], ['Feedback', 'Feedback'], ...(role === 'Admin' ? [['ManageUsers', 'ManageUsers']] : [])]
    for (const [file, name] of pages) {
      const module = await server.ssrLoadModule(`/src/pages/${folder}/${file}.tsx`)
      const html = renderToString(React.createElement(authContext.Provider, { value: auth(null) }, React.createElement(MemoryRouter, { initialEntries: ['/'] }, React.createElement(Routes, null, React.createElement(Route, { path: '/', element: React.createElement(ProductLayout, { role, preview: true }) }, React.createElement(Route, { index: true, element: React.createElement(module[name]) }))))))
      assert.ok(html.includes('Page preview'), `${folder}/${file} must identify its demo context.`)
      assert.ok(html.includes('id="product-main"'), `${folder}/${file} must have a main landmark.`)
      assert.ok(html.includes('aria-label="Mobile navigation"'))
      if (file === 'AddTransaction') {
        assert.ok(html.includes('Review transaction') && html.includes('Attach receipt (optional)'))
        assert.ok(html.includes('Local draft') && html.includes('type="file"'))
      }
      if (file === 'Dashboard') assert.ok(html.includes('Recent transactions') || html.includes('Cooperative activity'))
      if (file === 'Portfolio') assert.ok(html.includes('Balance unavailable'), 'Missing returns must not become zero.')
      rendered++
    }
  }
  const { MemberDetails } = await server.ssrLoadModule('/src/pages/admin/MemberDetails.tsx')
  for (const memberId of ['LW-001', 'LW-002', 'LW-011', 'unknown-member']) {
    const html = renderToString(React.createElement(authContext.Provider, { value: auth(null) }, React.createElement(MemoryRouter, { initialEntries: [`/preview/admin/members/${memberId}`] }, React.createElement(Routes, null, React.createElement(Route, { path: '/preview/admin', element: React.createElement(ProductLayout, { role: 'Admin', preview: true }) }, React.createElement(Route, { path: 'members/:memberId', element: React.createElement(MemberDetails) }))))))
    if (memberId === 'unknown-member') assert.ok(html.includes('Member not found'))
    else {
      assert.ok(html.includes('Member information') && html.includes('Transaction history'))
      assert.ok(html.includes(memberId))
      if (memberId === 'LW-001') assert.ok(!html.includes('LWC-202610-002'), 'Member detail histories must exclude other members.')
      if (memberId === 'LW-011') assert.ok(html.includes('has not been enrolled'))
    }
  }
  rendered++
  const { Profile } = await server.ssrLoadModule('/src/pages/user/Profile.tsx')
  const { productContext } = await server.ssrLoadModule('/src/components/shared/product/product-context.ts')
  const profile = renderToString(React.createElement(MemoryRouter, null, React.createElement(productContext.Provider, { value: { role: 'user', preview: false, basePath: '/user', user: session('user').user } }, React.createElement(Profile))))
  assert.ok(profile.includes('Actual Person') && profile.includes('account@example.com'))
  assert.ok(profile.includes('Not provided'))
  assert.ok(!profile.includes('Samira Yusuf'), 'Real identity must never be replaced with a preview identity.')
  assert.equal(requests, 0)
  console.log(`Product checks passed: ${rendered} screens, exact-role/expiry guards, real profile identity, reconciled illustrative totals, pending exclusion, filters, transaction/receipt validation, and zero new API requests.`)
} finally {
  globalThis.fetch = originalFetch
  await server.close()
}
