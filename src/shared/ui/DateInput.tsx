import { useEffect, useRef, useState } from 'react'
import { displayDateToIso } from '@/shared/utils/dateFormat'

type DateInputProps = {
  disabled?: boolean
  label: string
  min?: string
  onChange: (value: string) => void
  required?: boolean
  value: string
}

function isoToDisplay(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/)
  return match ? `${match[3]}/${match[2]}/${match[1]}` : ''
}

function maskDate(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

export function DateInput({ disabled, label, min, onChange, required, value }: DateInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const pickerRef = useRef<HTMLInputElement>(null)
  const focusedRef = useRef(false)
  const [displayValue, setDisplayValue] = useState(() => isoToDisplay(value))

  useEffect(() => {
    if (!focusedRef.current) {
      setDisplayValue(isoToDisplay(value))
    }
  }, [value])

  function validate(nextDisplayValue: string) {
    if (!nextDisplayValue) {
      inputRef.current?.setCustomValidity(required ? 'Ingresa una fecha.' : '')
      return ''
    }

    const isoDate = displayDateToIso(nextDisplayValue)
    const error = !isoDate
      ? 'Usa el formato DD/MM/AAAA e ingresa una fecha valida.'
      : min && isoDate < min
        ? `La fecha debe ser igual o posterior a ${isoToDisplay(min)}.`
        : ''

    inputRef.current?.setCustomValidity(error)
    return error ? '' : (isoDate ?? '')
  }

  function openDatePicker() {
    pickerRef.current?.showPicker?.()
    pickerRef.current?.focus()
  }

  return (
    <label className="block text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="relative mt-1 block">
        <input
          ref={inputRef}
          className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 pr-12 text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-cyan-500 disabled:opacity-60"
          disabled={disabled}
          inputMode="numeric"
          maxLength={10}
          pattern="[0-9]{2}/[0-9]{2}/[0-9]{4}"
          placeholder="DD/MM/AAAA"
          required={required}
          type="text"
          value={displayValue}
          onBlur={() => {
            focusedRef.current = false
            setDisplayValue(isoToDisplay(value))
          }}
          onChange={(event) => {
            const nextDisplayValue = maskDate(event.target.value)
            setDisplayValue(nextDisplayValue)
            onChange(validate(nextDisplayValue))
          }}
          onFocus={() => {
            focusedRef.current = true
            validate(displayValue)
          }}
        />
        <input
          ref={pickerRef}
          aria-label={`Seleccionar ${label.toLowerCase()}`}
          className="sr-only"
          disabled={disabled}
          min={min}
          tabIndex={-1}
          type="date"
          value={value}
          onChange={(event) => {
            const nextValue = event.target.value
            setDisplayValue(isoToDisplay(nextValue))
            onChange(nextValue)
          }}
        />
        <button
          aria-label={`Abrir calendario para ${label.toLowerCase()}`}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-md text-slate-400 transition hover:text-cyan-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={disabled}
          type="button"
          onClick={openDatePicker}
        >
          <svg
            aria-hidden="true"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M8 2v4" />
            <path d="M16 2v4" />
            <rect height="18" rx="2" width="18" x="3" y="4" />
            <path d="M3 10h18" />
          </svg>
        </button>
      </span>
    </label>
  )
}
