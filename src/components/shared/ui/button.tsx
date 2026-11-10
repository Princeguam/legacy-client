import { useId, type ComponentProps } from 'react'
import { cn } from '@/lib/utils'
import { Tooltip } from './tooltip'

export type ButtonProps = ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  primaryAction?: boolean
}

// Locally owned shadcn/ui button, adapted to the approved native-button contract.
export function Button({ className, variant = 'primary', size = 'md', loading = false, disabled, primaryAction, children, type = 'button', onClick, ...props }: ButtonProps) {
  const busyId = useId()
  const busy = loading && !disabled
  return (
    <button {...props} type={type} disabled={disabled} aria-busy={busy || undefined} aria-disabled={busy || undefined}
      aria-describedby={[props['aria-describedby'], busy ? busyId : undefined].filter(Boolean).join(' ') || undefined}
      data-slot="button" data-primary-action={primaryAction || undefined}
      className={cn('ui-button', `ui-button-${variant}`, `ui-button-${size}`, className)}
      onClick={(event) => { if (busy) { event.preventDefault(); return } onClick?.(event) }}>
      <span className={cn('inline-flex items-center justify-center gap-2', busy && 'opacity-0')}>{children}</span>
      {busy && <><span className="button-busy" aria-hidden="true"><span className="busy-glyph" /></span><span id={busyId} className="sr-only">Processing. Please wait.</span></>}
    </button>
  )
}

export function IconButton({ label, children, className, ...props }: Omit<ButtonProps, 'size'> & { label: string }) {
  return <Tooltip content={label}><Button {...props} aria-label={label} variant={props.variant ?? 'ghost'} className={cn('ui-button-icon', className)}>{children}</Button></Tooltip>
}
