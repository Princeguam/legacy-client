import type { UserRole } from '@/types/Auth'
import { ROUTES } from '@/constants/strings'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/useAuth'
import { isValidSession } from '@/services/authService'
import { roleHome } from '@/lib/role-home'

// Account access uses only the real session. Public page previews never set one.
// The backend must also authorize every protected API request when connected.
export function ProtectedRoute({ roles }: { roles?: UserRole[] }) {
  const { session } = useAuth()
  const location = useLocation()
  if (!isValidSession(session)) return <Navigate to={ROUTES.login} replace state={{ from: location.pathname }} />
  if (roles && !roles.includes(session.user.role)) return <Navigate to={roleHome(session.user.role)} replace />
  return <Outlet />
}
