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

  return (
    <label className="block text-sm">
      <span className="text-slate-500">{label}</span>
      <input
        ref={inputRef}
        className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-cyan-500 disabled:opacity-60"
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
    </label>
  )
}
