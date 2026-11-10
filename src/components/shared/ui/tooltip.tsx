import { cloneElement, useEffect, useId, useRef, useState, type ComponentProps, type ReactElement } from 'react'

export function Tooltip({ content, children }: { content: string; children: ReactElement<ComponentProps<'button'>> }) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const focused = useRef(false)
  const clearTimer = () => { if (timer.current) clearTimeout(timer.current) }
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])
  useEffect(() => {
    if (!open) return
    const dismiss = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', dismiss)
    return () => document.removeEventListener('keydown', dismiss)
  }, [open])
  return <span className="tooltip-anchor" onPointerEnter={() => { clearTimer(); timer.current = setTimeout(() => setOpen(true), 500) }} onPointerLeave={() => { clearTimer(); if (!focused.current) timer.current = setTimeout(() => setOpen(false), 100) }} onFocus={() => { focused.current = true; clearTimer(); setOpen(true) }} onBlur={() => { focused.current = false; clearTimer(); setOpen(false) }}>
    {cloneElement(children, { 'aria-describedby': [children.props['aria-describedby'], open ? id : undefined].filter(Boolean).join(' ') || undefined })}
    {open && <span id={id} role="tooltip" className="ui-tooltip">{content}</span>}
  </span>
}
