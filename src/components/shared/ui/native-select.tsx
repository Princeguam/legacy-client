import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

// The design system explicitly prefers the platform picker for short lists.
export function NativeSelect({ className, ...props }: ComponentProps<'select'>) {
  return <select data-slot="native-select" className={cn('ui-input', className)} {...props} />
}
