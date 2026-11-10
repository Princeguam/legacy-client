import { NavLink } from 'react-router-dom'
import { getNavigation } from './navigation'
import { BrandLogo } from '@/components/shared/brand-logo/brand-logo'
import { useProduct } from '@/components/shared/product/product-context'

export function NavigationLinks({ mobile = false, section = 'all', onNavigate }: { mobile?: boolean; section?: 'all' | 'main' | 'utility'; onNavigate?: () => void }) {
  const { role, basePath } = useProduct()
  return getNavigation(role === 'Admin').filter(item => section === 'all' || (section === 'utility' ? item.section === 'utility' : item.section !== 'utility')).map(({ path, label, icon: Icon }) => <NavLink key={path} to={`${basePath}/${path}`} className={mobile ? 'mobile-menu-link' : 'sidebar-link'} onClick={onNavigate}>
    <Icon size={20} aria-hidden="true" /><span>{label}</span>
  </NavLink>)
}
export function Sidebar() {
  const { role } = useProduct()
  return <aside id="workspace-sidebar" className="product-sidebar"><div className="sidebar-brand"><BrandLogo /></div><p className="sidebar-heading type-caption">{role === 'Admin' ? 'Cooperative workspace' : 'Member workspace'}</p>
    <nav aria-label="Main navigation" className="sidebar-nav"><NavigationLinks section="main" /></nav>
    <nav aria-label="Preferences and feedback" className="sidebar-nav sidebar-utility"><NavigationLinks section="utility" /></nav>
  </aside>
}
