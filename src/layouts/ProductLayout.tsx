import { APP_NAME, COMMON_LABELS, PAGE_LABELS, PAGE_PATHS, ROUTES, THEMES, USER_ROLES } from '@/constants/strings'
import { CURRENT_YEAR } from '@/constants/values'
import type { AuthUser, UserRole } from '@/types/Auth'
import { workspacePath } from '@/lib/role-home'

import { Suspense, useEffect, useRef, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { LogOut, Menu, Sun, Moon, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { Sidebar } from '@/components/navigation/Sidebar/Sidebar'
import { PageLoader } from '@/components/shared/page-loader/PageLoader'
import { TransactionDraftsProvider } from '@/context/TransactionDraftsProvider'
import { Notifications } from '@/components/shared/product/Notifications'
import { getNavigation } from '@/components/navigation/Sidebar/navigation'
import { productContext } from '@/components/shared/product/product-context'
import { IconButton } from '@/components/shared/Button'
import { MobileNavigation } from '@/components/navigation/Sidebar/MobileNavigation'
import { Badge } from '@/components/shared/ui/badge'
import { useAuth } from '@/context/useAuth'
import { useTheme } from '@/hooks/useTheme'
import { AccountAvatar } from '@/components/shared/account-avatar/account-avatar'

import './ProductLayout.css'

export function ProductLayout({ role, preview = false }: { role: UserRole; preview?: boolean }) {
  const { session, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const mainRef = useRef<HTMLElement>(null)
  const previousPath = useRef(location.pathname)
  const basePath = workspacePath(role, preview)
  const previewUser: AuthUser = { id: `preview-${role}`, email: '', role }
  const user = preview ? previewUser : session?.user ?? null
  const currentPage = location.pathname === `${basePath}/${PAGE_PATHS.newFeedback}` ? PAGE_LABELS.newFeedback : location.pathname === `${basePath}/${PAGE_PATHS.addTransaction}` ? PAGE_LABELS.addTransaction : role === USER_ROLES.admin && location.pathname.startsWith(`${basePath}/${PAGE_PATHS.members}/`) ? PAGE_LABELS.memberDetails : getNavigation(role === USER_ROLES.admin).find(item => location.pathname === `${basePath}/${item.path}`)?.label ?? PAGE_LABELS.home
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || COMMON_LABELS.yourAccount
  useEffect(() => {
    document.title = `${currentPage} · ${APP_NAME}`
    if (previousPath.current !== location.pathname) mainRef.current?.focus()
    previousPath.current = location.pathname
  }, [currentPage, location.pathname])
  return <productContext.Provider value={{ role, preview, basePath, user }}><TransactionDraftsProvider key={`${basePath}:${user?.id ?? "anonymous"}`}><div className={`product-shell${collapsed ? ' sidebar-collapsed' : ''}`}>
    <a href="#product-main" className="skip-link">Skip to content</a><Sidebar />
    <div className="product-workspace"><header className="product-topbar"><div className="topbar-start"><span className="desktop-navigation-control"><IconButton className="sidebar-toggle" label={collapsed ? 'Expand navigation' : 'Collapse navigation'} aria-expanded={!collapsed} aria-controls="workspace-sidebar" onClick={() => setCollapsed(!collapsed)}>{collapsed ? <PanelLeftOpen aria-hidden="true" /> : <PanelLeftClose aria-hidden="true" />}</IconButton></span><span className="mobile-navigation-control"><IconButton label="Open navigation" aria-haspopup="dialog" aria-expanded={menuOpen} aria-controls="mobile-navigation-drawer" onClick={() => setMenuOpen(true)}><Menu aria-hidden="true" /></IconButton></span><div className="topbar-location"><span className="type-label">{role === USER_ROLES.admin ? COMMON_LABELS.cooperative : 'My workspace'}</span><span aria-hidden="true">/</span><span>{currentPage}</span></div></div>
      <div className="topbar-account"><IconButton label={theme === THEMES.light ? 'Use dark theme' : 'Use light theme'} onClick={toggleTheme}>{theme === THEMES.light ? <Moon aria-hidden="true" /> : <Sun aria-hidden="true" />}</IconButton><Notifications /><Link to={`${basePath}/${PAGE_PATHS.profile}`} className="account-link" aria-label={`${name} — view profile`}><AccountAvatar user={user} small /><span className="account-name type-label">{name}</span><span className="sr-only"> — view profile</span></Link>{!preview && <IconButton label={COMMON_LABELS.signOut} onClick={signOut}><LogOut aria-hidden="true" /></IconButton>}</div>
    </header>
    <div className="product-content">{preview && <div className="illustration-banner"><div><Badge icon={false}>{COMMON_LABELS.pagePreview}</Badge><p className="type-label">Layout preview. No account data or live activity.</p></div><Link className="standalone-link type-label" to={ROUTES.preview}>Switch workspace</Link></div>}
    <main id="product-main" ref={mainRef} tabIndex={-1} className="product-main"><Suspense key={location.pathname} fallback={<PageLoader />}><div className="page-entry"><Outlet /></div></Suspense></main>
    <footer className="product-footer"><span className="type-caption">© {CURRENT_YEAR} {APP_NAME}</span>{preview && <Link to={ROUTES.login} className="standalone-link type-label">{COMMON_LABELS.backToSignIn}</Link>}</footer></div></div>
    <MobileNavigation open={menuOpen} onOpenChange={setMenuOpen} />
  </div></TransactionDraftsProvider></productContext.Provider>
}
