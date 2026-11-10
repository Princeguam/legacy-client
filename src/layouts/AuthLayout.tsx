import type { ReactNode } from 'react'
import { BrandLogo } from '@/components/shared/brand-logo/brand-logo'
import './AuthLayout.css'

export function AuthLayout({ children }: { children: ReactNode }) {
  return <div className="auth-page" data-theme="light">
    <a className="skip-link" href="#login-main">Skip to sign in</a>
    <div className="auth-shell">
      <section className="auth-content" aria-label="Sign in to Legacy Wealth Cooperatives">
        <div className="auth-watermark" aria-hidden="true">
          <div className="auth-watermark-strip">
            <span className="auth-watermark-tree" />
            <span className="auth-watermark-tree" />
            <span className="auth-watermark-tree" />
            <span className="auth-watermark-tree" />
          </div>
        </div>
        <header className="auth-header"><BrandLogo /></header>
        <main id="login-main" className="auth-main" tabIndex={-1}>{children}</main>
        <footer className="auth-footer"><p className="type-caption">© {new Date().getFullYear()} Legacy Wealth Cooperatives</p></footer>
      </section>
      <aside className="auth-brand-panel" aria-label="Legacy Wealth Cooperatives">
        <img className="auth-hand-illustration" src="/illustrations/login-hand.svg" alt="" aria-hidden="true" width={700} height={446} />
      </aside>
    </div>
  </div>
}
