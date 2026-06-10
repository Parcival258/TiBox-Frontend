import { useId, useMemo, useState, type FormEvent } from 'react'
import type {
  CreateEquipmentLoanPayload,
  Equipment,
  EquipmentCatalogs,
  EquipmentLoan,
  ReturnEquipmentLoanPayload,
} from '../types/inventory'
import type { ModuleState } from '../types/ui'

type EquipmentLoansPageProps = {
  canCreate: boolean
  canReturn: boolean
  catalogs: EquipmentCatalogs | null
  equipment: Equipment[]
  loans: EquipmentLoan[]
  status: ModuleState
  onCreateLoan: (payload: CreateEquipmentLoanPayload) => Promise<void>
  onReturnLoan: (loanId: string, payload: ReturnEquipmentLoanPayload) => Promise<void>
}

type SearchableOption = {
  label: string
  searchText: string
  value: string
}

const statusStyles: Record<string, string> = {
  active: 'border-cyan-800 bg-cyan-950/40 text-cyan-200',
  overdue: 'border-red-800 bg-red-950/40 text-red-200',
  returned: 'border-emerald-800 bg-emerald-950/40 text-emerald-200',
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function formatDate(value: string | null | undefined) {
  if (!value) return 'Sin fecha'

  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function equipmentLabel(equipment: EquipmentLoan['equipment'] | Equipment) {
  const model = [equipment.brand, equipment.model].filter(Boolean).join(' ')

  return `${equipment.internalCode} / ${model || equipment.type}`
}

export function EquipmentLoansPage({
  canCreate,
  canReturn,
  catalogs,
  equipment,
  loans,
  status,
  onCreateLoan,
  onReturnLoan,
}: EquipmentLoansPageProps) {
  const [form, setForm] = useState({
    borrowerName: '',
    equipmentId: '',
    estimatedReturnAt: '',
    loanedAt: today(),
    notes: '',
    requestedAt: today(),
    requestedItem: '',
    requestMode: 'presencial',
    signatureImage: '',
    userId: '',
  })
  const [returningLoan, setReturningLoan] = useState<EquipmentLoan | null>(null)
  const [returnNotes, setReturnNotes] = useState('')
  const [receivedSignatureImage, setReceivedSignatureImage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasError, setHasError] = useState(false)

  const activeLoans = loans.filter((loan) => loan.status === 'active' || loan.status === 'overdue')
  const overdueCount = activeLoans.filter((loan) => loan.status === 'overdue').length

  async function handleCreate(event: FormEvent) {
    event.preventDefault()
    setIsSubmitting(true)
    setHasError(false)

    try {
      await onCreateLoan({
        borrowerName: form.userId ? undefined : form.borrowerName || undefined,
        equipmentId: form.equipmentId,
        estimatedReturnAt: form.estimatedReturnAt,
        loanedAt: form.loanedAt || undefined,
        notes: form.notes || undefined,
        requestedAt: form.requestedAt || undefined,
        requestedItem: form.requestedItem,
        requestMode: form.requestMode || undefined,
        signatureImage: form.signatureImage || undefined,
        userId: form.userId || undefined,
      })
      setForm({
        borrowerName: '',
        equipmentId: '',
        estimatedReturnAt: '',
        loanedAt: today(),
        notes: '',
        requestedAt: today(),
        requestedItem: '',
        requestMode: 'presencial',
        signatureImage: '',
        userId: '',
      })
    } catch {
      setHasError(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleReturn(event: FormEvent) {
    event.preventDefault()

    if (!returningLoan) return

    setIsSubmitting(true)
    setHasError(false)

    try {
      await onReturnLoan(returningLoan.id, {
        notes: returnNotes || undefined,
        receivedSignatureImage: receivedSignatureImage || undefined,
        returnedAt: today(),
      })
      setReturningLoan(null)
      setReturnNotes('')
      setReceivedSignatureImage('')
    } catch {
      setHasError(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="grid flex-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="rounded-lg border border-slate-800 bg-slate-900">
        <div className="flex flex-col gap-3 border-b border-slate-800 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-medium text-white">Prestamos de equipos</h2>
            <p className="mt-1 text-sm text-slate-400">
              {activeLoans.length} activos / {overdueCount} vencidos
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <Metric label="Activos" value={activeLoans.length} />
            <Metric label="Vencidos" value={overdueCount} />
            <Metric label="Historico" value={loans.length} />
          </div>
        </div>

        {status === 'loading' ? (
          <div className="px-4 py-12 text-center text-sm text-slate-400">Cargando prestamos...</div>
        ) : status === 'error' ? (
          <div className="px-4 py-12 text-center text-sm text-red-200">
            No fue posible cargar los prestamos.
          </div>
        ) : loans.length === 0 ? (
          <div className="px-4 py-12 text-center text-sm text-slate-400">
            No hay prestamos registrados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="bg-slate-950 text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Equipo</th>
                  <th className="px-4 py-3 font-medium">Solicitante</th>
                  <th className="px-4 py-3 font-medium">Solicitud</th>
                  <th className="px-4 py-3 font-medium">Prestamo</th>
                  <th className="px-4 py-3 font-medium">Devolucion estimada</th>
                  <th className="px-4 py-3 font-medium">Modo</th>
                  <th className="px-4 py-3 font-medium">Accion</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan) => (
                  <tr key={loan.id} className="border-t border-slate-800">
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${
                          statusStyles[loan.status] ?? 'border-slate-700 bg-slate-950 text-slate-300'
                        }`}
                      >
                        {loan.statusLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white">{equipmentLabel(loan.equipment)}</td>
                    <td className="px-4 py-3 text-slate-300">{loan.borrowerLabel}</td>
                    <td className="px-4 py-3 text-slate-300">{loan.requestedItem}</td>
                    <td className="px-4 py-3 text-slate-300">{formatDate(loan.loanedAt)}</td>
                    <td className="px-4 py-3 text-slate-300">{formatDate(loan.estimatedReturnAt)}</td>
                    <td className="px-4 py-3 text-slate-300">{loan.requestMode ?? 'Sin modo'}</td>
                    <td className="px-4 py-3">
                      {canReturn && !loan.returnedAt && loan.status !== 'returned' ? (
                        <button
                          className="rounded-md border border-emerald-700 px-3 py-1.5 text-sm font-medium text-emerald-100 transition hover:border-emerald-400 hover:text-white"
                          type="button"
                          onClick={() => setReturningLoan(loan)}
                        >
                          Recibir
                        </button>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <aside className="space-y-4 rounded-lg border border-slate-800 bg-slate-900 p-5">
        <div>
          <p className="text-xs uppercase tracking-wide text-cyan-300">Registro</p>
          <h3 className="mt-1 text-lg font-semibold text-white">Nuevo prestamo</h3>
        </div>

        {hasError && (
          <p className="rounded-md border border-red-900 bg-red-950/30 px-3 py-2 text-sm text-red-200">
            No fue posible guardar la operacion.
          </p>
        )}

        {canCreate ? (
          <form className="space-y-3" onSubmit={handleCreate}>
            <SearchableSelect
              label="Equipo"
              placeholder="Buscar por codigo, serial, marca o modelo"
              value={form.equipmentId}
              onChange={(equipmentId) => setForm((current) => ({ ...current, equipmentId }))}
              options={equipment.map((item) => ({
                label: equipmentLabel(item),
                searchText: [
                  item.internalCode,
                  item.assetTag,
                  item.serial,
                  item.type,
                  item.brand,
                  item.model,
                ]
                  .filter(Boolean)
                  .join(' '),
                value: item.id,
              }))}
            />
            <Select
              label="Usuario existente"
              value={form.userId}
              onChange={(userId) => setForm((current) => ({ ...current, borrowerName: '', userId }))}
              options={(catalogs?.responsibles ?? []).map((responsible) => ({
                label: responsible.name,
                value: responsible.id,
              }))}
            />
            <Input
              disabled={Boolean(form.userId)}
              label="Nombre libre"
              value={form.borrowerName}
              onChange={(borrowerName) => setForm((current) => ({ ...current, borrowerName }))}
            />
            <Input
              label="Que solicita"
              value={form.requestedItem}
              onChange={(requestedItem) => setForm((current) => ({ ...current, requestedItem }))}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Fecha solicitud"
                type="date"
                value={form.requestedAt}
                onChange={(requestedAt) => setForm((current) => ({ ...current, requestedAt }))}
              />
              <Input
                label="Fecha prestamo"
                type="date"
                value={form.loanedAt}
                onChange={(loanedAt) => setForm((current) => ({ ...current, loanedAt }))}
              />
            </div>
            <Input
              label="Devolucion estimada"
              type="date"
              value={form.estimatedReturnAt}
              onChange={(estimatedReturnAt) =>
                setForm((current) => ({ ...current, estimatedReturnAt }))
              }
            />
            <Select
              label="Modo"
              value={form.requestMode}
              onChange={(requestMode) => setForm((current) => ({ ...current, requestMode }))}
              options={[
                { label: 'Presencial', value: 'presencial' },
                { label: 'Correo', value: 'correo' },
                { label: 'WhatsApp', value: 'whatsapp' },
                { label: 'Otro', value: 'otro' },
              ]}
            />
            <Textarea
              label="Firma imagen"
              value={form.signatureImage}
              onChange={(signatureImage) => setForm((current) => ({ ...current, signatureImage }))}
            />
            <Textarea
              label="Observacion"
              value={form.notes}
              onChange={(notes) => setForm((current) => ({ ...current, notes }))}
            />
            <button
              className="rounded-md border border-cyan-700 px-3 py-2 text-sm font-medium text-cyan-100 transition hover:border-cyan-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              disabled={
                isSubmitting ||
                !form.equipmentId ||
                !form.requestedItem ||
                !form.estimatedReturnAt ||
                (!form.userId && !form.borrowerName)
              }
              type="submit"
            >
              {isSubmitting ? 'Guardando...' : 'Crear prestamo'}
            </button>
          </form>
        ) : (
          <p className="rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-400">
            Tu rol tiene acceso de consulta para los prestamos.
          </p>
        )}
      </aside>

      {returningLoan && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/80 px-4 py-6">
          <form
            className="w-full max-w-xl rounded-lg border border-slate-700 bg-slate-900 p-5 shadow-2xl"
            onSubmit={handleReturn}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-emerald-300">Recibir equipo</p>
                <h3 className="mt-1 text-lg font-semibold text-white">
                  {equipmentLabel(returningLoan.equipment)}
                </h3>
                <p className="mt-1 text-sm text-slate-400">{returningLoan.borrowerLabel}</p>
              </div>
              <button
                className="rounded-md border border-slate-700 px-2.5 py-1 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
                type="button"
                onClick={() => setReturningLoan(null)}
              >
                Cerrar
              </button>
            </div>
            <div className="mt-5 space-y-3">
              <Textarea
                label="Firma recibido"
                value={receivedSignatureImage}
                onChange={setReceivedSignatureImage}
              />
              <Textarea label="Observacion" value={returnNotes} onChange={setReturnNotes} />
            </div>
            <div className="mt-5 flex justify-end">
              <button
                className="rounded-md border border-emerald-700 px-4 py-2 text-sm font-medium text-emerald-100 transition hover:border-emerald-400 hover:text-white disabled:opacity-50"
                disabled={isSubmitting}
                type="submit"
              >
                Registrar devolucion
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-slate-800 bg-slate-950 px-3 py-2">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  )
}

function Input({
  disabled,
  label,
  onChange,
  type = 'text',
  value,
}: {
  disabled?: boolean
  label: string
  onChange: (value: string) => void
  type?: string
  value: string
}) {
  return (
    <label className="block text-sm">
      <span className="text-slate-500">{label}</span>
      <input
        className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 outline-none transition focus:border-cyan-500 disabled:opacity-60"
        disabled={disabled}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

function Select({
  label,
  onChange,
  options,
  value,
}: {
  label: string
  onChange: (value: string) => void
  options: Array<{ label: string; value: string }>
  value: string
}) {
  return (
    <label className="block text-sm">
      <span className="text-slate-500">{label}</span>
      <select
        className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 outline-none transition focus:border-cyan-500"
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

function SearchableSelect({
  label,
  onChange,
  options,
  placeholder,
  value,
}: {
  label: string
  onChange: (value: string) => void
  options: SearchableOption[]
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
      .filter((option) => `${option.label} ${option.searchText}`.toLowerCase().includes(normalizedQuery))
      .slice(0, 20)
  }, [options, query, selectedOption?.label])

  function selectOption(option: SearchableOption) {
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

function Textarea({
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
