import type { ComponentProps } from 'react'
import { Check, Info, TriangleAlert, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { StatusTone } from './badge'

const icons = { success: Check, warning: TriangleAlert, danger: X, info: Info }
export function Alert({ tone = 'info', title, children, className, role, ...props }: Omit<ComponentProps<'div'>, 'title'> & { tone?: Exclude<StatusTone, 'neutral'>; title: string }) {
  const Glyph = icons[tone]
  return <div data-slot="alert" className={cn('alert', `tone-${tone}`, className)} role={role} {...props}>
    <Glyph aria-hidden="true" /><div className="alert-body"><p className="alert-title">{title}</p>{children && <div>{children}</div>}</div>
  </div>
}
