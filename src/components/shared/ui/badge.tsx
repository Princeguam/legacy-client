import type { ComponentProps } from 'react'
import { Check, Circle, Info, TriangleAlert, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type StatusTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info'
const icons = { neutral: Circle, success: Check, warning: TriangleAlert, danger: X, info: Info }

export function Badge({ tone = 'neutral', icon = true, children, className, ...props }: ComponentProps<'span'> & { tone?: StatusTone; icon?: boolean }) {
  const Glyph = icons[tone]
  return <span data-slot="badge" className={cn('badge', `tone-${tone}`, className)} {...props}>{icon && <Glyph aria-hidden="true" />}{children}</span>
}
