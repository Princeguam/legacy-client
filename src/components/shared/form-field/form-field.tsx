import { useId, type ReactNode } from 'react'
import { Label } from '../ui/label'

type FieldBindings = { id: string; 'aria-describedby'?: string; 'aria-invalid'?: true }
export function FormField({ id: providedId, label, hint, error, children }: { id?: string; label: string; hint?: string; error?: string; children: (bindings: FieldBindings) => ReactNode }) {
  const generatedId = useId()
  const id = providedId ?? generatedId
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined
  return <div className="field"><Label htmlFor={id}>{label}</Label>
    {children({ id, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined })}
    {hint && <p id={`${id}-hint`} className="field-hint">{hint}</p>}
    {error && <p id={`${id}-error`} className="field-hint field-error">{error}</p>}
  </div>
}
