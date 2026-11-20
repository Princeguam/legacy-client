import type { ProductContextValue } from '@/types/workspace'
import { createContext, useContext } from 'react'

export const productContext = createContext<ProductContextValue | null>(null)
export function useProduct() {
  const context = useContext(productContext)
  if (!context) throw new Error('Product pages require a product layout.')
  return context
}
