import { useEffect, useId, useRef } from 'react'
import { X } from 'lucide-react'
import { IconButton } from '@/components/shared/Button'
import { BrandLogo } from '@/components/shared/brand-logo/brand-logo'
import { NavigationLinks } from './Sidebar'

export function MobileNavigation({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const titleId = useId(), descriptionId = useId()
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) { dialog.showModal(); closeRef.current?.focus() }
    if (!open && dialog.open) dialog.close()
  }, [open])
  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previousOverflow }
  }, [open])
  useEffect(() => {
    if (!open || typeof window.matchMedia !== 'function') return
    const desktop = window.matchMedia('(min-width: 960px)')
    const closeOnDesktop = () => { if (desktop.matches) onOpenChange(false) }
    closeOnDesktop()
    desktop.addEventListener('change', closeOnDesktop)
    return () => desktop.removeEventListener('change', closeOnDesktop)
  }, [open, onOpenChange])
  return <dialog ref={dialogRef} id="mobile-navigation-drawer" className="mobile-navigation-drawer" aria-modal={open || undefined} aria-labelledby={titleId} aria-describedby={descriptionId}
    onCancel={event => { event.preventDefault(); onOpenChange(false) }}
    onClose={() => { if (open) onOpenChange(false) }}
    onClick={event => {
      if (event.target !== event.currentTarget) return
      const bounds = event.currentTarget.getBoundingClientRect()
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onOpenChange(false)
    }}>
    <div className="mobile-drawer-header"><h2 id={titleId} className="type-title">Navigation</h2><IconButton ref={closeRef} label="Close navigation" onClick={() => onOpenChange(false)}><X aria-hidden="true" /></IconButton></div>
    <p id={descriptionId} className="sr-only">Choose a page in your cooperative workspace.</p>
    <div className="mobile-drawer-brand"><BrandLogo /></div>
    <nav aria-label="Mobile navigation" className="mobile-menu"><NavigationLinks mobile section="main" onNavigate={() => onOpenChange(false)} /></nav>
    <nav aria-label="Mobile preferences and feedback" className="mobile-menu mobile-drawer-utility"><NavigationLinks mobile section="utility" onNavigate={() => onOpenChange(false)} /></nav>
  </dialog>
}
