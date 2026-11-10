import type { UserRole } from '@/services/authService'

export const illustrationDate = '2026-11-10'
export const illustrationYear = 2026
export const annualTarget = 1_200_000
export const previewMemberId = 'LW-001'
export type Member = { id: string; firstName: string; lastName: string; email: string; phone: string; joined: string; status: 'Active' | 'Pending'; monthly: number }
export type Transaction = { id: string; memberId: string | null; scope: 'member' | 'cooperative'; description: string; date: string; type: 'Contribution' | 'Investment' | 'Expense'; amount: number; direction: 'in' | 'out'; status: 'Completed' | 'Pending'; reference: string }
export type Holding = { id: string; name: string; category: string; amount: number; note: string }
const people = [
  ['Samira', 'Yusuf', 80_000], ['Emeka', 'Okafor', 100_000], ['Tomi', 'Adeyemi', 75_000],
  ['Fatima', 'Bello', 60_000], ['David', 'Obi', 50_000], ['Amina', 'Ibrahim', 90_000],
  ['Chidi', 'Nwosu', 80_000], ['Zainab', 'Ali', 40_000], ['Kemi', 'Ojo', 70_000],
  ['Ife', 'Adebayo', 65_000], ['Ada', 'Eze', 0], ['Musa', 'Sani', 0],
] as const
export const members: Member[] = people.map(([firstName, lastName, monthly], index) => ({
  id: `LW-${String(index + 1).padStart(3, '0')}`, firstName, lastName, monthly,
  email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`, phone: '+234 800 000 0000',
  joined: monthly ? '2025-06-12' : '2026-11-08', status: monthly ? 'Active' : 'Pending',
}))
const contributions: Transaction[] = members.filter(member => member.status === 'Active').flatMap(member =>
  Array.from({ length: 11 }, (_, index) => ({
    id: `TX-${String(index + 1).padStart(2, '0')}-${member.id}`, memberId: member.id, scope: 'member' as const,
    description: `${new Intl.DateTimeFormat('en-NG', { month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(2026, index, 5)))} contribution`,
    date: `2026-${String(index + 1).padStart(2, '0')}-05`, type: 'Contribution' as const,
    amount: member.monthly, direction: 'in' as const, status: index < 10 ? 'Completed' as const : 'Pending' as const,
    reference: `LWC-2026${String(index + 1).padStart(2, '0')}-${member.id.slice(-3)}`,
  })))
export const personalHoldings: Holding[] = [
  { id: 'HF-01', name: 'Treasury fund', category: 'Fixed income', amount: 350_000, note: 'Your allocation to the cooperative treasury fund.' },
  { id: 'HF-02', name: 'Property fund', category: 'Real estate', amount: 200_000, note: 'Your allocation to the cooperative property fund.' },
  { id: 'HF-03', name: 'Enterprise fund', category: 'Business', amount: 100_000, note: 'Your allocation to the cooperative enterprise fund.' },
]
export const cooperativeHoldings: Holding[] = [
  { ...personalHoldings[0], amount: 2_800_000 }, { ...personalHoldings[1], amount: 1_400_000 }, { ...personalHoldings[2], amount: 700_000 },
]
const investments = (holdings: Holding[], scope: Transaction['scope']): Transaction[] => holdings.map((holding, index) => ({
  id: `${scope === 'member' ? 'MI' : 'CI'}-${holding.id}`, scope, memberId: scope === 'member' ? previewMemberId : null,
  description: `${holding.name} allocation`, date: `2026-10-${String(24 + index).padStart(2, '0')}`, type: 'Investment',
  amount: holding.amount, direction: 'out', status: 'Completed', reference: `LWC-${scope === 'member' ? 'MEM' : 'COOP'}-${holding.id}`,
}))
export const transactions: Transaction[] = ([
  ...contributions, ...investments(personalHoldings, 'member'), ...investments(cooperativeHoldings, 'cooperative'),
  { id: 'EX-001', memberId: null, scope: 'cooperative', description: 'Cooperative operating expenses', date: '2026-10-28', type: 'Expense', amount: 240_000, direction: 'out', status: 'Completed', reference: 'LWC-EXP-001' },
  { id: 'EX-002', memberId: null, scope: 'cooperative', description: 'Annual audit provision', date: '2026-11-09', type: 'Expense', amount: 90_000, direction: 'out', status: 'Pending', reference: 'LWC-EXP-002' },
] satisfies Transaction[]).sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id))
export function getTransactions(role: UserRole): Transaction[] {
  return transactions.filter(transaction => role === 'Admin' ? transaction.type === 'Contribution' || transaction.scope === 'cooperative' : transaction.scope === 'member' && transaction.memberId === previewMemberId)
}
export function getSummary(role: UserRole) {
  const rows = getTransactions(role).filter(transaction => transaction.status === 'Completed')
  const sum = (type: Transaction['type']) => rows.filter(row => row.type === type).reduce((total, row) => total + row.amount, 0)
  const contributed = sum('Contribution'), invested = sum('Investment'), expenses = sum('Expense')
  const target = annualTarget * (role === 'Admin' ? members.filter(member => member.status === 'Active').length : 1)
  return { contributed, invested, expenses, target, remaining: Math.max(0, target - contributed), cash: contributed - invested - expenses, wealth: contributed - expenses }
}
export function memberContributed(id: string) {
  return contributions.filter(row => row.memberId === id && row.status === 'Completed').reduce((total, row) => total + row.amount, 0)
}
export function contributionHistory(role: UserRole) {
  const rows = getTransactions(role).filter(row => row.type === 'Contribution' && row.status === 'Completed')
  let cumulative = 0
  return Array.from({ length: 10 }, (_, index) => {
    const month = `2026-${String(index + 1).padStart(2, '0')}`
    const amount = rows.filter(row => row.date.startsWith(month)).reduce((total, row) => total + row.amount, 0)
    cumulative += amount
    return { month, label: new Intl.DateTimeFormat('en-NG', { month: 'short', timeZone: 'UTC' }).format(new Date(`${month}-01T00:00:00Z`)), amount, cumulative }
  })
}
export type TransactionFilters = { query: string; status: string; type: string; start: string; end: string }
export function filterTransactions(rows: Transaction[], filters: TransactionFilters) {
  const query = filters.query.trim().toLowerCase()
  return rows.filter(row => (!query || `${row.description} ${row.reference} ${row.memberId ?? ''} ${members.find(member => member.id === row.memberId)?.firstName ?? ''} ${members.find(member => member.id === row.memberId)?.lastName ?? ''}`.toLowerCase().includes(query)) &&
    (!filters.status || row.status === filters.status) && (!filters.type || row.type === filters.type) &&
    (!filters.start || row.date >= filters.start) && (!filters.end || row.date <= filters.end))
}
export function formatDate(date: string, options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }) {
  return new Intl.DateTimeFormat('en-NG', { ...options, timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`))
}

export function getMemberTransactions(memberId: string) {
  return transactions.filter(row => row.scope === 'member' && row.memberId === memberId)
}
export function getMemberSummary(memberId: string) {
  const member = members.find(person => person.id === memberId)
  if (!member) return null
  const rows = getMemberTransactions(memberId)
  const contributed = memberContributed(memberId)
  const pending = rows.filter(row => row.type === 'Contribution' && row.status === 'Pending').reduce((sum, row) => sum + row.amount, 0)
  const target = member.status === 'Active' ? annualTarget : null
  // Only the supplied sample member has a known investment allocation.
  const invested = memberId === previewMemberId ? personalHoldings.reduce((sum, holding) => sum + holding.amount, 0) : null
  return { contributed, pending, target, remaining: target === null ? null : Math.max(0, target - contributed), invested, cash: invested === null ? null : contributed - invested }
}
