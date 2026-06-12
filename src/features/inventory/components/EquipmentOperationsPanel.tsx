import { useId, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import type { EquipmentCatalogs, EquipmentLifeSheet } from '@/shared/types/inventory'
import { DateInput } from '@/shared/ui/DateInput'
import { SuccessNotice } from '@/shared/ui/SuccessNotice'

type EquipmentOperationsPanelProps = {
  canAssign: boolean
  canCreateFailure: boolean
  canCreateMaintenance: boolean
  canReturn: boolean
  canUploadAttachment: boolean
  catalogs: EquipmentCatalogs | null
  lifeSheet: EquipmentLifeSheet | null
  onAssign: (userId: string, notes?: string) => Promise<void>
  onCreateFailure: (payload: { title: string; description: string; priority: string }) => Promise<void>
  onCreateMaintenance: (payload: {
    actionsTaken?: string
    cost?: number
    description?: string
    diagnosis?: string
    maintenanceType: 'preventive' | 'corrective'
    nextMaintenanceAt?: string
    performedBy?: string
    priority: string
  }) => Promise<void>
  onReturn: (notes?: string) => Promise<void>
  onUploadAttachment: (file: File) => Promise<void>
  status: 'idle' | 'loading' | 'ready' | 'error'
}

type SubmitState = 'idle' | 'submitting' | 'error' | 'success'

type SelectOption = {
  label: string
  searchText?: string
  value: string
}

function responsibleSearchText(responsible: { email?: string; jobTitle?: string | null; name: string }) {
  return [responsible.name, responsible.email, responsible.jobTitle].filter(Boolean).join(' ')
}

export function EquipmentOperationsPanel({
  canAssign,
  canCreateFailure,
  canCreateMaintenance,
  canReturn,
  canUploadAttachment,
  catalogs,
  lifeSheet,
  onAssign,
  onCreateFailure,
  onCreateMaintenance,
  onReturn,
  onUploadAttachment,
  status,
}: EquipmentOperationsPanelProps) {
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [assignUserId, setAssignUserId] = useState('')
  const [assignNotes, setAssignNotes] = useState('')
  const [returnNotes, setReturnNotes] = useState('')
  const [failureTitle, setFailureTitle] = useState('')
  const [failureDescription, setFailureDescription] = useState('')
  const [failurePriority, setFailurePriority] = useState('medium')
  const [maintenanceType, setMaintenanceType] = useState<'preventive' | 'corrective'>('preventive')
  const [maintenancePriority, setMaintenancePriority] = useState('medium')
  const [maintenanceTechnicianId, setMaintenanceTechnicianId] = useState('')
  const [maintenanceDescription, setMaintenanceDescription] = useState('')
  const [maintenanceDiagnosis, setMaintenanceDiagnosis] = useState('')
  const [maintenanceActions, setMaintenanceActions] = useState('')
  const [maintenanceCost, setMaintenanceCost] = useState('')
  const [nextMaintenanceAt, setNextMaintenanceAt] = useState('')
  const [attachment, setAttachment] = useState<File | null>(null)

  const disabled = status !== 'ready' || !lifeSheet
  const currentResponsible = lifeSheet?.equipment.currentResponsible?.name ?? 'Sin responsable'
  const hasOperations =
    canAssign || canCreateFailure || canCreateMaintenance || canReturn || canUploadAttachment

  async function submit(operation: () => Promise<void>) {
    setSubmitState('submitting')

    try {
      await operation()
      setSubmitState('success')
      window.setTimeout(() => setSubmitState('idle'), 1800)
    } catch {
      setSubmitState('error')
    }
  }

  function handleAssign(event: FormEvent) {
    event.preventDefault()

    if (!assignUserId) return

    submit(async () => {
      await onAssign(assignUserId, assignNotes || undefined)
      setAssignUserId('')
      setAssignNotes('')
    })
  }

  function handleReturn(event: FormEvent) {
    event.preventDefault()

    submit(async () => {
      await onReturn(returnNotes || undefined)
      setReturnNotes('')
    })
  }

  function handleFailure(event: FormEvent) {
    event.preventDefault()

    submit(async () => {
      await onCreateFailure({
        description: failureDescription,
        priority: failurePriority,
        title: failureTitle,
      })
      setFailureTitle('')
      setFailureDescription('')
      setFailurePriority('medium')
    })
  }

  function handleMaintenance(event: FormEvent) {
    event.preventDefault()

    submit(async () => {
      await onCreateMaintenance({
        actionsTaken: maintenanceActions || undefined,
        cost: maintenanceCost ? Number(maintenanceCost) : undefined,
        description: maintenanceDescription || undefined,
        diagnosis: maintenanceDiagnosis || undefined,
        maintenanceType,
        nextMaintenanceAt: nextMaintenanceAt || undefined,
        performedBy: maintenanceTechnicianId || undefined,
        priority: maintenancePriority,
      })
      setMaintenanceDescription('')
      setMaintenanceDiagnosis('')
      setMaintenanceActions('')
      setMaintenanceCost('')
      setNextMaintenanceAt('')
    })
  }

  function handleAttachment(event: FormEvent) {
    event.preventDefault()

    if (!attachment) return

    submit(async () => {
      await onUploadAttachment(attachment)
      setAttachment(null)
    })
  }

  if (!lifeSheet) {
    return (
      <aside className="rounded-lg border border-slate-800 bg-slate-900 p-5 text-sm text-slate-400">
        Las acciones se habilitan al seleccionar un equipo.
      </aside>
    )
  }

  return (
    <aside className="space-y-4 rounded-lg border border-slate-800 bg-slate-900 p-5">
      <div>
        <p className="text-xs uppercase tracking-wide text-cyan-300">Operaciones</p>
        <h2 className="mt-1 text-lg font-semibold text-white">{lifeSheet.equipment.internalCode}</h2>
        <p className="text-sm text-slate-400">Responsable actual: {currentResponsible}</p>
      </div>

      {submitState === 'error' && (
        <p className="rounded-md border border-red-900 bg-red-950/30 px-3 py-2 text-sm text-red-200">
          No fue posible completar la operacion.
        </p>
      )}
      {submitState === 'success' && (
        <SuccessNotice
          message="Operacion completada"
          subText="Los cambios se guardaron correctamente."
          onClose={() => setSubmitState('idle')}
        />
      )}

      {!hasOperations && (
        <p className="rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-400">
          Tu rol tiene acceso de consulta para este equipo.
        </p>
      )}

      {canAssign && (
        <OperationSection title="Asignar equipo">
          <form className="space-y-3" onSubmit={handleAssign}>
            <Select
              disabled={disabled || submitState === 'submitting'}
              label="Responsable"
              value={assignUserId}
              onChange={setAssignUserId}
              options={(catalogs?.responsibles ?? []).map((responsible) => ({
                label: responsible.name,
                value: responsible.id,
              }))}
            />
            <Textarea label="Nota" value={assignNotes} onChange={setAssignNotes} />
            <SubmitButton disabled={disabled || !assignUserId || submitState === 'submitting'}>
              Asignar
            </SubmitButton>
          </form>
        </OperationSection>
      )}

      {canReturn && (
        <OperationSection title="Devolver equipo">
          <form className="space-y-3" onSubmit={handleReturn}>
            <Textarea label="Nota de devolucion" value={returnNotes} onChange={setReturnNotes} />
            <SubmitButton disabled={disabled || submitState === 'submitting'}>Registrar devolucion</SubmitButton>
          </form>
        </OperationSection>
      )}

      {canCreateFailure && (
        <OperationSection title="Reportar falla">
          <form className="space-y-3" onSubmit={handleFailure}>
            <Input label="Titulo" value={failureTitle} onChange={setFailureTitle} />
            <Textarea label="Descripcion" value={failureDescription} onChange={setFailureDescription} />
            <Select
              label="Prioridad"
              value={failurePriority}
              onChange={setFailurePriority}
              options={priorityOptions}
            />
            <SubmitButton
              disabled={disabled || !failureTitle || !failureDescription || submitState === 'submitting'}
            >
              Crear falla
            </SubmitButton>
          </form>
        </OperationSection>
      )}

      {canCreateMaintenance && (
        <OperationSection title="Registrar mantenimiento">
          <form className="space-y-3" onSubmit={handleMaintenance}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Select
                label="Tipo"
                value={maintenanceType}
                onChange={(value) => setMaintenanceType(value as 'preventive' | 'corrective')}
                options={[
                  { label: 'Preventivo', value: 'preventive' },
                  { label: 'Correctivo', value: 'corrective' },
                ]}
              />
              <Select
                label="Prioridad"
                value={maintenancePriority}
                onChange={setMaintenancePriority}
                options={priorityOptions}
              />
            </div>
            <SearchableSelect
              disabled={disabled || submitState === 'submitting'}
              label="Tecnico"
              placeholder="Buscar tecnico"
              value={maintenanceTechnicianId}
              onChange={setMaintenanceTechnicianId}
              options={(catalogs?.responsibles ?? []).map((responsible) => ({
                label: responsible.name,
                searchText: responsibleSearchText(responsible),
                value: responsible.id,
              }))}
            />
            <Textarea label="Descripcion" value={maintenanceDescription} onChange={setMaintenanceDescription} />
            <Textarea label="Diagnostico" value={maintenanceDiagnosis} onChange={setMaintenanceDiagnosis} />
            <Textarea label="Acciones realizadas" value={maintenanceActions} onChange={setMaintenanceActions} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label="Costo" type="number" value={maintenanceCost} onChange={setMaintenanceCost} />
              <Input
                label="Proximo mantenimiento"
                type="date"
                value={nextMaintenanceAt}
                onChange={setNextMaintenanceAt}
              />
            </div>
            <SubmitButton disabled={disabled || submitState === 'submitting'}>Guardar mantenimiento</SubmitButton>
          </form>
        </OperationSection>
      )}

      {canUploadAttachment && (
        <OperationSection title="Adjuntar archivo">
          <form className="space-y-3" onSubmit={handleAttachment}>
            <input
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-300 file:mr-3 file:rounded-md file:border-0 file:bg-cyan-900 file:px-3 file:py-1.5 file:text-cyan-100"
              type="file"
              onChange={(event) => setAttachment(event.target.files?.[0] ?? null)}
            />
            <SubmitButton disabled={disabled || !attachment || submitState === 'submitting'}>Subir adjunto</SubmitButton>
          </form>
        </OperationSection>
      )}
    </aside>
  )
}

const priorityOptions = [
  { label: 'Baja', value: 'low' },
  { label: 'Media', value: 'medium' },
  { label: 'Alta', value: 'high' },
  { label: 'Critica', value: 'critical' },
]

function OperationSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="border-t border-slate-800 pt-4">
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  )
}

function Input({
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

function Select({
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

function SearchableSelect({
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

function SubmitButton({ children, disabled }: { children: ReactNode; disabled?: boolean }) {
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
