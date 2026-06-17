import { useId, useMemo, useState, type ReactNode } from 'react'
import { DateInput } from '@/shared/ui/DateInput'

export type MaintenanceSelectOption = {
  label: string
  searchText?: string
  value: string
}

type FieldGroupProps = {
  children: ReactNode
  title: string
}

type InputProps = {
  label: string
  min?: string
  onChange: (value: string) => void
  required?: boolean
  type?: string
  value: string
}

type SelectProps = {
  label: string
  onChange: (value: string) => void
  options: MaintenanceSelectOption[]
  required?: boolean
  value: string
}

type SearchableSelectProps = SelectProps & {
  placeholder?: string
}

type TextareaProps = {
  label: string
  minHeightClassName?: string
  onChange: (value: string) => void
  value: string
}

export function MaintenanceFieldGroup({ children, title }: FieldGroupProps) {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      {children}
    </section>
  )
}

export function MaintenanceInput({
  label,
  min,
  onChange,
  required,
  type = 'text',
  value,
}: InputProps) {
  if (type === 'date') {
    return (
      <DateInput
        label={label}
        min={min}
        required={required}
        value={value}
        onChange={onChange}
      />
    )
  }

  return (
    <label className="block text-sm">
      <span className="text-slate-500">{label}</span>
      <input
        className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 outline-none transition focus:border-cyan-500"
        min={min}
        required={required}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

export function MaintenanceSelect({
  label,
  onChange,
  options,
  required,
  value,
}: SelectProps) {
  return (
    <label className="block text-sm">
      <span className="text-slate-500">{label}</span>
      <select
        className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 outline-none transition focus:border-cyan-500"
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Sin seleccionar</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export function MaintenanceSearchableSelect({
  label,
  onChange,
  options,
  placeholder,
  required,
  value,
}: SearchableSelectProps) {
  const inputId = useId()
  const selectedOption = options.find((option) => option.value === value)
  const [query, setQuery] = useState(selectedOption?.label ?? '')
  const [isOpen, setIsOpen] = useState(false)

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery || selectedOption?.label === query) {
      return options.slice(0, 20)
    }

    return options
      .filter((option) =>
        `${option.label} ${option.searchText ?? ''}`.toLowerCase().includes(normalizedQuery)
      )
      .slice(0, 20)
  }, [options, query, selectedOption?.label])

  function selectOption(option: MaintenanceSelectOption) {
    onChange(option.value)
    setQuery(option.label)
    setIsOpen(false)
  }

  function handleQueryChange(nextQuery: string) {
    setQuery(nextQuery)
    setIsOpen(true)

    if (value) {
      onChange('')
    }
  }

  return (
    <div
      className="relative text-sm"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsOpen(false)
          setQuery(selectedOption?.label ?? '')
        }
      }}
    >
      <label className="text-slate-500" htmlFor={inputId}>
        {label}
      </label>
      <input
        autoComplete="off"
        className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-cyan-500"
        id={inputId}
        placeholder={placeholder}
        required={required}
        type="text"
        value={query}
        onChange={(event) => handleQueryChange(event.target.value)}
        onFocus={() => setIsOpen(true)}
      />
      {isOpen && (
        <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-slate-700 bg-slate-950 shadow-xl">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <button
                className="block w-full px-3 py-2 text-left text-sm text-slate-200 transition hover:bg-slate-800 focus:bg-slate-800 focus:outline-none"
                key={option.value}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectOption(option)}
              >
                {option.label}
              </button>
            ))
          ) : (
            <p className="px-3 py-2 text-sm text-slate-500">Sin resultados</p>
          )}
        </div>
      )}
    </div>
  )
}

export function MaintenanceTextarea({
  label,
  minHeightClassName = 'min-h-28',
  onChange,
  value,
}: TextareaProps) {
  return (
    <label className="block text-sm">
      <span className="text-slate-500">{label}</span>
      <textarea
        className={`mt-1 w-full resize-y rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 outline-none transition focus:border-cyan-500 ${minHeightClassName}`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}
