import { COMMON_LABELS } from '@/constants/strings'
import { useEffect, useId, useRef, type ReactNode } from 'react'
import { Button } from './button'
import './dialog.css'

// Native modal adapter with explicit keyboard wrapping and an inert background.
export function Dialog({ open, onOpenChange, title, description, children, footer, busy = false, className = '', size = 'default' }: { open: boolean; onOpenChange: (open: boolean) => void; title: string; description: string; children?: ReactNode; footer?: ReactNode; busy?: boolean; className?: string; size?: 'default' | 'wide' }) {
  const ref = useRef<HTMLDialogElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const titleId = useId(), descriptionId = useId()
  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) { dialog.showModal(); closeRef.current?.focus() }
    if (!open && dialog.open) dialog.close()
  }, [open])
  return <dialog ref={ref} className={`ui-dialog${size === 'wide' ? ' ui-dialog-wide' : ''} ${className}`} data-slot="dialog-content" aria-modal={open || undefined} aria-labelledby={titleId} aria-describedby={descriptionId} aria-busy={busy || undefined}
    onKeyDown={event => {
      if (event.target instanceof Element && event.target.closest('dialog') !== event.currentTarget) return
      if (busy && event.key === 'Escape') { event.preventDefault(); return }
      if (event.key !== 'Tab') return
      const controls = [...event.currentTarget.querySelectorAll<HTMLElement>('a[href], button, input, select, textarea, [tabindex], [contenteditable="true"]')]
        .filter(control => control.tabIndex >= 0 && !control.matches(':disabled') && control.getClientRects().length > 0)
      const first = controls[0], last = controls.at(-1)
      if (!first || !last) { event.preventDefault(); event.currentTarget.focus(); return }
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }}
    onCancel={(event) => { if (event.target !== event.currentTarget) return; event.preventDefault(); if (!busy) onOpenChange(false) }}
    onClose={event => { if (event.target === event.currentTarget && open) onOpenChange(false) }}
    onClick={(event) => { if (event.target !== event.currentTarget) return; const bounds = event.currentTarget.getBoundingClientRect(); if (!busy && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) onOpenChange(false) }}>
    <div className="dialog-layout"><h2 id={titleId} className="type-heading">{title}</h2><p id={descriptionId}>{description}</p>
      <div className="dialog-body">{children}</div>
      {busy && <p role="status">Processing. Keep this review open until the request finishes.</p>}
      <div className="dialog-footer"><Button ref={closeRef} variant="secondary" disabled={busy} onClick={() => onOpenChange(false)}>{COMMON_LABELS.cancel}</Button>{footer}</div>
    </div>
  </dialog>
}
