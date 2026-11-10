import { useId } from 'react'

export function RadioGroup({ label, name, value, options, disabled, onValueChange }: { label: string; name: string; value?: string; options: { value: string; label: string; disabled?: boolean }[]; disabled?: boolean; onValueChange: (value: string) => void }) {
  const id = useId()
  return <fieldset className="m-0 min-w-0 border-0 p-0" disabled={disabled}><legend className="ui-label mb-2">{label}</legend>
    {options.map((option) => <label key={option.value} className="choice-label" htmlFor={`${id}-${option.value}`}><span className="choice-target"><input id={`${id}-${option.value}`} type="radio" data-slot="radio-group-item" className="choice-input" name={name} value={option.value} checked={value === option.value} disabled={option.disabled} onChange={() => onValueChange(option.value)} /></span><span>{option.label}</span></label>)}
  </fieldset>
}
