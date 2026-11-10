import { useId } from 'react'

export function Progress({ label, value = null, max = 100 }: { label: string; value?: number | null; max?: number }) {
  const id = useId()
  const safeMax = Number.isFinite(max) && max > 0 ? max : 100
  const safeValue = value !== null && Number.isFinite(value) ? Math.min(safeMax, Math.max(0, value)) : null
  const percent = safeValue === null ? null : Math.round(safeValue / safeMax * 100)
  return <div data-slot="progress">
    <div className="progress-label"><span id={id}>{label}</span><span>{percent === null ? 'In progress' : `${percent}%`}</span></div>
    <div className="progress-track" role="progressbar" aria-labelledby={id} aria-valuemin={0} aria-valuemax={safeMax} aria-valuenow={safeValue ?? undefined} aria-valuetext={percent === null ? 'In progress; progress is not yet known' : `${percent}%`}>
      {percent !== null && <div className="progress-fill" style={{ width: `${percent}%` }} />}
    </div>
  </div>
}
