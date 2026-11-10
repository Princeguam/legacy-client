export function PageLoader({ fullPage = false }: { fullPage?: boolean }) {
  return <div className={`route-loading logo-page-loader${fullPage ? ' full-page-loader' : ''}`} role="status" aria-live="polite">
    <span className="page-loader-tree" aria-hidden="true" />
    <span className="sr-only">Loading page. Please wait.</span>
  </div>
}
