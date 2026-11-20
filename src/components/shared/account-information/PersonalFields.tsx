import { COMMON_LABELS, MEMBER_CONTACT_LABELS } from '@/constants/strings'
import type { ProfileFormErrors, ProfileFormValues } from '@/types/user'
import { Input } from '@/components/shared/ui/input'
import { FormField } from '@/components/shared/form-field/form-field'
import { localToday } from '@/lib/transaction-drafts'

const editorFields = [
  { name: 'firstName', label: COMMON_LABELS.firstName, type: 'text', autoComplete: 'given-name', required: true },
  { name: 'middleName', label: COMMON_LABELS.middleName, type: 'text', autoComplete: 'additional-name', required: false },
  { name: 'lastName', label: COMMON_LABELS.lastName, type: 'text', autoComplete: 'family-name', required: true },
  { name: 'dob', label: COMMON_LABELS.dob, type: 'date', autoComplete: 'bday', required: false },
  { name: 'email', label: COMMON_LABELS.emailAddress, type: 'email', autoComplete: 'email', required: true },
  { name: 'phoneNo', label: COMMON_LABELS.phoneNumber, type: 'tel', autoComplete: 'tel', required: true },
  { name: 'address', label: COMMON_LABELS.address, type: 'text', autoComplete: 'street-address', required: false },
  { name: 'state', label: COMMON_LABELS.state, type: 'text', autoComplete: 'address-level1', required: false },
  { name: 'lga', label: COMMON_LABELS.lga, type: 'text', autoComplete: 'address-level2', required: false },
  { name: 'gender', label: COMMON_LABELS.gender, type: 'text', autoComplete: 'sex', required: false },
] as const

export function PersonalFields({ input, errors, onChange, readOnly = false, prefix = 'profile', autoComplete = true }: { input: ProfileFormValues; errors: ProfileFormErrors; onChange: (field: keyof ProfileFormValues, value: string) => void; readOnly?: boolean; prefix?: string; autoComplete?: boolean }) {
  return <><div className="form-grid">{editorFields.map(field => <FormField key={field.name} id={prefix + '-' + field.name} label={field.label} error={errors[field.name]}>{bindings => <Input {...bindings} name={field.name} required={field.required} type={field.type} autoComplete={autoComplete ? field.autoComplete : 'off'} max={field.name === 'dob' ? localToday() : undefined} value={input[field.name]} readOnly={readOnly} onChange={event => onChange(field.name, event.target.value)} />}</FormField>)}</div>
    <h3 className="type-title">Occupation and contacts</h3><div className="form-grid">{(Object.entries(MEMBER_CONTACT_LABELS) as [keyof typeof MEMBER_CONTACT_LABELS, string][]).map(([name, label]) => <FormField key={name} id={prefix + '-' + name} label={label} error={errors[name]}>{bindings => <Input {...bindings} name={name} type={name.endsWith('Phone') ? 'tel' : 'text'} autoComplete="off" value={input[name]} readOnly={readOnly} onChange={event => onChange(name, event.target.value)} />}</FormField>)}</div></>
}
