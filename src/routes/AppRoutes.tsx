import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { PageLoader } from '@/components/shared/page-loader/PageLoader'
import { Login } from '@/pages/auth/Login'
import { useAuth } from '@/context/useAuth'
import { isValidSession } from '@/services/authService'
import { roleHome } from '@/lib/role-home'
import { ProtectedRoute } from './ProtectedRoute'
import { UserLayout } from '@/layouts/UserLayout'
import { AdminLayout } from '@/layouts/AdminLayout'

const DesignSystem = lazy(() => import('@/pages/DesignSystem').then(module => ({ default: module.DesignSystemPage })))
const Preview = lazy(() => import('@/pages/Preview').then(module => ({ default: module.Preview })))
const userPages = [
  { path: 'transactions/new', Page: lazy(() => import('@/pages/user/AddTransaction').then(module => ({ default: module.AddTransaction }))) },
  { path: 'home', Page: lazy(() => import('@/pages/user/Dashboard').then(module => ({ default: module.Dashboard }))) },
  { path: 'profile', Page: lazy(() => import('@/pages/user/Profile').then(module => ({ default: module.Profile }))) },
  { path: 'settings', Page: lazy(() => import('@/pages/user/Settings').then(module => ({ default: module.Settings }))) },
  { path: 'feedback', Page: lazy(() => import('@/pages/user/Feedback').then(module => ({ default: module.Feedback }))) },
  { path: 'transactions', Page: lazy(() => import('@/pages/user/Transactions').then(module => ({ default: module.Transactions }))) },
  { path: 'portfolio', Page: lazy(() => import('@/pages/user/Portfolio').then(module => ({ default: module.Portfolio }))) },
  { path: 'contributions', Page: lazy(() => import('@/pages/user/Contributions').then(module => ({ default: module.Contributions }))) },
]
const adminPages = [
  { path: 'home', Page: lazy(() => import('@/pages/admin/Dashboard').then(module => ({ default: module.Dashboard }))) },
  { path: 'profile', Page: lazy(() => import('@/pages/admin/Profile').then(module => ({ default: module.Profile }))) },
  { path: 'settings', Page: lazy(() => import('@/pages/admin/Settings').then(module => ({ default: module.Settings }))) },
  { path: 'feedback', Page: lazy(() => import('@/pages/admin/Feedback').then(module => ({ default: module.Feedback }))) },
  { path: 'members', Page: lazy(() => import('@/pages/admin/ManageUsers').then(module => ({ default: module.ManageUsers }))) },
  { path: 'members/:memberId', Page: lazy(() => import('@/pages/admin/MemberDetails').then(module => ({ default: module.MemberDetails }))) },
  { path: 'transactions', Page: lazy(() => import('@/pages/admin/Transactions').then(module => ({ default: module.Transactions }))) },
  { path: 'portfolio', Page: lazy(() => import('@/pages/admin/Portfolio').then(module => ({ default: module.Portfolio }))) },
  { path: 'contributions', Page: lazy(() => import('@/pages/admin/Contributions').then(module => ({ default: module.Contributions }))) },
]
function screenRoutes(pages: typeof userPages) {
  return <><Route index element={<Navigate to="home" replace />} />{pages.map(({ path, Page }) => <Route key={path} path={path} element={<Page />} />)}<Route path="dashboard" element={<Navigate to="../home" replace />} /><Route path="*" element={<Navigate to="../home" replace />} /></>
}
export function AppRoutes() {
  const { session } = useAuth()
  const home = isValidSession(session) ? roleHome(session.user.role) : '/login'
  return <Suspense fallback={<PageLoader fullPage />}><Routes>
    <Route path="/" element={<Navigate to={home} replace />} />
    <Route path="/login" element={isValidSession(session) ? <Navigate to={home} replace /> : <Login />} />
    <Route path="/design-system" element={<DesignSystem />} />
    <Route path="/preview" element={<Preview />} />
    <Route path="/preview/user" element={<UserLayout preview />}>{screenRoutes(userPages)}</Route>
    <Route path="/preview/admin" element={<AdminLayout preview />}>{screenRoutes(adminPages)}</Route>
    <Route element={<ProtectedRoute roles={['user']} />}><Route path="/user" element={<UserLayout />}>{screenRoutes(userPages)}</Route></Route>
    <Route element={<ProtectedRoute roles={['Admin']} />}><Route path="/admin" element={<AdminLayout />}>{screenRoutes(adminPages)}</Route></Route>
    <Route path="*" element={<Navigate to={home} replace />} />
  </Routes></Suspense>
}
