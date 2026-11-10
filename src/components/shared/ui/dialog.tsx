import { useEffect, useId, useRef, type ReactNode } from 'react'
import { Button } from './button'

// Native modal adapter: the browser makes the background inert and traps focus.
export function Dialog({ open, onOpenChange, title, description, children, footer, busy = false }: { open: boolean; onOpenChange: (open: boolean) => void; title: string; description: string; children?: ReactNode; footer?: ReactNode; busy?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const titleId = useId(), descriptionId = useId()
  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) { dialog.showModal(); closeRef.current?.focus() }
    if (!open && dialog.open) dialog.close()
  }, [open])
  return <dialog ref={ref} className="ui-dialog" data-slot="dialog-content" aria-modal={open || undefined} aria-labelledby={titleId} aria-describedby={descriptionId} aria-busy={busy || undefined}
    onCancel={(event) => { event.preventDefault(); if (!busy) onOpenChange(false) }}
    onClose={() => { if (open) onOpenChange(false) }}
    onClick={(event) => { if (event.target !== event.currentTarget) return; const bounds = event.currentTarget.getBoundingClientRect(); if (!busy && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) onOpenChange(false) }}>
    <div className="dialog-layout"><h2 id={titleId} className="type-heading">{title}</h2><p id={descriptionId}>{description}</p>
      <div className="dialog-body">{children}</div>
      {busy && <p role="status">Processing. Keep this review open until the request finishes.</p>}
      <div className="dialog-footer"><Button ref={closeRef} variant="secondary" disabled={busy} onClick={() => onOpenChange(false)}>Cancel</Button>{footer}</div>
    </div>
  </dialog>
}
