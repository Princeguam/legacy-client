import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export function Textarea({ className, rows = 4, ...props }: ComponentProps<'textarea'>) {
  return <textarea data-slot="textarea" rows={rows} className={cn('ui-input ui-textarea', className)} {...props} />
}
