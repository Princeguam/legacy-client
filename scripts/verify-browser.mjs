import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

// Test-only backend fixtures. Nothing here is imported by the frontend bundle.
const usersOnly = process.argv.includes('--users-only')
const uploadsOnly = process.argv.includes('--uploads-only')
const detailsOnly = process.argv.includes('--transaction-details-only')
const bankSettingsOnly = process.argv.includes('--bank-settings-only')
const root = fileURLToPath(new URL('../', import.meta.url))
const member = { id: 42, firstName: 'Test', middleName: null, lastName: 'Member', email: 'member@example.com', phoneNo: '+234 801 234 5678', dob: '1995-01-01T00:00:00Z', address: 'Account address', state: null, lga: null, gender: null, passport: '/brand/legacy-tree.png', role: 'User', isAdmin: false, isDeleted: false, created: '2025-06-12T10:00:00Z', updated: '2026-11-19T10:00:00Z' }
const administrator = { ...member, id: 1, lastName: 'Admin', email: 'admin@example.com', role: 'Admin' }
const directoryUsers = Array.from({ length: 12 }, (_, index) => ({ ...member, id: 42 + index, email: `member${index}@example.com`, lastName: `Member ${index}`, occupation: 'Engineer', address: null }))
const inactiveUser = { ...member, id: 77, email: 'inactive@example.com' }
const bankAccount = { id: 3, bankName: 'Test bank', accountName: 'Cooperative account', accountNumber: '0012345678', isActive: true }
const bankRows = Array.from({ length: 12 }, (_, index) => ({ ...bankAccount, id: index + 3, accountNumber: '00' + String(12345678 + index) }))
let profile = member
const records = Array.from({ length: 12 }, (_, index) => ({ id: index + 1, userId: 42, bankAccountId: 3, status: 'PENDING', type: 'DEPOSIT', amount: index ? 8000001 : '9223372036854775807', currency: 'NGN', note: `Payment ${index + 1}`, source: 'User', attachmentUrl: '/brand/legacy-tree.png', reviewedById: null, reviewedBy: null, reviewedAt: null, period: '2026-11-01T00:00:00Z', depositedAt: '2026-11-18T00:00:00Z', created: `2026-11-18T10:${String(30 - index).padStart(2, '0')}:00Z`, updated: '2026-11-19T10:00:00Z', depositedBy: member, bankAccount }))
const requests = []
let pending, pendingUpload, failRead = false
const reply = (res, data, status = 200, message = 'Please retry this request.') => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(status === 200 ? { success: true, message: 'Request Successful', data } : { success: false, message, errorCode: 1020 })) }
const server = await createServer({ root, server: { host: '127.0.0.1', port: 0, hmr: false, ws: false }, plugins: [{ name: 'browser-test-backend', configureServer(server) {
  server.middlewares.use((req, res, next) => {
    if (req.url === '/receipt-preview-test.pdf') { res.writeHead(200, { 'Content-Type': 'application/pdf' }); res.end('%PDF-1.4\n%%EOF'); return }
    if (!req.url.startsWith('/api/')) return next()
    const url = new URL(req.url, 'http://test.local')
    requests.push({ path: url.pathname, method: req.method, query: Object.fromEntries(url.searchParams) })
    if (req.method === 'GET' && url.pathname === '/api/profile') return reply(res, profile)
    if (url.pathname === '/api/util/upload') {
      const chunks = []
      req.on('data', chunk => chunks.push(chunk))
      req.on('end', async () => {
        const contentType = req.headers['content-type']
        const form = await new Response(Buffer.concat(chunks), { headers: { 'Content-Type': contentType } }).formData()
        const file = form.get('files')
        const uploaded = { fileUrl: 'https://uploads.test/' + file.name, bucket: 'test-bucket', key: 'uploads/' + file.name, mimeType: file.type, originalName: file.name }
        if (uploadsOnly) pendingUpload = { res, file, fields: [...form.keys()], contentType, uploaded }
        else reply(res, [uploaded])
      })
      return
    }
    if (url.pathname === '/api/notification/all') return reply(res, { page: 1, count: 0, totalItems: 0, totalPages: 0, pageData: [] })
    if (url.pathname === '/api/bank/no') return reply(res, bankRows.filter(bank => bank.isActive))
    if (url.pathname === '/api/admin/user/no') return reply(res, directoryUsers.map(user => ({ id: user.id, fullName: user.firstName + ' ' + user.lastName, email: user.email, phoneNo: user.phoneNo })))
    if (url.pathname === '/api/admin/bank/all') {
      if (failRead) { failRead = false; return reply(res, null, 503) }
      const rows = bankRows.filter(bank => bank.isActive === (url.searchParams.get('isActive') === 'true'))
      const page = Number(url.searchParams.get('page') || 1), count = Number(url.searchParams.get('count') || 10), pageData = rows.slice((page - 1) * count, page * count)
      return reply(res, { page, count: pageData.length, totalItems: rows.length, totalPages: Math.ceil(rows.length / count), pageData })
    }
    if (url.pathname === '/api/admin/user/all') {
      if (failRead) { failRead = false; return reply(res, null, 503) }
      let rows = url.searchParams.get('isActive') === 'false' ? [inactiveUser] : [...directoryUsers]
      const search = url.searchParams.get('search')?.toLowerCase()
      if (search) rows = rows.filter(user => `${user.firstName} ${user.lastName} ${user.email} ${user.phoneNo}`.toLowerCase().includes(search))
      const by = url.searchParams.get('by'), direction = url.searchParams.get('order') === 'asc' ? 1 : -1
      rows.sort((a, b) => (by === 'fullName' ? `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`) : a[by || 'created'].localeCompare(b[by || 'created'])) * direction)
      const page = Number(url.searchParams.get('page') || 1), count = Number(url.searchParams.get('count') || 10), pageData = rows.slice((page - 1) * count, page * count)
      return reply(res, { page, count: pageData.length, totalItems: rows.length, totalPages: Math.ceil(rows.length / count), pageData })
    }
    if (req.method === 'GET' && /^\/api\/admin\/user\/\d+$/.test(url.pathname)) {
      const user = [...directoryUsers, inactiveUser].find(user => user.id === Number(url.pathname.split('/').at(-1)))
      return user ? reply(res, user) : reply(res, null, 404)
    }
    if (url.pathname.endsWith('/transaction/all')) {
      if (failRead) { failRead = false; return reply(res, null, 503) }
      let rows = [...records]
      const selectedUser = url.pathname.match(/^\/api\/admin\/user\/(\d+)\/transaction\/all$/)
      if (selectedUser) rows = rows.filter(row => row.userId === Number(selectedUser[1]))
      if (url.searchParams.get('status')) rows = rows.filter(row => row.status === url.searchParams.get('status'))
      if (url.searchParams.get('search')) rows = rows.filter(row => row.note.toLowerCase().includes(url.searchParams.get('search').toLowerCase()))
      if (url.searchParams.get('from')) rows = rows.filter(row => row.period.slice(0, 10) >= url.searchParams.get('from'))
      if (url.searchParams.get('to')) rows = rows.filter(row => row.period.slice(0, 10) <= url.searchParams.get('to'))
      const by = url.searchParams.get('by') || 'created', direction = url.searchParams.get('order') === 'asc' ? 1 : -1
      rows.sort((a, b) => a[by].localeCompare(b[by]) * direction)
      const page = Number(url.searchParams.get('page') || 1), pageData = rows.slice((page - 1) * 10, page * 10)
      return reply(res, { page, count: pageData.length, totalItems: rows.length, totalPages: Math.ceil(rows.length / 10), pageData })
    }
    if (req.method === 'GET' && /^\/api\/(admin\/user\/\d+\/|admin\/)?transaction\/\d+$/.test(url.pathname)) {
      const selectedUser = url.pathname.match(/^\/api\/admin\/user\/(\d+)\//)
      const record = records.find(row => row.id === Number(url.pathname.split('/').at(-1)) && (!selectedUser || row.userId === Number(selectedUser[1])))
      return record ? reply(res, { ...record, note: `${record.note} — fresh server details` }) : reply(res, null, 404)
    }
    if (['POST', 'PUT'].includes(req.method) && (url.pathname === '/api/setting/password' || url.pathname === '/api/admin/bank' || url.pathname === '/api/profile' || url.pathname === '/api/admin/user' || url.pathname === '/api/transaction' || url.pathname.startsWith('/api/admin/transaction') || /^\/api\/admin\/user\/\d+\/transaction\/\d+$/.test(url.pathname))) {
      let body = ''
      req.on('data', chunk => { body += chunk })
      req.on('end', () => { pending = { res, path: url.pathname, method: req.method, body: JSON.parse(body) } })
      return
    }
    reply(res, null, 404)
  })
} }] })
await server.listen()
const origin = `http://127.0.0.1:${server.httpServer.address().port}`
const directory = await mkdtemp('/tmp/legacy-browser-')
const chrome = spawn(process.env.LEGACY_WEALTH_CHROME || '/usr/bin/google-chrome', ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0', `--user-data-dir=${directory}`, 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] })
let diagnostics = '', ws
let failureState = async () => ''
chrome.stderr.on('data', chunk => { diagnostics += chunk.toString() })
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
try {
  let port
  for (let i = 0; i < 300; i++) { try { port = (await readFile(`${directory}/DevToolsActivePort`, 'utf8')).split('\n')[0]; break } catch { await sleep(100) } }
  assert.ok(port, `Chrome startup failed: ${diagnostics.slice(-2000)}`)
  const target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json()
  ws = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => { ws.addEventListener('open', resolve, { once: true }); ws.addEventListener('error', reject, { once: true }) })
  let sequence = 0
  const calls = new Map()
  ws.addEventListener('message', event => { const data = JSON.parse(event.data), call = calls.get(data.id); if (call) { calls.delete(data.id); data.error ? call.reject(new Error(JSON.stringify(data.error))) : call.resolve(data.result) } })
  const cdp = (method, params = {}) => new Promise((resolve, reject) => { const id = ++sequence; calls.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params })) })
  const evaluate = async expression => { const result = await cdp('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true, userGesture: true }); if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails)); return result.result.value }
  failureState = () => evaluate(`JSON.stringify({path:location.pathname,active:document.activeElement?.outerHTML,dialogs:[...document.querySelectorAll('dialog[open]')].map(dialog=>dialog.textContent),alerts:[...document.querySelectorAll('#product-main [role="alert"]')].map(alert=>alert.textContent)})`)
  const until = async (expression, message) => { for (let i = 0; i < 150; i++) { if (await evaluate(`Boolean(${expression})`)) return; await sleep(100) } throw new Error(message) }
  const settle = () => evaluate(`Promise.all(document.getAnimations().filter(a=>a.effect.getTiming().iterations !== Infinity).map(a=>a.finished.catch(()=>{}))).then(()=>true)`)
  const click = async (text, modal = false) => {
    await settle()
    const point = await evaluate(`(()=>{const top=[...document.querySelectorAll('dialog[open]')].at(-1),root=${modal}?top:document;const b=[...root.querySelectorAll('button')].find(b=>b.getClientRects().length&&b.textContent.trim()===${JSON.stringify(text)}&&(!${modal}||b.closest('dialog')===top));if(!b)throw Error('Missing visible button');b.scrollIntoView({block:'center'});const r=b.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`)
    await cdp('Input.dispatchMouseEvent', { type: 'mousePressed', ...point, button: 'left', clickCount: 1 }); await cdp('Input.dispatchMouseEvent', { type: 'mouseReleased', ...point, button: 'left', clickCount: 1 })
  }
  const key = async (name, modifiers = 0) => { for (const type of ['keyDown', 'keyUp']) await cdp('Input.dispatchKeyEvent', { type, key: name, code: name, modifiers, windowsVirtualKeyCode: name === 'Tab' ? 9 : name === 'Enter' ? 13 : 27, ...(name === 'Enter' && type === 'keyDown' ? { text: '\r', unmodifiedText: '\r' } : {}) }) }
  const close = async () => { await key('Escape'); await until(`!document.querySelector('dialog[open]')`, 'Dialog must close.') }
  const fill = async (selector, value) => {
    await until(`!!document.querySelector(${JSON.stringify(selector)})&&!document.querySelector(${JSON.stringify(selector)}).disabled`, 'Field must be ready: ' + selector)
    return evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});Object.getOwnPropertyDescriptor(e.tagName==='SELECT'?HTMLSelectElement.prototype:e.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,'value').set.call(e,${JSON.stringify(value)});e.dispatchEvent(new Event(e.tagName==='SELECT'?'change':'input',{bubbles:true}))})()`)
  }
  const fillLabel = async (label, value) => { const id = await evaluate(`[...document.querySelectorAll('dialog[open] label')].find(l=>l.textContent===${JSON.stringify(label)}).htmlFor`); await fill(`[id=${JSON.stringify(id)}]`, value) }
  const navigate = async (path, condition) => { await cdp('Page.navigate', { url: origin + path }); await until(condition, `Page failed: ${path}`); await settle() }
  const mutationReady = async () => { for (let i = 0; i < 150 && !pending; i++) await sleep(100); assert.ok(pending, 'Expected transaction mutation.') }
  const layout = async label => {
    const result = await evaluate(`(()=>{const d=[...document.querySelectorAll('dialog[open]')].at(-1),b=d?.querySelector('.dialog-body'),f=d?.querySelector('.dialog-footer');return{overflow:document.documentElement.scrollWidth-innerWidth,body:b?b.scrollWidth-b.clientWidth:0,footer:f?.getBoundingClientRect().bottom,height:innerHeight}})()`)
    assert.ok(result.overflow <= 1 && result.body <= 1 && (result.footer === undefined || result.footer <= result.height + 1), `${label}: ${JSON.stringify(result)}`)
  }
  const screenshot = async name => { await settle(); const result = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false }); await writeFile(`/tmp/legacy-${name}.png`, Buffer.from(result.data, 'base64')) }
  await cdp('Page.enable'); await cdp('Runtime.enable'); await cdp('Network.enable'); await cdp('Network.setBlockedURLs', { urls: ['*fonts.googleapis.com*', '*fonts.gstatic.com*'] })
  if (!uploadsOnly && !detailsOnly && !bankSettingsOnly) {
  let seed
  for (const role of usersOnly ? ['Admin'] : ['user', 'Admin']) {
    profile = role === 'user' ? member : administrator
    const session = { user: { ...profile, role }, accessToken: `browser-${role}-token`, refreshToken: 'browser-refresh', expiresAt: Date.now() + 3600000 }
    if (seed) await cdp('Page.removeScriptToEvaluateOnNewDocument', { identifier: seed }).catch(error => { if (!error.message.includes('Script not found')) throw error })
    seed = (await cdp('Page.addScriptToEvaluateOnNewDocument', { source: `localStorage.setItem('legacy-wealth-session',${JSON.stringify(JSON.stringify(session))});localStorage.setItem('legacy-wealth-theme','light')` })).identifier
    const base = role === 'user' ? '/user' : '/admin'
    await cdp('Emulation.setDeviceMetricsOverride', { width: 1366, height: 900, deviceScaleFactor: 1, mobile: false })
    if (!usersOnly) {
    await navigate(`${base}/transactions`, `document.querySelector('.transaction-history tbody tr')`)
    assert.ok(await evaluate(`!!document.querySelector('header .account-avatar-photo')`))
    assert.ok((await evaluate(`document.querySelector('.transaction-history').textContent`)).includes('92,233,720,368,547,758.07'))
    await click('Next'); await until(`document.querySelector('.pagination')?.textContent.includes('11–12 of 12')`, 'Page two must load.')
    await click('Previous'); await until(`document.querySelector('.pagination')?.textContent.includes('1–10 of 12')`, 'Page one must load.')
    failRead = true; await click('Refresh'); await until(`document.querySelector('.transaction-history')?.textContent.includes('Showing the last loaded results')`, 'Failed refresh must preserve data.')
    await click('Try again'); await until(`!document.querySelector('.transaction-history').textContent.includes('Showing the last loaded results')`, 'Refresh must recover.')
    await click('View'); await until(`document.querySelector('dialog[open]')?.textContent.includes('fresh server details')`, 'Details must fetch fresh data.')
    for (let i = 0; i < 6; i++) { await key('Tab'); assert.ok(await evaluate(`!!document.activeElement.closest('dialog[open]')`)) }
    if (role === 'Admin') {
      await click('Confirm payment', true); await until(`document.querySelectorAll('dialog[open]').length===2`, 'Approval needs confirmation.')
      await click('Confirm status change', true); await mutationReady(); assert.deepEqual(pending.body, { isAccepted: true })
      await key('Escape'); assert.equal(await evaluate(`document.querySelectorAll('dialog[open]').length`), 2)
      const count = requests.filter(request => request.method === 'PUT').length
      await evaluate(`[...document.querySelectorAll('dialog[open]')].at(-1).querySelector('.dialog-footer button:last-child').click()`); await sleep(100)
      assert.equal(requests.filter(request => request.method === 'PUT').length, count)
      reply(pending.res, null, 409); pending = undefined
      await until(`[...document.querySelectorAll('[data-sonner-toast]')].some(toast=>toast.textContent.includes('Please retry this request.'))`, 'Review errors must preserve the dialog.')
      await click('Confirm status change', true); await mutationReady()
      const row = records.find(record => record.id === Number(pending.path.split('/').at(-1)))
      Object.assign(row, { status: 'CONFIRMED', reviewedById: 1, reviewedBy: administrator, reviewedAt: '2026-11-19T10:00:00Z' }); reply(pending.res, row); pending = undefined
      await until(`document.querySelectorAll('dialog[open]').length===1&&!document.querySelector('dialog[open]').textContent.includes('Confirm payment')`, 'Acknowledged approval must remove review actions.')
    }
    await close()
    await navigate(`${base}/transactions/new`, `document.querySelector('[name="bankAccountId"]')`)
    for (const [name, value] of Object.entries({ bankAccountId: '3', amount: '92233720368547758.07', period: '2026-11', ...(role === 'Admin' ? { memberId: '42', depositedAt: '2026-11-18', note: 'Recorded payment' } : { date: '2026-11-18', notes: 'Local payment' }) })) await fill(`[name="${name}"]`, value)
    if (role === 'user') {
      await writeFile(`${directory}/receipt.png`, await readFile(`${root}/public/brand/legacy-tree.png`))
      await writeFile(`${directory}/invalid.exe`, 'invalid receipt')
      const document = await cdp('DOM.getDocument')
      const { nodeId } = await cdp('DOM.querySelector', { nodeId: document.root.nodeId, selector: 'input[type="file"]' })
      await cdp('DOM.setFileInputFiles', { nodeId, files: [`${directory}/receipt.png`] })
      await until(`document.querySelector('#product-main')?.textContent.includes('receipt.png')`, 'The selected receipt must remain in the draft.')
      await cdp('DOM.setFileInputFiles', { nodeId, files: [`${directory}/invalid.exe`] })
      await until(`document.querySelector('#product-main')?.textContent.includes('Dismiss file error')`, 'Invalid replacement must report an error.')
      assert.ok((await evaluate(`document.querySelector('#product-main').textContent`)).includes('receipt.png'))
      await click('Dismiss file error and keep current file')
    }
    await click('Review transaction'); await until(`document.querySelector('dialog[open]')?.textContent.includes('92,233,720,368,547,758.07')`, 'Creation/draft review must keep every kobo.')
    if (role === 'Admin') {
      await click('Create transaction', true); await mutationReady(); assert.equal(pending.body.amount, '9223372036854775807'); assert.equal(pending.body.attachmentUrl, undefined)
      const created = { ...records[0], ...pending.body, id: 99, userId: 42, source: 'Admin', status: 'CONFIRMED', attachmentUrl: null, period: pending.body.period + 'T00:00:00Z', created: '2026-11-19T11:00:00Z', reviewedById: 1, reviewedBy: administrator, reviewedAt: '2026-11-19T11:00:00Z' }
      delete created.memberId; records.unshift(created); reply(pending.res, created); pending = undefined
      await until(`location.pathname==='/admin/transactions'`, 'Acknowledged creation must return to transactions.')
    } else {
      await click('Submit transaction', true); await mutationReady()
      const created = { ...records[0], ...pending.body, id: 100, source: 'User', status: 'PENDING', reviewedById: null, reviewedBy: null, reviewedAt: null, period: pending.body.period + 'T00:00:00Z' }
      records.unshift(created); reply(pending.res, created); pending = undefined
      await until(`location.pathname==='/user/transactions'`, 'Acknowledged member creation must return to history.')
    }

    await navigate(`${base}/profile`, `document.querySelector('.profile-summary')`)
    assert.equal(await evaluate(`[...document.querySelectorAll('.account-avatar-photo')].filter(image=>image.getClientRects().length).length`), 2)
    await click('Edit profile'); await until(`document.querySelector('dialog[open] #profile-form')`, 'Profile editor must open.')
    assert.equal(await evaluate(`[...document.querySelectorAll('#profile-form input')].filter(input=>input.required).length`), 4)
    assert.ok(!(await evaluate(`document.querySelector('#profile-form').textContent`)).toLowerCase().includes('optional')); await close()
    await navigate(`${base}/home`, `document.querySelector('#product-main')?.textContent.includes('Page under construction')`)
    await navigate(`${base}/transactions`, `document.querySelector('.transaction-history tbody tr')`)
    for (const width of [960, 600, 320]) {
      await cdp('Emulation.setDeviceMetricsOverride', { width, height: 720, deviceScaleFactor: 1, mobile: false }); await settle(); await layout(`${role} ${width}px history`)
      await click('View'); await until(`document.querySelector('dialog[open] dl')`, 'Responsive details must load.'); await settle(); await layout(`${role} ${width}px details`)
      if (width === 320) await screenshot(`${role}-transactions-320`); await close()
    }
    await evaluate(`window.fontSizes=[...document.querySelectorAll('body *')].map(e=>[e,e.style.fontSize,parseFloat(getComputedStyle(e).fontSize)]);for(const[e,,size]of window.fontSizes)e.style.fontSize=(size*2)+'px'`)
    await layout(`${role} 200% text`); await screenshot(`${role}-transactions-text`)
    await evaluate(`for(const[e,size]of window.fontSizes)e.style.fontSize=size`)
    for (const features of [[{ name: 'prefers-reduced-motion', value: 'reduce' }], [{ name: 'forced-colors', value: 'active' }]]) { await cdp('Emulation.setEmulatedMedia', { features }); await layout(`${role} accessibility mode`) }
    await cdp('Emulation.setEmulatedMedia', { features: [] }); await evaluate(`document.documentElement.dataset.theme='dark'`); await layout(`${role} dark theme`); await screenshot(`${role}-transactions-dark`)
    }
    if (role === 'Admin') {
      if (!usersOnly) {
      await navigate('/admin/bank-accounts', `document.querySelector('.table-region tbody td')`)
      await layout('Bank accounts 320px')
      for (const mode of ['Add bank account']) {
        await click(mode); await until(`document.querySelector('dialog[open] #bank-account-form')`, 'Bank form must open.')
        await fillLabel('Bank name', 'Test bank'); await fillLabel('Account name', 'Cooperative account'); await fillLabel('Account number', '0012345678')
        await click('Review details', true); await until(`document.querySelector('dialog[open]')?.textContent.includes('0012345678')`, 'Bank review must preserve leading zeros.')
        assert.equal(await evaluate(`document.querySelector('dialog[open] .dialog-footer button:last-child').disabled`), false); await layout('Bank review 320px'); await screenshot('bank-320-review'); await close()
      }
      assert.ok(!requests.some(request => request.path === '/api/admin/bank' && request.method !== 'GET'))
      }
      await cdp('Emulation.setDeviceMetricsOverride', { width: 1366, height: 900, deviceScaleFactor: 1, mobile: false })
      await navigate('/admin/members', `document.querySelector('.member-directory tbody tr')`)
      assert.equal(requests.filter(request => request.path === '/api/admin/user/all').at(-1).query.isActive, 'true')
      await click('Next'); await until(`document.querySelector('.member-directory .pagination')?.textContent.includes('11–12 of 12')`, 'User pagination must use server totals.')
      await click('Previous'); await until(`document.querySelector('.member-directory .pagination')?.textContent.includes('1–10 of 12')`, 'User page one must load.')
      failRead = true; await click('Refresh'); await until(`document.querySelector('.member-directory')?.textContent.includes('Showing the last loaded results')`, 'User read errors must preserve loaded results.')
      assert.equal(await evaluate(`document.querySelectorAll('.member-directory a.member-view').length`), 0)
      await click('Try again'); await until(`document.querySelector('.member-directory a.member-view')`, 'User refresh must recover.')
      await navigate('/admin/members?activity=inactive', `document.querySelector('.member-directory')?.textContent.includes('inactive@example.com')`)
      assert.equal(requests.filter(request => request.path === '/api/admin/user/all').at(-1).query.isActive, 'false')
      await navigate('/admin/members?q=member0&sort=emailAsc', `document.querySelector('.member-directory .pagination')?.textContent.includes('1–1 of 1')`)
      assert.equal(requests.filter(request => request.path === '/api/admin/user/all').at(-1).query.search, 'member0')
      await navigate('/admin/members', `document.querySelector('.member-directory tbody tr')`)
      for (const width of [1366, 960, 600, 320]) {
        await cdp('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false }); await settle(); await layout(`User directory ${width}px`)
      }
      await screenshot('admin-users-320')
      await click('Add user'); await until(`document.querySelector('#add-user-form')`, 'The prepared user form must open.')
      const beforeCreate = requests.length
      await click('Review user details', true); await until(`document.querySelector('#add-user-form [aria-invalid="true"]')`, 'User form must validate required fields.')
      assert.equal(await evaluate(`document.activeElement.name`), 'firstName')
      assert.equal(await evaluate(`[...document.querySelectorAll('#add-user-form input')].filter(input=>input.required).length`), 4)
      assert.ok(!(await evaluate(`document.querySelector('#add-user-form').textContent`)).toLowerCase().includes('optional'))
      for (const [label, value] of Object.entries({ 'First name': 'New', 'Last name': 'Member', 'Email address': 'new@example.com', 'Phone number': '+234 800 999 9999' })) await fillLabel(label, value)
      await click('Review user details', true); await until(`document.querySelector('dialog[open]')?.textContent.includes('new@example.com')`, 'Prepared user details must be reviewable.')
      assert.equal(await evaluate(`[...document.querySelectorAll('dialog[open] button')].find(button=>button.textContent==='Create user').disabled`), false)
      await layout('Add user review 320px'); await screenshot('admin-add-user-320')
      await click('Back to details', true); assert.equal(await evaluate(`document.querySelector('#new-user-email').value`), 'new@example.com')
      for (let i = 0; i < 15; i++) { await key('Tab', i % 2 ? 1 : 0); assert.ok(await evaluate(`!!document.activeElement.closest('dialog[open]')`)) }
      await close(); assert.equal(requests.length, beforeCreate, 'Prepared user form must make no requests.')
      await evaluate(`[...document.querySelectorAll('a.member-view')].find(a=>a.getClientRects().length&&a.href.endsWith('/42')).focus()`); await key('Enter')
      await until(`location.pathname==='/admin/members/42'&&document.querySelector('.transaction-history tbody tr')`, 'Keyboard directory action must open the selected user.')
      assert.ok(await evaluate(`document.querySelector('.profile-summary').textContent.includes('Selected user')`))
      assert.ok(await evaluate(`document.querySelector('.profile-fields').parentElement.textContent.includes('Engineer')`))
      assert.equal(await evaluate(`JSON.parse(localStorage.getItem('legacy-wealth-session')).user.id`), 1)
      assert.equal(await evaluate(`document.querySelector('.topbar-account').textContent.includes('Admin')`), true)
      assert.ok(requests.some(request => request.path === '/api/admin/user/42/transaction/all'))
      assert.ok((await evaluate(`document.querySelector('.transaction-history').textContent`)).includes('92,233,720,368,547,758.07'))
      await layout('Selected user 320px'); await screenshot('admin-user-details-320')
      await navigate('/admin/members/42?status=PENDING', `document.querySelector('.transaction-history tbody tr')`)
      await click('View'); await until(`document.querySelector('dialog[open]')?.textContent.includes('fresh server details')`, 'Selected user payments must fetch scoped fresh details.')
      const selectedTransaction = requests.filter(request => /^\/api\/admin\/user\/42\/transaction\/\d+$/.test(request.path)).at(-1).path
      await click('Reject payment', true); await click('Confirm status change', true); await mutationReady()
      assert.equal(pending.path, selectedTransaction); assert.deepEqual(pending.body, { isAccepted: false })
      const scopedRow = records.find(record => record.id === Number(pending.path.split('/').at(-1)))
      Object.assign(scopedRow, { status: 'REJECTED', reviewedById: 1, reviewedBy: administrator, reviewedAt: '2026-11-19T10:00:00Z' }); reply(pending.res, scopedRow); pending = undefined
      await until(`document.querySelectorAll('dialog[open]').length===1&&![...document.querySelector('dialog[open]').querySelectorAll('button')].some(button=>button.getClientRects().length&&button.textContent.trim()==='Reject payment')`, 'Scoped rejection must wait for acknowledgement.')
      await close()
      await navigate('/admin/members/43', `document.querySelector('.transaction-history')?.textContent.includes('No transactions found')`)
      assert.ok(!(await evaluate(`document.querySelector('#product-main').textContent`)).includes('Payment 2'))
      await navigate('/admin/members/999', `document.querySelector('#product-main button')?.textContent==='Try again'`)
      await navigate('/admin/members/invalid', `document.querySelector('#product-main')?.textContent.includes('Invalid user')`)
      await navigate('/admin/members/42', `document.querySelector('.transaction-history tbody tr')`)
      await evaluate(`window.fontSizes=[...document.querySelectorAll('body *')].map(e=>[e,e.style.fontSize,parseFloat(getComputedStyle(e).fontSize)]);for(const[e,,size]of window.fontSizes)e.style.fontSize=(size*2)+'px'`)
      await layout('Selected user 200% text'); await evaluate(`for(const[e,size]of window.fontSizes)e.style.fontSize=size`)
      for (const features of [[{ name: 'prefers-reduced-motion', value: 'reduce' }], [{ name: 'forced-colors', value: 'active' }]]) { await cdp('Emulation.setEmulatedMedia', { features }); await layout('User details accessibility mode') }
      await cdp('Emulation.setEmulatedMedia', { features: [] }); await evaluate(`document.documentElement.dataset.theme='dark'`); await layout('User details dark')
      console.log('Admin user directory, scoped details/review, preparation form, session isolation, keyboard and responsive checks passed.')
    }
    if (!usersOnly) console.log(`${role}: browser payment, passport, profile, keyboard, reflow, text, theme and media checks passed.`)
  }
  const before = requests.length
  await navigate('/preview/user/transactions', `document.querySelector('.transaction-history')`)
  assert.equal(await evaluate(`document.querySelectorAll('.transaction-history tbody tr').length`), 0)
  await sleep(300); assert.equal(requests.length, before)
  for (const [path, condition] of [['/preview/admin/members', `document.querySelector('.member-directory')`], ['/preview/admin/members/42', `document.querySelector('#product-main')?.textContent.includes('User details preview')`]]) {
    await navigate(path, condition); await sleep(300); assert.equal(requests.length, before)
  }
  await cdp('Page.addScriptToEvaluateOnNewDocument', { source: `localStorage.removeItem('legacy-wealth-session')` })
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1366, height: 900, deviceScaleFactor: 1, mobile: false })
  await navigate('/login', `document.querySelector('.auth-brand-tagline')`)
  assert.equal(await evaluate(`document.querySelector('.auth-brand-tagline').textContent`), 'Rooted in trust. Growing together.')
  assert.ok(await evaluate(`document.querySelector('.auth-brand-tagline').getBoundingClientRect().bottom < document.querySelector('.auth-hand-illustration').getBoundingClientRect().top`))
  await layout('Login tagline desktop'); await screenshot('login-tagline')
  await cdp('Emulation.setDeviceMetricsOverride', { width: 960, height: 720, deviceScaleFactor: 1, mobile: false }); await layout('Login tagline 960px')
  await cdp('Emulation.setDeviceMetricsOverride', { width: 320, height: 720, deviceScaleFactor: 1, mobile: false }); await layout('Login 320px')
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('.auth-brand-panel')).display`), 'none')
  console.log('Preview isolation and unconnected bank forms passed. Live APIs, actual browser zoom controls and screen readers were not tested.')
  }
  if (uploadsOnly) {
    const imageBody = (await readFile(`${root}/public/brand/legacy-tree.png`)).toString('base64')
    ws.addEventListener('message', event => {
      const data = JSON.parse(event.data)
      if (data.method === 'Fetch.requestPaused') void cdp('Fetch.fulfillRequest', { requestId: data.params.requestId, responseCode: 200, responseHeaders: [{ name: 'Content-Type', value: 'image/png' }], body: imageBody })
    })
    await cdp('Fetch.enable', { patterns: [{ urlPattern: 'https://uploads.test/*' }] })
    await writeFile(`${directory}/avatar.png`, Buffer.from(imageBody, 'base64'))
    await writeFile(`${directory}/receipt.png`, Buffer.from(imageBody, 'base64'))
    await writeFile(`${directory}/invalid.exe`, 'invalid attachment')
    const selectFile = async (name, fileName) => {
      const document = await cdp('DOM.getDocument')
      const { nodeId } = await cdp('DOM.querySelector', { nodeId: document.root.nodeId, selector: `input[name="${name}"]` })
      await cdp('DOM.setFileInputFiles', { nodeId, files: [`${directory}/${fileName}`] })
    }
    const uploadReady = async () => { for (let i = 0; i < 150 && !pendingUpload; i++) await sleep(100); assert.ok(pendingUpload, 'Expected upload request.') }
    const releaseUpload = () => { const url = pendingUpload.uploaded.fileUrl; reply(pendingUpload.res, [pendingUpload.uploaded]); pendingUpload = undefined; return url }
    const uploads = () => requests.filter(request => request.path === '/api/util/upload').length
    const writes = () => requests.filter(request => ['POST', 'PUT'].includes(request.method)).length
    const toastText = message => `[...document.querySelectorAll('[data-sonner-toast]')].some(toast=>toast.textContent.includes(${JSON.stringify(message)}))`
    const clearToasts = async () => { await evaluate(`[...document.querySelectorAll('[data-close-button]')].forEach(button=>button.click())`); await until(`!document.querySelector('[data-sonner-toast]')`, 'Dismissed toasts must leave the DOM.'); await settle() }
    let uploadSeed
    const signIn = async role => {
      profile = role === 'Admin' ? administrator : member
      const session = { user: { ...profile, role }, accessToken: `upload-${role}`, refreshToken: 'upload-refresh', expiresAt: Date.now() + 3600000 }
      if (uploadSeed) await cdp('Page.removeScriptToEvaluateOnNewDocument', { identifier: uploadSeed })
      uploadSeed = (await cdp('Page.addScriptToEvaluateOnNewDocument', { source: `localStorage.setItem('legacy-wealth-session',${JSON.stringify(JSON.stringify(session))});localStorage.setItem('legacy-wealth-theme','light')` })).identifier
      return session
    }
    const adminSession = await signIn('Admin')
    await cdp('Emulation.setDeviceMetricsOverride', { width: 320, height: 900, deviceScaleFactor: 1, mobile: false })
    await navigate('/admin/profile', `document.querySelector('.profile-summary')`)
    await click('Edit profile'); await until(`document.querySelector('#profile-form')`, 'Profile editor must open.')
    assert.ok(await evaluate(`(()=>{const circle=document.querySelector('.avatar-picker-trigger').getBoundingClientRect(),form=document.querySelector('#profile-form').getBoundingClientRect();return Math.abs(circle.x+circle.width/2-form.x-form.width/2)<1})()`), 'Avatar circle must be centered.')
    await cdp('Emulation.setDeviceMetricsOverride', { width: 960, height: 900, deviceScaleFactor: 1, mobile: false })
    assert.equal(await evaluate(`Math.round(document.querySelector('dialog[open]').getBoundingClientRect().width)`), 720)
    await layout('Wider profile editor desktop')
    await cdp('Emulation.setDeviceMetricsOverride', { width: 320, height: 900, deviceScaleFactor: 1, mobile: false })
    assert.equal(await evaluate(`document.querySelectorAll('#profile-form input').length`), 18)
    assert.equal(await evaluate(`[...document.querySelectorAll('#profile-form input')].filter(input=>input.required).length`), 4)
    for (const [label, value] of Object.entries({ Occupation: 'Engineer', 'Next of kin': 'Family contact', 'Next of kin relationship': 'Sibling', 'Next of kin phone': '+234 800 000 0001', 'Emergency contact': 'Emergency person', 'Emergency contact phone': '+234 800 000 0002', 'Emergency contact relationship': 'Friend' })) await fillLabel(label, value)
    const beforeProfile = writes()
    await selectFile('avatar', 'avatar.png'); await uploadReady(); await until(`document.querySelector('#profile-form').textContent.includes('avatar.png')`, 'Avatar selection must be retained.')
    await layout('Expanded profile and avatar 320px'); await screenshot('profile-avatar-form-320')
    assert.deepEqual(pendingUpload.fields, ['files']); assert.match(pendingUpload.contentType, /^multipart\/form-data; boundary=/)
    assert.equal(writes(), beforeProfile + 1, 'Profile must wait for upload acknowledgement.')
    assert.equal(pending, undefined, 'Selecting an avatar must upload without saving the profile.')
    assert.ok(await evaluate(`document.querySelector('dialog[open] .dialog-footer button:last-child').disabled`), 'Save must wait for the selected avatar upload.')
    const passport = releaseUpload(); await until(`!document.querySelector('dialog[open] .dialog-footer button:last-child').disabled`, 'Uploaded avatars must enable save.'); await click('Save changes', true); await mutationReady()
    assert.equal(pending.path, '/api/profile'); assert.equal(pending.body.passport, passport); assert.equal(pending.body.occupation, 'Engineer')
    await key('Escape'); assert.equal(await evaluate(`document.querySelectorAll('dialog[open]').length`), 1)
    const beforeDuplicate = writes(); await evaluate(`document.querySelector('#profile-form').requestSubmit()`); await sleep(100); assert.equal(writes(), beforeDuplicate)
    reply(pending.res, null, 409, 'Profile changes rejected by the backend.'); pending = undefined
    await until(toastText('Profile changes rejected by the backend.'), 'Backend profile error must appear verbatim in a toast.')
    assert.ok(await evaluate(`!!document.querySelector('[data-sonner-toast]').closest('dialog[open]')`), 'Error toast must be visible in the native modal top layer.')
    assert.equal(await evaluate(`document.querySelector('#profile-occupation').value`), 'Engineer')
    assert.equal(await evaluate(`JSON.parse(localStorage.getItem('legacy-wealth-session')).user.passport`), administrator.passport)
    await layout('Backend toast 320px'); await screenshot('profile-error-toast-320')
    assert.ok(await evaluate(`(()=>{const dialog=document.querySelector('dialog[open]');return dialog.scrollWidth-dialog.clientWidth<=1})()`), 'Toasts must fit inside the dialog without horizontal clipping.')
    for (const features of [[{ name: 'prefers-reduced-motion', value: 'reduce' }], [{ name: 'forced-colors', value: 'active' }]]) { await cdp('Emulation.setEmulatedMedia', { features }); await layout('Toast accessibility mode') }
    await cdp('Emulation.setEmulatedMedia', { features: [] }); await clearToasts()
    const profileUploadCount = uploads()
    await click('Save changes', true); await mutationReady(); assert.equal(uploads(), profileUploadCount, 'Retry must reuse the uploaded avatar.')
    profile = { ...administrator, ...pending.body }; reply(pending.res, profile); pending = undefined
    await until(`!document.querySelector('dialog[open]')&&document.querySelector('header img')?.getAttribute('src')===${JSON.stringify(passport)}`, 'Acknowledged avatar must update the top bar.')
    await until(toastText('Your profile has been updated.'), 'Success toast must survive closing the dialog.')
    const savedSession = await evaluate(`JSON.parse(localStorage.getItem('legacy-wealth-session'))`)
    assert.equal(savedSession.accessToken, adminSession.accessToken); assert.equal(savedSession.refreshToken, adminSession.refreshToken); assert.equal(savedSession.expiresAt, adminSession.expiresAt)
    await clearToasts()
    await navigate('/admin/members', `document.querySelector('.member-directory')`)
    assert.ok(await evaluate(`(()=>{const region=document.querySelector('.member-table'),cell=region.querySelector('td'),name=cell.querySelector('.cell-stack span'),avatar=cell.querySelector('.avatar');return region.scrollWidth>region.clientWidth&&getComputedStyle(cell).position==='static'&&getComputedStyle(name).whiteSpace==='nowrap'&&Math.round(avatar.getBoundingClientRect().width)===40})()`), 'Mobile user details must stay unbroken and scroll with the avatar.')
    const initialNameX = await evaluate(`document.querySelector('.member-table .member-identity').getBoundingClientRect().x`)
    await evaluate(`document.querySelector('.member-table').scrollLeft=120`)
    assert.ok(await evaluate(`document.querySelector('.member-table .member-identity').getBoundingClientRect().x`) < initialNameX)
    await evaluate(`document.querySelector('.member-table').scrollLeft=0`)
    await screenshot('mobile-users-table-320')
    await click('Add user'); await until(`document.querySelector('#add-user-form')`, 'Add user must open.')
    await cdp('Emulation.setDeviceMetricsOverride', { width: 960, height: 900, deviceScaleFactor: 1, mobile: false })
    assert.equal(await evaluate(`Math.round(document.querySelector('dialog[open]').getBoundingClientRect().width)`), 720)
    await cdp('Emulation.setDeviceMetricsOverride', { width: 320, height: 900, deviceScaleFactor: 1, mobile: false })
    for (const [label, value] of Object.entries({ 'First name': 'New', 'Last name': 'Member', 'Email address': 'new@example.com', 'Phone number': '+234 800 999 9999', Occupation: 'Designer', 'Next of kin': 'Family' })) await fillLabel(label, value)
    assert.equal(await evaluate(`document.querySelector('#add-user-form select')`), null, 'Creation must not offer unsupported administrator roles.')
    await selectFile('avatar', 'avatar.png'); await uploadReady(); assert.equal(pending, undefined, 'Add user selection must not create the account.'); releaseUpload()
    await until(`!document.querySelector('dialog[open] .dialog-footer button:last-child').disabled`, 'User review must wait for its avatar upload.'); await click('Review user details', true)
    await layout('Add user review 320px'); await click('Create user', true); await mutationReady()
    assert.equal(pending.path, '/api/admin/user'); assert.equal(pending.body.passport, passport); assert.equal(pending.body.role, undefined); assert.equal(pending.body.password, undefined)
    reply(pending.res, null, 409, 'Phone no already exists.'); pending = undefined
    await until(toastText('Phone no already exists.'), 'Backend user-creation error must be unchanged.')
    await clearToasts(); const createUploadCount = uploads()
    await click('Create user', true); await mutationReady(); assert.equal(uploads(), createUploadCount)
    const newUser = { ...member, ...pending.body, id: 99, dob: null, occupation: 'Designer' }; directoryUsers.unshift(newUser); reply(pending.res, newUser); pending = undefined
    await until(`!document.querySelector('dialog[open]')&&document.querySelector('.member-directory').textContent.includes('new@example.com')`, 'Created user must be refreshed from the API.')
    await until(toastText('New Member has been created.'), 'User success toast must survive closing the form.')
    assert.equal(await evaluate(`JSON.parse(localStorage.getItem('legacy-wealth-session')).user.id`), 1)
    await clearToasts()
    await navigate('/admin/transactions/new', `document.querySelector('[name="memberId"]')`)
    for (const [name, value] of Object.entries({ memberId: '42', bankAccountId: '3', amount: '0.01', period: '2026-11', depositedAt: '2026-11-18', note: 'Admin receipt' })) await fill(`[name="${name}"]`, value)
    await selectFile('receipt', 'receipt.png'); await uploadReady(); assert.equal(pending, undefined, 'Admin receipt selection must upload before payment creation.'); const adminReceipt = releaseUpload()
    await until(`document.querySelector('#product-main').textContent.includes('File uploaded. Ready to save.')`, 'Admin receipts must acknowledge before review.'); await click('Review transaction'); await click('Create transaction', true); await mutationReady()
    assert.equal(pending.body.attachmentUrl, adminReceipt); assert.equal(pending.body.amount, '1')
    const confirmed = { ...records[0], ...pending.body, id: 600, userId: 42, source: 'Admin', status: 'CONFIRMED', reviewedById: 1, reviewedBy: administrator, reviewedAt: '2026-11-19T10:00:00Z', period: pending.body.period + 'T00:00:00Z' }; delete confirmed.memberId
    records.unshift(confirmed); reply(pending.res, confirmed); pending = undefined
    await until(`location.pathname==='/admin/transactions'`, 'Admin receipt submission must await acknowledgement.')
    await clearToasts()
    await signIn('user')
    await navigate('/user/transactions/new', `document.querySelector('[name="bankAccountId"]')`)
    for (const [name, value] of Object.entries({ bankAccountId: '3', amount: '92233720368547758.07', period: '2026-11', date: '2026-11-18', notes: 'Uploaded payment' })) await fill(`[name="${name}"]`, value)
    const beforeMissingReceipt = writes(); await click('Review transaction'); await until(`document.querySelector('input[name="receipt"]').getAttribute('aria-invalid')==='true'`, 'Member receipt must be required.'); assert.equal(writes(), beforeMissingReceipt)
    await selectFile('receipt', 'receipt.png'); await uploadReady(); await selectFile('receipt', 'invalid.exe')
    await until(`document.querySelector('#product-main').textContent.includes('Dismiss file error')`, 'Invalid file replacement must be reported.')
    assert.ok(await evaluate(`document.querySelector('#product-main').textContent.includes('receipt.png')`))
    await click('Dismiss file error and keep current file')
    reply(pendingUpload.res, null, 400, 'Receipt service refused this file.'); pendingUpload = undefined
    await until(toastText('Receipt service refused this file.'), 'Upload errors must be displayed verbatim.')
    assert.equal(pending, undefined, 'Upload errors must not submit a transaction.')
    await clearToasts(); await click('Retry upload'); await uploadReady(); const memberReceipt = releaseUpload()
    await until(`document.querySelector('#product-main').textContent.includes('File uploaded. Ready to save.')`, 'Member upload retry must acknowledge before review.'); await click('Review transaction'); await click('Submit transaction', true); await mutationReady()
    assert.equal(pending.body.attachmentUrl, memberReceipt); assert.equal(pending.body.amount, '9223372036854775807'); assert.equal(pending.body.userId, undefined)
    const paymentUploadCount = uploads(); reply(pending.res, null, 409, 'Payment already exists.'); pending = undefined
    await until(toastText('Payment already exists.'), 'Transaction error must preserve the server message.')
    await clearToasts(); await click('Submit transaction', true); await mutationReady(); assert.equal(uploads(), paymentUploadCount, 'A transaction retry must reuse the acknowledged receipt.')
    const submitted = { ...records[0], ...pending.body, id: 700, userId: 42, source: 'User', status: 'PENDING', reviewedById: null, reviewedBy: null, reviewedAt: null, period: pending.body.period + 'T00:00:00Z' }
    records.unshift(submitted); reply(pending.res, submitted); pending = undefined
    await until(`location.pathname==='/user/transactions'&&document.querySelector('.transaction-history')?.textContent.includes('Uploaded payment')`, 'Acknowledged member submission must load real history.')
    await until(toastText('Your payment has been submitted for review.'), 'Member success toast must survive navigation.')
    assert.equal(await evaluate(`document.querySelector('.local-transaction-drafts')`), null)
    await clearToasts()
    assert.ok(await evaluate(`(()=>{const region=document.querySelector('.transactions-table');return getComputedStyle(region).display!=='none'&&region.scrollWidth>region.clientWidth})()`), 'Mobile transactions must stay in a scrollable table.')
    await evaluate(`document.querySelector('.transactions-table').scrollLeft=200`)
    assert.ok(await evaluate(`document.querySelector('.transactions-table').scrollLeft>0`))
    await layout('Scrollable transaction table 320px'); await screenshot('mobile-transaction-table-320')
    await navigate('/user/profile', `document.querySelector('.profile-summary')`); await click('Edit profile')
    await selectFile('avatar', 'avatar.png'); await uploadReady()
    const cancelledUpload = pendingUpload; pendingUpload = undefined
    await click('Remove selected avatar', true)
    reply(cancelledUpload.res, [cancelledUpload.uploaded]); await sleep(150)
    assert.ok(!(await evaluate(`document.querySelector('#profile-form').textContent`)).includes('File uploaded. Ready to save.'), 'Removed selections must ignore late upload acknowledgements.')
    assert.ok(await evaluate(`!document.querySelector('dialog[open] .dialog-footer button:last-child').disabled`))
    await selectFile('avatar', 'avatar.png'); await uploadReady()
    const replacedUpload = pendingUpload; pendingUpload = undefined
    await selectFile('avatar', 'receipt.png'); await uploadReady()
    reply(replacedUpload.res, [replacedUpload.uploaded]); const replacementUrl = releaseUpload()
    await until(`document.querySelector('#profile-form').textContent.includes('File uploaded. Ready to save.')`, 'Replacing a pending file must retain only the new acknowledgement.')
    assert.ok(replacementUrl.endsWith('/receipt.png'))
    await close()
    await navigate('/user/transactions/new', `document.querySelector('input[name="receipt"]')`)
    await selectFile('receipt', 'receipt.png'); await uploadReady()
    const signedOutUpload = pendingUpload; pendingUpload = undefined
    await evaluate(`document.querySelector('header button[aria-label="Sign out"]').focus()`); await key('Enter'); await until(`location.pathname==='/login'`, 'Sign-out must cancel the current upload scope.')
    reply(signedOutUpload.res, [signedOutUpload.uploaded]); await sleep(150)
    assert.equal(await evaluate(`localStorage.getItem('legacy-wealth-session')`), null)
    const beforePreview = requests.length
    await navigate('/preview/admin/members', `document.querySelector('.member-directory')`); await click('Add user')
    await selectFile('avatar', 'avatar.png'); await close(); await navigate('/preview/user/transactions/new', `document.querySelector('[name="receipt"]')`); await selectFile('receipt', 'receipt.png')
    await sleep(200); assert.equal(requests.length, beforePreview, 'Previews must not upload or request account records.')
    console.log('Upload browser checks passed: immediate selection uploads before form writes, multipart files, avatars/contact fields, admin creation, member/admin receipts, pending-save guards, exact backend errors, upload retry and acknowledged URL reuse, modal/navigation persistence, 320px reflow, keyboard, media modes and preview isolation.')
  }

  if (detailsOnly) {
    records[1].attachmentUrl = '/receipt-preview-test.pdf'
    records[2].attachmentUrl = null
    let detailsSeed
    const signIn = async role => {
      profile = role === 'Admin' ? administrator : member
      const session = { user: { ...profile, role }, accessToken: `details-${role}`, refreshToken: 'details-refresh', expiresAt: Date.now() + 3600000 }
      if (detailsSeed) await cdp('Page.removeScriptToEvaluateOnNewDocument', { identifier: detailsSeed })
      detailsSeed = (await cdp('Page.addScriptToEvaluateOnNewDocument', { source: `localStorage.setItem('legacy-wealth-session',${JSON.stringify(JSON.stringify(session))});localStorage.setItem('legacy-wealth-theme','light')` })).identifier
    }
    const clearToasts = async () => {
      await evaluate(`[...document.querySelectorAll('[data-close-button]')].forEach(button=>button.click())`)
      await until(`!document.querySelector('[data-sonner-toast]')`, 'Dismissed toasts must leave the DOM.')
    }
    const status = () => evaluate(`[...document.querySelector('dialog[open] > .dialog-layout > .dialog-body > .transaction-details > .payment-details-grid').children].find(field=>field.querySelector('dt').textContent==='Status').querySelector('dd').textContent`)
    const targets = async () => (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json())
    await signIn('Admin')
    await cdp('Emulation.setDeviceMetricsOverride', { width: 1366, height: 900, deviceScaleFactor: 1, mobile: false })
    await navigate('/admin/transactions', `document.querySelector('.transaction-history tbody tr')`)
    await click('View'); await until(`document.querySelector('dialog[open] .payment-details-grid')`, 'Transaction details must fetch fresh data.')
    assert.equal(await evaluate(`Math.round(document.querySelector('dialog[open]').getBoundingClientRect().width)`), 720)
    assert.ok(await evaluate(`document.querySelector('dialog[open]').textContent.includes('member@example.com')`), 'The general admin transaction retains its member identity.')
    assert.ok(await evaluate(`document.querySelector('dialog[open]').textContent.includes('92,233,720,368,547,758.07')`))
    assert.equal(await status(), 'Pending')
    const receipt = await evaluate(`(()=>{const link=document.querySelector('dialog[open] .receipt-attachment');link.scrollIntoView({block:'center'});return{url:link.href,target:link.target,rel:link.rel}})()`)
    await until(`document.querySelector('dialog[open] .receipt-attachment img')?.naturalWidth>0`, 'The receipt must display a real thumbnail.')
    assert.equal(receipt.target, '_blank'); assert.ok(receipt.rel.includes('noopener') && receipt.rel.includes('noreferrer'))
    assert.equal(await evaluate(`document.querySelector('dialog[open] .receipt-attachment-preview').getBoundingClientRect().width`), 80)
    const beforeTargets = new Set((await targets()).map(target => target.id))
    await evaluate(`document.querySelector('dialog[open] .receipt-attachment').focus()`); await key('Enter')
    let newTarget
    for (let i = 0; i < 100; i++) { newTarget = (await targets()).find(target => !beforeTargets.has(target.id) && target.type === 'page'); if (newTarget?.url === receipt.url) break; await sleep(100) }
    assert.equal(newTarget?.url, receipt.url, 'Clicking the receipt thumbnail must open that image in a new tab.')
    await cdp('Target.closeTarget', { targetId: newTarget.id }); await cdp('Page.bringToFront')
    await layout('Transaction details desktop'); await screenshot('transaction-details-desktop')
    await click('Confirm payment', true); await until(`document.querySelectorAll('dialog[open]').length===2`, 'A status change must require confirmation.')
    assert.equal(requests.filter(request => request.method === 'PUT').length, 0)
    await click('Confirm status change', true); await mutationReady()
    assert.equal(pending.path, '/api/admin/transaction/1'); assert.deepEqual(pending.body, { isAccepted: true })
    assert.equal(await status(), 'Pending', 'Status must remain pending before acknowledgement.')
    await key('Escape'); assert.equal(await evaluate(`document.querySelectorAll('dialog[open]').length`), 2)
    const writesBeforeDuplicate = requests.filter(request => request.method === 'PUT').length
    await evaluate(`[...document.querySelectorAll('dialog[open]')].at(-1).querySelector('.dialog-footer button:last-child').click()`)
    await sleep(100); assert.equal(requests.filter(request => request.method === 'PUT').length, writesBeforeDuplicate)
    reply(pending.res, null, 409, 'Backend refused the status update.'); pending = undefined
    await until(`[...document.querySelectorAll('[data-sonner-toast]')].some(toast=>toast.textContent.includes('Backend refused the status update.'))`, 'Status errors must show the exact backend message.')
    assert.equal(await status(), 'Pending')
    await clearToasts(); await click('Confirm status change', true); await mutationReady()
    Object.assign(records[0], { status: 'CONFIRMED', reviewedById: 1, reviewedBy: administrator, reviewedAt: '2026-11-19T10:00:00Z' })
    reply(pending.res, records[0]); pending = undefined
    await until(`document.querySelectorAll('dialog[open]').length===1&&!document.querySelector('dialog[open] .transaction-review-actions')`, 'Confirmed transactions must no longer offer pending review actions.')
    assert.equal(await status(), 'Confirmed')
    await clearToasts(); await close()
    await navigate('/admin/members/42?status=PENDING', `document.querySelector('.transaction-history tbody tr')`)
    await click('View'); await until(`document.querySelector('dialog[open] .payment-details-grid')`, 'Member transactions must load scoped details.')
    assert.ok(!(await evaluate(`document.querySelector('dialog[open]').textContent`)).includes('member@example.com'), 'Scoped transaction details must omit the selected user identity.')
    assert.ok(await evaluate(`![...document.querySelectorAll('dialog[open] dt')].some(label=>label.textContent==='Member')`))
    await until(`document.querySelector('dialog[open] .receipt-attachment-preview > svg')`, 'A PDF receipt must keep a clickable document fallback.')
    assert.equal(await evaluate(`document.querySelector('dialog[open] .receipt-attachment').getAttribute('href')`), '/receipt-preview-test.pdf')
    await click('Reject payment', true); await until(`document.querySelectorAll('dialog[open]').length===2`, 'Rejection must require confirmation.')
    assert.ok(!(await evaluate(`[...document.querySelectorAll('dialog[open]')].at(-1).textContent`)).includes('member@example.com'), 'Scoped status confirmation must also omit the selected user identity.')
    await click('Confirm status change', true); await mutationReady()
    assert.equal(pending.path, '/api/admin/user/42/transaction/2'); assert.deepEqual(pending.body, { isAccepted: false })
    Object.assign(records[1], { status: 'REJECTED', reviewedById: 1, reviewedBy: administrator, reviewedAt: '2026-11-19T10:00:00Z' })
    reply(pending.res, records[1]); pending = undefined
    await until(`document.querySelectorAll('dialog[open]').length===1&&!document.querySelector('dialog[open] .transaction-review-actions')`, 'Rejected transactions must stop offering review actions.')
    assert.equal(await status(), 'Rejected'); await clearToasts()
    for (const width of [960, 600, 320]) {
      await cdp('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false }); await settle(); await layout(`Scoped transaction details ${width}px`)
    }
    await screenshot('transaction-details-scoped-320')
    await evaluate(`window.fontSizes=[...document.querySelectorAll('body *')].map(e=>[e,e.style.fontSize,parseFloat(getComputedStyle(e).fontSize)]);for(const[e,,size]of window.fontSizes)e.style.fontSize=(size*2)+'px'`)
    await layout('Transaction details 200% text'); await evaluate(`for(const[e,size]of window.fontSizes)e.style.fontSize=size`)
    for (const features of [[{ name: 'prefers-reduced-motion', value: 'reduce' }], [{ name: 'forced-colors', value: 'active' }]]) { await cdp('Emulation.setEmulatedMedia', { features }); await layout('Transaction details accessibility mode') }
    await cdp('Emulation.setEmulatedMedia', { features: [] }); await evaluate(`document.documentElement.dataset.theme='dark'`); await layout('Transaction details dark mode'); await close()
    await signIn('user')
    await navigate('/user/transactions?sort=oldest', `document.querySelector('.transaction-history tbody tr')`)
    await click('View'); await until(`document.querySelector('dialog[open] .payment-details-grid')`, 'Members must load their own transaction details.')
    assert.equal(await status(), 'Pending')
    assert.equal(await evaluate(`document.querySelector('dialog[open] .transaction-review-actions')`), null, 'Member accounts must not receive administrator status controls.')
    await close()
    await evaluate(`[...document.querySelectorAll('button')].find(button=>button.getAttribute('aria-label')==='View transaction 3').focus()`); await key('Enter')
    await until(`document.querySelector('dialog[open] .payment-details-grid')`, 'A transaction without a receipt must still open.')
    assert.equal(await evaluate(`document.querySelector('dialog[open] .receipt-attachment')`), null, 'Missing receipts must not create fake thumbnails or links.')
    await layout('Member details without a receipt 320px'); await close()
    const beforePreview = requests.length
    await navigate('/preview/admin/transactions', `document.querySelector('.transaction-history')`); await sleep(200); assert.equal(requests.length, beforePreview)
    console.log('Transaction details browser checks passed: wide responsive dialogs, actual thumbnail/new-tab opening, PDF/missing receipt handling, scoped identity omission, confirmed/rejected acknowledgements, exact backend error toasts, duplicate/busy guards, member permissions, keyboard, 320px/text/media checks and preview isolation. Live API/S3, actual browser zoom and screen readers were not tested.')
  }

  if (bankSettingsOnly) {
    let seed
    const signIn = async role => {
      profile = role === 'Admin' ? administrator : member
      const session = { user: { ...profile, role }, accessToken: 'bank-settings-' + role, refreshToken: 'test-refresh', expiresAt: Date.now() + 3600000 }
      if (seed) await cdp('Page.removeScriptToEvaluateOnNewDocument', { identifier: seed })
      seed = (await cdp('Page.addScriptToEvaluateOnNewDocument', { source: `localStorage.setItem('legacy-wealth-session',${JSON.stringify(JSON.stringify(session))});localStorage.setItem('legacy-wealth-theme','light')` })).identifier
    }
    await signIn('Admin')
    await cdp('Emulation.setDeviceMetricsOverride', { width: 1366, height: 900, deviceScaleFactor: 1, mobile: false })
    await navigate('/admin/bank-accounts', `document.querySelectorAll('.table-region tbody tr').length===10`)
    await click('Next'); await until(`document.querySelector('.pagination')?.textContent.includes('11–12 of 12')`, 'Bank accounts must use server pagination.')
    await click('Previous'); await until(`document.querySelector('.pagination')?.textContent.includes('1–10 of 12')`, 'Bank pagination must return to page one.')
    failRead = true; await click('Refresh'); await until(`document.querySelector('#product-main').textContent.includes('Showing the last loaded results')`, 'Failed bank refresh must retain results.')
    await click('Try again'); await until(`!document.querySelector('#product-main').textContent.includes('Showing the last loaded results')`, 'Bank refresh must recover.')
    await evaluate(`document.querySelectorAll('[data-sonner-toast] [data-close-button]').forEach(button=>button.click())`); await settle()
    await click('Add bank account'); await until(`document.querySelector('dialog[open] #bank-account-form')`, 'Bank creation form must open.')
    await click('Review details', true); await until(`document.querySelector('#bank-account-form [aria-invalid="true"]')===document.activeElement`, 'Invalid bank fields must receive focus.')
    await fillLabel('Bank name', 'New bank'); await fillLabel('Account name', 'Cooperative account'); await fillLabel('Account number', '0001234567')
    await click('Review details', true); await until(`document.querySelector('dialog[open] dl')`, 'Bank creation needs review.')
    await click('Create bank account', true); await mutationReady()
    assert.equal(pending.path, '/api/admin/bank'); assert.deepEqual(pending.body, { bankName: 'New bank', accountName: 'Cooperative account', accountNumber: '0001234567' })
    await key('Escape'); assert.ok(await evaluate(`!!document.querySelector('dialog[open]')`), 'Pending bank creation must block Escape.')
    const before = requests.filter(request => request.method === 'POST' && request.path === '/api/admin/bank').length
    await evaluate(`document.querySelector('dialog[open] .dialog-footer button:last-child').click()`)
    assert.equal(requests.filter(request => request.method === 'POST' && request.path === '/api/admin/bank').length, before)
    reply(pending.res, null, 409, 'Bank Account Already Exist'); pending = undefined
    await until(`document.querySelector('[data-sonner-toast]')?.textContent.includes('Bank Account Already Exist')`, 'Backend bank errors must remain unchanged.')
    assert.ok(await evaluate(`document.querySelector('dialog[open] dl').textContent.includes('0001234567')`), 'Failed bank writes must retain leading zeros.')
    await evaluate(`document.querySelectorAll('[data-sonner-toast] [data-close-button]').forEach(button=>button.click())`); await settle()
    await click('Create bank account', true); await mutationReady()
    const created = { ...pending.body, id: 99, isActive: true }; bankRows.unshift(created); reply(pending.res, created); pending = undefined
    await until(`!document.querySelector('dialog[open]')&&document.querySelector('.table-region tbody')?.textContent.includes('0001234567')`, 'Acknowledged banks must refresh the list.')
    for (const width of [960, 600, 320]) { await cdp('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false }); await layout('Bank list ' + width) }
    await screenshot('bank-accounts-connected-320')
    for (const role of ['user', 'Admin']) {
      await signIn(role)
      const base = role === 'user' ? '/user' : '/admin'
      await navigate(base + '/settings', `document.querySelector('input[name="oldPassword"]')`)
      assert.ok(await evaluate(`!!document.querySelector('header button[aria-label="Sign out"]')`))
      assert.equal(await evaluate(`document.querySelector('footer').textContent.includes('Sign out')`), false)
      const visibility = await evaluate(`(()=>{const input=document.querySelector('input[name="oldPassword"]'),button=document.querySelector('button[aria-label="Show current password"]'),i=input.getBoundingClientRect(),b=button.getBoundingClientRect();return{inside:b.left>=i.left&&b.right<=i.right&&b.top>=i.top&&b.bottom<=i.bottom,width:b.width,height:b.height}})()`)
      assert.ok(visibility.inside && visibility.width >= 44 && visibility.height >= 44, 'Password visibility controls must stay within the field with full targets.')
      await click('Update password'); await until(`document.activeElement.name==='oldPassword'`, 'Password validation must focus the first field.')
      await fill('input[name="oldPassword"]', ' old password '); await fill('input[name="newPassword"]', ' new password '); await fill('input[name="confirmPassword"]', 'different')
      await click('Update password'); await until(`document.activeElement.name==='confirmPassword'`, 'Password mismatch must receive focus.')
      await fill('input[name="confirmPassword"]', ' new password ')
      await click('Update password'); await mutationReady()
      assert.equal(pending.path, '/api/setting/password'); assert.deepEqual(pending.body, { oldPassword: ' old password ', newPassword: ' new password ' })
      const writes = requests.filter(request => request.path === '/api/setting/password').length
      await evaluate(`document.querySelector('input[name="oldPassword"]').closest('form').querySelector('button[type="submit"]').click()`)
      assert.equal(requests.filter(request => request.path === '/api/setting/password').length, writes)
      reply(pending.res, null, 400, 'Incorrect Password'); pending = undefined
      await until(`!document.querySelector('form[aria-busy="true"]')`, 'Password errors must release the form.')
      assert.equal(await evaluate(`document.querySelector('input[name="oldPassword"]').value`), ' old password ')
      await evaluate(`document.querySelectorAll('[data-sonner-toast] [data-close-button]').forEach(button=>button.click())`); await settle()
      await click('Update password'); await mutationReady(); reply(pending.res, null); pending = undefined
      await until(`document.querySelector('input[name="newPassword"]').value===''`, 'Acknowledged password change must clear credentials.')
      assert.equal(await evaluate(`JSON.parse(localStorage.getItem('legacy-wealth-session')).accessToken`), 'bank-settings-' + role)
      for (const width of [960, 600, 320]) { await cdp('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false }); await layout(role + ' settings ' + width) }
      await evaluate(`window.fontSizes=[...document.querySelectorAll('body *')].map(e=>[e,e.style.fontSize,parseFloat(getComputedStyle(e).fontSize)]);for(const[e,,size]of window.fontSizes)e.style.fontSize=(size*2)+'px'`)
      await layout(role + ' settings 200% text'); await evaluate(`for(const[e,size]of window.fontSizes)e.style.fontSize=size`)
      for (const features of [[{ name: 'prefers-reduced-motion', value: 'reduce' }], [{ name: 'forced-colors', value: 'active' }]]) { await cdp('Emulation.setEmulatedMedia', { features }); await layout(role + ' settings media') }
      await cdp('Emulation.setEmulatedMedia', { features: [] }); await evaluate(`document.documentElement.dataset.theme='dark'`); await layout(role + ' settings dark')
      const accountActions = await evaluate(`(()=>{const actions=document.querySelector('.settings-account-actions'),button=actions.querySelector('.settings-sign-out'),r=actions.getBoundingClientRect(),b=button.getBoundingClientRect();return{right:Math.abs(r.right-b.right)<1,danger:button.classList.contains('ui-button-danger'),roleIcon:!!actions.parentElement.querySelector('.detail-list dd svg')}})()`)
      assert.ok(accountActions.right && accountActions.danger && accountActions.roleIcon, 'Settings sign-out must align right with danger styling and a role icon.')
      await evaluate(`document.querySelector('.settings-account-actions').scrollIntoView({block:'center'})`)
      await screenshot(role + '-settings-password-320')
      await click('Sign out'); await until(`location.pathname==='/login'`, 'Settings sign-out must return to login.')
      assert.equal(await evaluate(`localStorage.getItem('legacy-wealth-session')`), null)
      await signIn(role)
      await navigate(base + '/home', `document.querySelector('header button[aria-label="Sign out"]')`)
      await evaluate(`document.querySelector('header button[aria-label="Sign out"]').focus()`); await key('Enter')
      await until(`location.pathname==='/login'`, 'Top-bar keyboard sign-out must return to login.')
    }
    await writeFile(directory + '/payment-receipt.png', await readFile(root + '/public/brand/legacy-tree.png'))
    for (const role of ['user', 'Admin']) {
      await signIn(role)
      const base = role === 'user' ? '/user' : '/admin'
      await navigate(base + '/transactions/new', `document.querySelector('select[name="bankAccountId"]:not(:disabled)')`)
      assert.equal(await evaluate(`document.querySelector('input[name="bankAccountId"]')`), null)
      if (role === 'Admin') {
        await until(`document.querySelector('select[name="memberId"]:not(:disabled)')`, 'Admin member lookup must load.')
        assert.equal(await evaluate(`document.querySelector('input[name="memberId"]')`), null)
        await fill('select[name="memberId"]', '42')
      } else assert.equal(await evaluate(`document.querySelector('[name="memberId"]')`), null)
      await fill('select[name="bankAccountId"]', '3'); await fill('input[name="amount"]', '80000.01')
      assert.ok(await evaluate(`document.querySelector('#product-main').textContent.includes('Cooperative account · 0012345678')`))
      for (const width of [960, 600, 320]) { await cdp('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false }); await layout(role + ' payment selectors ' + width) }
      await screenshot(role + '-payment-selectors-320')
      if (role === 'user') {
        const document = await cdp('DOM.getDocument'), result = await cdp('DOM.querySelector', { nodeId: document.root.nodeId, selector: 'input[name="receipt"]' })
        await cdp('DOM.setFileInputFiles', { nodeId: result.nodeId, files: [directory + '/payment-receipt.png'] })
        await until(`document.querySelector('#product-main').textContent.includes('File uploaded. Ready to save.')`, 'Receipt selection must finish upload before review.')
      }
      await click('Review transaction'); await until(`document.querySelector('dialog[open] dl')`, 'Selected payment must enter review.')
      assert.ok(await evaluate(`document.querySelector('dialog[open] dl').textContent.includes('Test bank · Cooperative account · 0012345678')`))
      assert.ok(!(await evaluate(`document.querySelector('dialog[open] dl').textContent`)).includes('Member ID'))
      await click(role === 'user' ? 'Submit transaction' : 'Create transaction', true); await mutationReady()
      assert.equal(pending.body.bankAccountId, 3); assert.equal(pending.body.amount, '8000001')
      if (role === 'Admin') assert.equal(pending.body.memberId, 42)
      else assert.equal(pending.body.memberId, undefined)
      const created = { ...records[0], ...pending.body, id: role === 'user' ? 601 : 602, userId: 42, status: role === 'user' ? 'PENDING' : 'CONFIRMED', source: role === 'user' ? 'User' : 'Admin', attachmentUrl: pending.body.attachmentUrl ?? null, period: pending.body.period + 'T00:00:00Z', reviewedById: role === 'user' ? null : 1, reviewedBy: role === 'user' ? null : administrator, reviewedAt: role === 'user' ? null : '2026-11-19T10:00:00Z' }
      delete created.memberId; records.unshift(created); reply(pending.res, created); pending = undefined
      await until(`location.pathname===${JSON.stringify(base + '/transactions')}`, 'Acknowledged selected payment must return to history.')
    }
    const beforePreview = requests.length
    await navigate('/preview/admin/bank-accounts', `document.querySelector('#product-main')?.textContent.includes('Bank account layout preview')`)
    await click('Add bank account'); await fillLabel('Bank name', 'Preview bank'); await fillLabel('Account name', 'Preview account'); await fillLabel('Account number', '0012345678'); await click('Review details', true)
    assert.ok(await evaluate(`document.querySelector('dialog[open] .dialog-footer button:last-child').disabled`)); await close()
    await navigate('/preview/user/settings', `document.querySelector('input[name="oldPassword"]')`)
    assert.ok(await evaluate(`[...document.querySelectorAll('button')].find(button=>button.textContent.trim()==='Update password').disabled`))
    for (const path of ['/preview/user/transactions/new', '/preview/admin/transactions/new']) { await navigate(path, `document.querySelector('select[name="bankAccountId"]')`); assert.ok(await evaluate(`document.querySelector('select[name="bankAccountId"]').disabled`)) }
    await sleep(200); assert.equal(requests.length, beforePreview)
    console.log('Bank/password browser checks passed: pagination, creation review/acknowledgement, leading zeros, retries, pending guards, password confirmation/body/session retention, Settings sign-out, preview isolation, keyboard focus, 320px/text/themes/media. Live backend, browser zoom controls and screen readers were not tested.')
  }

} catch (error) {
  console.error('Browser failure state:', await failureState().catch(() => 'Browser state unavailable'))
  throw error
} finally {
  if (pendingUpload) reply(pendingUpload.res, null, 409)
  if (pending) reply(pending.res, null, 409)
  ws?.close(); chrome.kill('SIGTERM'); await server.close()
  await rm(directory, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 })
}
