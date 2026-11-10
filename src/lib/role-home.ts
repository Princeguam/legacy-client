import type { UserRole } from '@/services/authService'

export function roleHome(role: UserRole) {
  return role === 'Admin' ? '/admin/home' : '/user/home'
}
