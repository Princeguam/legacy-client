import { useEffect, useId } from 'react'
import { BrandLogo } from '@/components/shared/brand-logo/brand-logo'
import { APP_NAME, PAGE_AVAILABILITY_MESSAGES, PAGE_LABELS } from '@/constants/strings'
import './UnderConstruction.css'

type UnderConstructionProps = {
  /** Fill the viewport for the standalone preview; omit inside a workspace shell. */
  fullPage?: boolean
  title?: string
  description?: string
}

/** Reusable placeholder for pages whose live features are still being prepared. */
export function UnderConstruction({
  fullPage = false,
  title = PAGE_LABELS.underConstruction,
  description = PAGE_AVAILABILITY_MESSAGES.preparing,
}: UnderConstructionProps) {
  const headingId = useId()

  useEffect(() => {
    if (!fullPage) return
    const previousTitle = document.title
    document.title = `${title} · ${APP_NAME}`
    return () => { document.title = previousTitle }
  }, [fullPage, title])

  return (
    <section
      className={`under-construction-page${fullPage ? ' under-construction-full-page' : ''}`}
      aria-labelledby={headingId}
    >
      <div className="under-construction-content">
        {fullPage && <div className="under-construction-brand"><BrandLogo /></div>}
        <img
          className="under-construction-illustration"
          src="/illustrations/under-construction.svg"
          width={608}
          height={304}
          alt=""
        />
        <div className="under-construction-message">
          <h1 id={headingId} className="type-heading">{title}</h1>
          <div className="under-construction-description type-body">
            <p>{description}</p>
            <p>{PAGE_AVAILABILITY_MESSAGES.patience}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
