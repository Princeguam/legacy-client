import { Suspense, useEffect, useRef, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { LogOut, Menu, Sun, Moon, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { Sidebar } from '@/components/navigation/Sidebar/Sidebar'
import { PageLoader } from '@/components/shared/page-loader/PageLoader'
import { TransactionDraftsProvider } from '@/context/TransactionDraftsProvider'
import { Notifications } from '@/components/shared/product/Notifications'
import { getNavigation } from '@/components/navigation/Sidebar/navigation'
import { productContext } from '@/components/shared/product/product-context'
import { Button, IconButton } from '@/components/shared/Button'
import { MobileNavigation } from '@/components/navigation/Sidebar/MobileNavigation'
import { Badge } from '@/components/shared/ui/badge'
import { useAuth } from '@/context/useAuth'
import { useTheme } from '@/hooks/useTheme'
import { members, previewMemberId } from '@/lib/product-data'
import type { AuthUser, UserRole } from '@/services/authService'
import './ProductLayout.css'

export function ProductLayout({ role, preview = false }: { role: UserRole; preview?: boolean }) {
  const { session, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const mainRef = useRef<HTMLElement>(null)
  const previousPath = useRef(location.pathname)
  const basePath = `${preview ? '/preview' : ''}/${role === 'Admin' ? 'admin' : 'user'}`
  const member = members.find(person => person.id === previewMemberId)!
  const previewUser: AuthUser = role === 'Admin' ? { id: 'preview-admin', email: 'admin@example.com', firstName: 'Alex', lastName: 'Morgan', role } : { ...member, role }
  const user = preview ? previewUser : session?.user ?? null
  const currentPage = location.pathname === `${basePath}/transactions/new` ? 'Add transaction' : role === 'Admin' && location.pathname.startsWith(`${basePath}/members/`) ? 'Member details' : getNavigation(role === 'Admin').find(item => location.pathname === `${basePath}/${item.path}`)?.label ?? 'Home'
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || 'Your account'
  const initials = [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join('') || 'LW'
  useEffect(() => {
    document.title = `${currentPage} · Legacy Wealth Cooperatives`
    if (previousPath.current !== location.pathname) mainRef.current?.focus()
    previousPath.current = location.pathname
  }, [currentPage, location.pathname])
  return <productContext.Provider value={{ role, preview, basePath, user }}><TransactionDraftsProvider key={`${basePath}:${user?.id ?? "anonymous"}`}><div className={`product-shell${collapsed ? ' sidebar-collapsed' : ''}`}>
    <a href="#product-main" className="skip-link">Skip to content</a><Sidebar />
    <div className="product-workspace"><header className="product-topbar"><div className="topbar-start"><span className="desktop-navigation-control"><IconButton className="sidebar-toggle" label={collapsed ? 'Expand navigation' : 'Collapse navigation'} aria-expanded={!collapsed} aria-controls="workspace-sidebar" onClick={() => setCollapsed(!collapsed)}>{collapsed ? <PanelLeftOpen aria-hidden="true" /> : <PanelLeftClose aria-hidden="true" />}</IconButton></span><span className="mobile-navigation-control"><IconButton label="Open navigation" aria-haspopup="dialog" aria-expanded={menuOpen} aria-controls="mobile-navigation-drawer" onClick={() => setMenuOpen(true)}><Menu aria-hidden="true" /></IconButton></span><div className="topbar-location"><span className="type-label">{role === 'Admin' ? 'Cooperative' : 'My workspace'}</span><span aria-hidden="true">/</span><span>{currentPage}</span></div></div>
      <div className="topbar-account"><IconButton label={theme === 'light' ? 'Use dark theme' : 'Use light theme'} onClick={toggleTheme}>{theme === 'light' ? <Moon aria-hidden="true" /> : <Sun aria-hidden="true" />}</IconButton><Notifications /><Link to={`${basePath}/profile`} className="account-link" aria-label={`${name} — view profile`}><span className="avatar avatar-small" aria-hidden="true">{initials}</span><span className="account-name type-label">{name}</span><span className="sr-only"> — view profile</span></Link></div>
    </header>
    <div className="product-content"><div className="illustration-banner"><div><Badge icon={false}>{preview ? 'Page preview' : 'Illustrative data'}</Badge><p className="type-label">{preview ? 'Sample accounts and figures. No live account activity.' : 'Financial figures are illustrative. Account identity comes from your session.'}</p></div>{preview && <Link className="standalone-link type-label" to="/preview">Switch workspace</Link>}</div>
    <main id="product-main" ref={mainRef} tabIndex={-1} className="product-main"><Suspense key={location.pathname} fallback={<PageLoader />}><div className="page-entry"><Outlet /></div></Suspense></main>
    <footer className="product-footer"><span className="type-caption">© 2026 Legacy Wealth Cooperatives</span>{preview ? <Link to="/login" className="standalone-link type-label">Back to sign in</Link> : <Button variant="ghost" onClick={signOut}><LogOut aria-hidden="true" />Sign out</Button>}</footer></div></div>
    <MobileNavigation open={menuOpen} onOpenChange={setMenuOpen} />
  </div></TransactionDraftsProvider></productContext.Provider>
}
