export function Switch({ label, checked, onCheckedChange, disabled, loading = false }: { label: string; checked: boolean; onCheckedChange: (value: boolean) => void; disabled?: boolean; loading?: boolean }) {
  const busy = loading && !disabled
  return <label className="choice-label"><span className="choice-target"><input type="checkbox" role="switch" data-slot="switch" className="switch-input" checked={checked} disabled={disabled} aria-busy={busy || undefined} aria-disabled={busy || undefined} onClick={(event) => { if (busy) event.preventDefault() }} onChange={(event) => { if (!busy) onCheckedChange(event.target.checked) }} /><span className="switch-thumb" /></span><span>{label}{busy && <span className="block field-hint">Saving. Please wait.</span>}</span></label>
}
