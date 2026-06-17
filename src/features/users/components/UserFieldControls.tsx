type FieldOption = {
  label: string
  value: string
}

type InputProps = {
  label: string
  onChange: (value: string) => void
  required?: boolean
  type?: string
  value: string
}

type SelectProps = {
  emptyLabel?: string
  label: string
  onChange: (value: string) => void
  options: FieldOption[]
  value: string
}

type CheckboxProps = {
  checked: boolean
  label: string
  onChange: (value: boolean) => void
}

export function UserInput({ label, onChange, required, type = 'text', value }: InputProps) {
  return (
    <label className="block text-sm">
      <span className="text-slate-500">{label}</span>
      <input
        className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 outline-none transition focus:border-cyan-500"
        required={required}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

export function UserSelect({
  emptyLabel = 'Sin rol',
  label,
  onChange,
  options,
  value,
}: SelectProps) {
  return (
    <label className="block text-sm">
      <span className="text-slate-500">{label}</span>
      <select
        className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 outline-none transition focus:border-cyan-500"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">{emptyLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export function UserFilterSelect(props: SelectProps) {
  const { emptyLabel = 'Todos', label, onChange, options, value } = props

  return (
    <label className="block text-sm">
      <span className="text-slate-500">{label}</span>
      <select
        className="mt-1 h-10 w-full rounded-md border border-slate-700 bg-slate-950 px-3 text-sm text-slate-200 outline-none transition focus:border-cyan-500"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">{emptyLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export function UserCheckbox({ checked, label, onChange }: CheckboxProps) {
  return (
    <label className="flex items-center gap-2 self-end text-sm text-slate-300">
      <input
        checked={checked}
        className="h-4 w-4 accent-cyan-500"
        type="checkbox"
        onChange={(event) => onChange(event.target.checked)}
      />
      {label}
    </label>
  )
}
