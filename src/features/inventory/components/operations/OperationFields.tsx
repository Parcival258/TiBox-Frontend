import { useId, useMemo, useState, type ReactNode } from 'react'
import { DateInput } from '@/shared/ui/DateInput'

export type SelectOption = {
  label: string
  searchText?: string
  value: string
}

export function OperationSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="border-t border-slate-800 pt-4">
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  )
}

export function Input({
  label,
  onChange,
  type = 'text',
  value,
}: {
  label: string
  onChange: (value: string) => void
  type?: string
  value: string
}) {
  if (type === 'date') {
    return <DateInput label={label} value={value} onChange={onChange} />
  }

  return (
    <label className="block text-sm">
      <span className="text-slate-500">{label}</span>
      <input
        className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 outline-none transition focus:border-cyan-500"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

export function Select({
  disabled,
  label,
  onChange,
  options,
  value,
}: {
  disabled?: boolean
  label: string
  onChange: (value: string) => void
  options: Array<{ label: string; value: string }>
  value: string
}) {
  return (
    <label className="block text-sm">
      <span className="text-slate-500">{label}</span>
      <select
        className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 outline-none transition focus:border-cyan-500 disabled:opacity-60"
        disabled={disabled}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Seleccionar</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export function SearchableSelect({
  disabled,
  label,
  onChange,
  options,
  placeholder,
  value,
}: {
  disabled?: boolean
  label: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  value: string
}) {
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
      .filter((option) => `${option.label} ${option.searchText ?? ''}`.toLowerCase().includes(normalizedQuery))
      .slice(0, 20)
  }, [options, query, selectedOption?.label])

  function selectOption(option: SelectOption) {
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
        className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-cyan-500 disabled:opacity-60"
        disabled={disabled}
        id={inputId}
        placeholder={placeholder}
        type="text"
        value={query}
        onChange={(event) => handleQueryChange(event.target.value)}
        onFocus={() => setIsOpen(true)}
      />
      {isOpen && !disabled && (
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

export function Textarea({
  label,
  onChange,
  value,
}: {
  label: string
  onChange: (value: string) => void
  value: string
}) {
  return (
    <label className="block text-sm">
      <span className="text-slate-500">{label}</span>
      <textarea
        className="mt-1 min-h-20 w-full resize-y rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 outline-none transition focus:border-cyan-500"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

export function SubmitButton({ children, disabled }: { children: ReactNode; disabled?: boolean }) {
  return (
    <button
      className="rounded-md border border-cyan-700 px-3 py-2 text-sm font-medium text-cyan-100 transition hover:border-cyan-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
      disabled={disabled}
      type="submit"
    >
      {children}
    </button>
  )
}
