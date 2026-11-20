import { useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { Toaster } from 'sonner'
import { TOAST_DURATION_MS } from '@/constants/values'
import './toast-notifications.css'

/** Native dialogs are a top layer: keep toasts visible and usable in the active dialog. */
export function ToastNotifications() {
    const container = useMemo(() => typeof document === 'undefined' ? null : document.createElement('div'), [])
    useEffect(() => {
        if (!container) return
        // Move the container without remounting Sonner, preserving active toasts on navigation.
        const move = () => {
            const target = [...document.querySelectorAll<HTMLDialogElement>('dialog[open]')].at(-1) ?? document.body
            if (container.parentElement !== target) target.append(container)
        }
        move()
        const observer = new MutationObserver(move)
        observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['open'] })
        return () => { observer.disconnect(); container.remove() }
    }, [container])
    return container ? createPortal(<Toaster className="app-toaster" position="bottom-right" expand closeButton duration={TOAST_DURATION_MS} offset={16} mobileOffset={16} toastOptions={{ unstyled: true, classNames: { toast: 'app-toast', title: 'type-label', closeButton: 'toast-close' } }} />, container) : null
}
