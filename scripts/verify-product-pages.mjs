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
  const { formatCurrency } = await server.ssrLoadModule('/src/lib/format-currency.ts')
  const { parseAmountMinor, validateTransaction, receiptError, draftFingerprint, localToday } = await server.ssrLoadModule('/src/lib/transaction-drafts.ts')
  assert.equal(parseAmountMinor('80000.01'), '8000001')
  assert.equal(parseAmountMinor('0.01'), '1')
  for (const amount of ['0', '-1', '1e3', 'NaN', '1.001', '80,000', '99999999999999999']) assert.equal(parseAmountMinor(amount), null)
  const form = { bankAccountId: '3', period: '2026-11', date: '2026-11-11', amount: '80000.01', notes: 'Monthly payment' }
  assert.deepEqual(validateTransaction(form, null, '2026-11-11'), {})
  for (const date of ['', '2026-02-30', '2026-13-01', '2026-11-12']) assert.ok(validateTransaction({ ...form, date }, null, '2026-11-11').date)
  assert.deepEqual(validateTransaction({ ...form, date: '2024-02-29' }, null, '2026-11-11'), {})
  assert.ok(validateTransaction({ ...form, bankAccountId: '0' }, null).bankAccountId)
  assert.ok(validateTransaction({ ...form, period: '2026-13' }, null).period)
  const file = { name: 'receipt.pdf', type: 'application/pdf', size: 1024 }
  assert.equal(receiptError(file), undefined)
  assert.equal(receiptError({ ...file, name: 'image.png', type: 'image/png' }), undefined)
  assert.equal(receiptError({ ...file, name: 'image.jpeg', type: 'image/jpeg' }), undefined)
  assert.equal(receiptError({ ...file, size: 10 * 1024 * 1024 }), undefined)
  assert.ok(receiptError({ ...file, size: 10 * 1024 * 1024 + 1 }))
  assert.ok(receiptError({ ...file, name: 'receipt.svg', type: 'image/svg+xml' }))
  assert.ok(receiptError({ ...file, name: 'receipt.exe' }))
  assert.ok(receiptError({ ...file, size: 0 }))
  const draft = { ...form, bankAccountId: 3, amountMinor: '8000001', receipt: null }
  assert.equal(draftFingerprint(draft), draftFingerprint({ ...draft, notes: ' monthly  payment ', receipt: file }))
  assert.notEqual(draftFingerprint(draft), draftFingerprint({ ...draft, amountMinor: '8000002' }))
  assert.equal(localToday(new Date(2026, 10, 11)), '2026-11-11')
  assert.equal(parseAmountMinor('90071992547409.91'), '9007199254740991')
  assert.equal(parseAmountMinor('92233720368547758.07'), '9223372036854775807')
  const { authContext } = await server.ssrLoadModule('/src/context/auth-context.ts')
  const { ProductLayout } = await server.ssrLoadModule('/src/layouts/ProductLayout.tsx')
  const { ProtectedRoute } = await server.ssrLoadModule('/src/routes/ProtectedRoute.tsx')
  const auth = session => ({ session, isSigningIn: false, signIn: async () => {}, signOut: () => {}, updateUser: () => true })
  const session = role => ({ user: { id: 'account-42', email: 'account@example.com', firstName: 'Actual', lastName: 'Person', role }, accessToken: 'test-only', expiresAt: Date.now() + 60000 })
  const guard = value => renderToString(React.createElement(authContext.Provider, { value: auth(value) }, React.createElement(MemoryRouter, { initialEntries: ['/admin/members'] }, React.createElement(Routes, null, React.createElement(Route, { element: React.createElement(ProtectedRoute, { roles: ['Admin'] }) }, React.createElement(Route, { path: '/admin/members', element: React.createElement('p', null, 'protected-members-marker') }))))))
  assert.ok(guard(session('Admin')).includes('protected-members-marker'))
  for (const value of [null, session('user'), { ...session('Admin'), expiresAt: Date.now() - 1 }, session('owner')]) assert.ok(!guard(value).includes('protected-members-marker'))

  let rendered = 0
  for (const [folder, role] of [['user', 'user'], ['admin', 'Admin']]) {
    const pages = [['Dashboard', 'Dashboard'], ['AddTransaction', 'AddTransaction'], ['Transactions', 'Transactions'], ['Portfolio', 'Portfolio'], ['Profile', 'Profile'], ['Settings', 'Settings'], ['Feedback', 'Feedback'], ...(role === 'Admin' ? [['ManageUsers', 'ManageUsers'], ['MemberDetails', 'MemberDetails'], ['BankAccounts', 'BankAccounts'], ['CreateFeedback', 'CreateFeedback']] : [])]
    for (const [file, name] of pages) {
      const module = await server.ssrLoadModule(`/src/pages/${folder}/${file}.tsx`)
      const html = renderToString(React.createElement(authContext.Provider, { value: auth(null) }, React.createElement(MemoryRouter, { initialEntries: ['/'] }, React.createElement(Routes, null, React.createElement(Route, { path: '/', element: React.createElement(ProductLayout, { role, preview: true }) }, React.createElement(Route, { index: true, element: React.createElement(module[name]) }))))))
      assert.ok(html.includes('Page preview'), `${folder}/${file} must identify its demo context.`)
      assert.ok(html.includes('id="product-main"'), `${folder}/${file} must have a main landmark.`)
      assert.ok(html.includes('aria-label="Mobile navigation"'))
      if (file === 'AddTransaction' && role === 'user') {
        assert.ok(html.includes('Review transaction') && html.includes('Attach receipt'))
        assert.ok(html.includes('Local draft') && html.includes('type="file"'))
      }
      if (['Dashboard', 'Portfolio'].includes(file)) {
        assert.ok(html.includes('Page under construction'), 'Disconnected portfolio must show its construction content.')
        assert.ok(html.includes('product-topbar') && html.includes('workspace-sidebar'), 'The portfolio must retain its workspace shell.')
        assert.ok(!html.includes('Allocation breakdown') && !html.includes('View fund details'), 'Disconnected portfolio must not render its financial content.')
      }
      if (file === 'ManageUsers') assert.ok(html.includes('Search users') && html.includes('No users found') && html.includes('Add user'))
      if (file === 'MemberDetails') assert.ok(html.includes('User details preview') && !html.includes('Selected user'))
      assert.ok(!html.includes('Samira') && !html.includes('Emeka'), 'No seeded members may appear in production page previews.')
      rendered++
    }
  }
  const assertMetric = (html, label, value) => {
    const match = html.match(new RegExp(`<dt>${label}</dt><dd class="metric-value">([\\s\\S]*?)</dd>`))
    assert.ok(match?.[1].includes(formatCurrency(value)), `${label} must show ${value} independently of the history filters.`)
  }
  for (const role of ['user', 'Admin']) {
    const { Transactions } = await server.ssrLoadModule('/src/pages/user/Transactions.tsx')
    const basePath = role === 'Admin' ? '/preview/admin' : '/preview/user'
    for (const query of ['?type=Investment', '?status=Pending&type=Contribution', '?q=NO-SUCH-RECORD', '?start=2026-11-10&end=2026-01-01']) {
      const html = renderToString(React.createElement(authContext.Provider, { value: auth(null) }, React.createElement(MemoryRouter, { initialEntries: [`${basePath}/transactions${query}`] }, React.createElement(Routes, null, React.createElement(Route, { path: basePath, element: React.createElement(ProductLayout, { role, preview: true }) }, React.createElement(Route, { path: 'transactions', element: React.createElement(Transactions) }))))))
      assertMetric(html, 'Confirmed contributions', 0)
      assertMetric(html, 'Remaining for the year', 0)
      assertMetric(html, 'Pending contributions', 0)
      assert.ok(html.includes('These zeros are placeholders.'))
      assert.ok(html.includes('Transaction filters'))
      if (role === 'Admin' && query.includes('start=2026-11-10')) assert.ok(html.includes('Check the date range'))
      else assert.ok(html.includes('Transaction history'))
      assert.ok(!html.includes(`href="${basePath}/contributions"`), 'Contributions must no longer appear as a navigation destination.')
    }
  }
  const { Profile } = await server.ssrLoadModule('/src/pages/user/Profile.tsx')
  const { productContext } = await server.ssrLoadModule('/src/components/shared/product/product-context.ts')
  const profile = renderToString(React.createElement(authContext.Provider, { value: auth(session('user')) }, React.createElement(MemoryRouter, null, React.createElement(productContext.Provider, { value: { role: 'user', preview: false, basePath: '/user', user: session('user').user } }, React.createElement(Profile)))))
  assert.ok(profile.includes('Loading page. Please wait.'))
  assert.ok(!profile.includes('Annual commitment') && !profile.includes('Sample account'))
  assert.ok(!profile.includes('Samira Yusuf'), 'Real identity must never be replaced with a preview identity.')
  assert.equal(requests, 0)
  console.log(`Product checks passed: ${rendered} screens, exact-role/expiry guards, profile loading without dummy data, construction placeholders, zero summary placeholders, no seeded records, transaction/receipt validation, and no API requests during preview/server rendering.`)
} finally {
  globalThis.fetch = originalFetch
  await server.close()
}
