import { createContext, useContext } from 'react'
import type { AuthUser, UserRole } from '@/services/authService'

export type ProductContextValue = { role: UserRole; preview: boolean; basePath: string; user: AuthUser | null }
export const productContext = createContext<ProductContextValue | null>(null)
export function useProduct() {
  const context = useContext(productContext)
  if (!context) throw new Error('Product pages require a product layout.')
  return context
}
