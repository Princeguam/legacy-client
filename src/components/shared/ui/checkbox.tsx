import { useEffect, useRef, type ComponentProps } from 'react'
import { Check, Minus } from 'lucide-react'

export function Checkbox({ label, indeterminate = false, ...props }: Omit<ComponentProps<'input'>, 'type'> & { label: string; indeterminate?: boolean }) {
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => { if (ref.current) ref.current.indeterminate = indeterminate }, [indeterminate])
  const Glyph = indeterminate ? Minus : Check
  return <label className="choice-label"><span className="choice-target"><input {...props} ref={ref} type="checkbox" data-slot="checkbox" className="choice-input" /><Glyph className="choice-mark" aria-hidden="true" /></span><span>{label}</span></label>
}
