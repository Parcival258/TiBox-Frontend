import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import type {
  CreateMaintenanceSchedulePayload,
  Equipment,
  EquipmentCatalogs,
  MaintenanceScheduleCatalogs,
} from '../types/inventory'

type MaintenanceScheduleFormModalProps = {
  catalogs: MaintenanceScheduleCatalogs | null
  equipment: Equipment[]
  equipmentCatalogs: EquipmentCatalogs | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (payload: CreateMaintenanceSchedulePayload) => Promise<void>
}

type FormState = {
  assignedTechnicianId: string
  equipmentId: string
  frequencyMonths: string
  maintenanceType: 'preventive' | 'corrective'
  notes: string
  priority: string
  scheduledFor: string
  status: string
}

const emptyForm: FormState = {
  assignedTechnicianId: '',
  equipmentId: '',
  frequencyMonths: '',
  maintenanceType: 'preventive',
  notes: '',
  priority: 'medium',
  scheduledFor: '',
  status: 'scheduled',
}

const fallbackTypes = [
  { label: 'Preventivo', value: 'preventive' },
  { label: 'Correctivo', value: 'corrective' },
]

const fallbackPriorities = [
  { label: 'Baja', value: 'low' },
  { label: 'Media', value: 'medium' },
  { label: 'Alta', value: 'high' },
  { label: 'Critica', value: 'critical' },
]

const fallbackStatuses = [
  { label: 'Programado', value: 'scheduled' },
  { label: 'Pendiente', value: 'pending' },
  { label: 'En proceso', value: 'in_progress' },
  { label: 'Reprogramado', value: 'rescheduled' },
]

function optional(value: string) {
  return value.trim() || undefined
}

function equipmentLabel(item: Equipment) {
  const model = [item.brand, item.model].filter(Boolean).join(' ')

  return `${item.internalCode} / ${model || item.type}`
}

export function MaintenanceScheduleFormModal({
  catalogs,
  equipment,
  equipmentCatalogs,
  isOpen,
  onClose,
  onSubmit,
}: MaintenanceScheduleFormModalProps) {
  const [form, setForm] = useState<FormState>(emptyForm)
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'error'>('idle')

  useEffect(() => {
    if (isOpen) {
      setForm(emptyForm)
      setSubmitState('idle')
    }
  }, [isOpen])

  const equipmentOptions = useMemo(
    () =>
      equipment
        .filter((item) => item.status !== 'retired')
        .map((item) => ({
          label: equipmentLabel(item),
          value: item.id,
        })),
    [equipment]
  )

  if (!isOpen) {
    return null
  }

  function setField<Key extends keyof FormState>(key: Key, value: FormState[Key]) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitState('submitting')

    const payload: CreateMaintenanceSchedulePayload = {
      equipmentId: form.equipmentId,
      maintenanceType: form.maintenanceType,
      scheduledFor: form.scheduledFor,
      assignedTechnicianId: optional(form.assignedTechnicianId),
      frequencyMonths: form.frequencyMonths ? Number(form.frequencyMonths) : undefined,
      notes: optional(form.notes),
      priority: optional(form.priority),
      status: optional(form.status),
    }

    try {
      await onSubmit(payload)
      onClose()
    } catch {
      setSubmitState('error')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/80 px-4 py-8">
      <form
        className="w-full max-w-3xl rounded-lg border border-slate-800 bg-slate-900 shadow-2xl"
        onSubmit={handleSubmit}
      >
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-cyan-300">Cronograma</p>
            <h2 className="text-xl font-semibold text-white">Programar mantenimiento</h2>
          </div>
          <button
            className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
            type="button"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>

        <div className="grid gap-5 p-5 md:grid-cols-2">
          <FieldGroup title="Programacion">
            <Select
              label="Equipo"
              required
              value={form.equipmentId}
              onChange={(value) => setField('equipmentId', value)}
              options={equipmentOptions}
            />
            <Input
              label="Fecha programada"
              required
              type="date"
              value={form.scheduledFor}
              onChange={(value) => setField('scheduledFor', value)}
            />
            <Select
              label="Tipo"
              value={form.maintenanceType}
              onChange={(value) => setField('maintenanceType', value as 'preventive' | 'corrective')}
              options={catalogs?.maintenanceTypes ?? fallbackTypes}
            />
            <Select
              label="Estado"
              value={form.status}
              onChange={(value) => setField('status', value)}
              options={catalogs?.statuses ?? fallbackStatuses}
            />
          </FieldGroup>

          <FieldGroup title="Seguimiento">
            <Select
              label="Prioridad"
              value={form.priority}
              onChange={(value) => setField('priority', value)}
              options={catalogs?.priorities ?? fallbackPriorities}
            />
            <Select
              label="Tecnico"
              value={form.assignedTechnicianId}
              onChange={(value) => setField('assignedTechnicianId', value)}
              options={(equipmentCatalogs?.responsibles ?? []).map((responsible) => ({
                label: responsible.name,
                value: responsible.id,
              }))}
            />
            <Input
              label="Frecuencia meses"
              min="1"
              type="number"
              value={form.frequencyMonths}
              onChange={(value) => setField('frequencyMonths', value)}
            />
          </FieldGroup>

          <div className="md:col-span-2">
            <FieldGroup title="Notas">
              <Textarea label="Notas" value={form.notes} onChange={(value) => setField('notes', value)} />
            </FieldGroup>
          </div>
        </div>

        {submitState === 'error' && (
          <p className="mx-5 rounded-md border border-red-900 bg-red-950/30 px-3 py-2 text-sm text-red-200">
            No fue posible programar el mantenimiento. Revisa equipo, fecha y permisos.
          </p>
        )}

        <div className="flex justify-end gap-3 border-t border-slate-800 px-5 py-4">
          <button
            className="rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
            type="button"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="rounded-md border border-cyan-700 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:border-cyan-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            disabled={submitState === 'submitting'}
            type="submit"
          >
            {submitState === 'submitting' ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  )
}

function FieldGroup({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      {children}
    </section>
  )
}

function Input({
  label,
  min,
  onChange,
  required,
  type = 'text',
  value,
}: {
  label: string
  min?: string
  onChange: (value: string) => void
  required?: boolean
  type?: string
  value: string
}) {
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

function Select({
  label,
  onChange,
  options,
  required,
  value,
}: {
  label: string
  onChange: (value: string) => void
  options: Array<{ label: string; value: string }>
  required?: boolean
  value: string
}) {
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
        className="mt-1 min-h-28 w-full resize-y rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 outline-none transition focus:border-cyan-500"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}
