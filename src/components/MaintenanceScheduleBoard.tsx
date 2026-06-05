import { useState, type FormEvent } from 'react'
import type { FinishMaintenanceSchedulePayload, MaintenanceSchedule } from '../types/inventory'
import { AppLoader } from './Loaders'
import {
  maintenanceStatusLabel,
  maintenanceTypeLabel,
  priorityLabel,
} from '../utils/enumLabels'

type MaintenanceScheduleBoardProps = {
  canClose: boolean
  canCreate: boolean
  canUpdate: boolean
  schedules: MaintenanceSchedule[]
  status: 'loading' | 'ready' | 'error'
  onCancel: (scheduleId: string) => void
  onCreateSchedule: () => void
  onFinish: (
    schedule: MaintenanceSchedule,
    payload: FinishMaintenanceSchedulePayload
  ) => Promise<void>
  onMarkPending: (scheduleId: string) => void
  onReschedule: (scheduleId: string, scheduledFor: string) => void
  onStart: (scheduleId: string) => void
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return 'Sin fecha'
  }

  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function equipmentName(schedule: MaintenanceSchedule) {
  if (!schedule.equipment) {
    return 'Equipo no disponible'
  }

  const model = [schedule.equipment.brand, schedule.equipment.model].filter(Boolean).join(' ')

  return `${schedule.equipment.internalCode} / ${model || schedule.equipment.type}`
}

export function MaintenanceScheduleBoard({
  canClose,
  canCreate,
  canUpdate,
  onCancel,
  onCreateSchedule,
  onFinish,
  onMarkPending,
  onReschedule,
  onStart,
  schedules,
  status,
}: MaintenanceScheduleBoardProps) {
  const [scheduleToFinish, setScheduleToFinish] = useState<MaintenanceSchedule | null>(null)
  const openSchedules = schedules.filter((schedule) =>
    ['scheduled', 'pending', 'in_progress', 'rescheduled', 'overdue'].includes(schedule.status)
  )
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowKey = tomorrow.toISOString().slice(0, 10)
  const tomorrowCount = openSchedules.filter((schedule) =>
    schedule.scheduledFor?.startsWith(tomorrowKey)
  ).length

  function askForDate(scheduleId: string) {
    const value = window.prompt('Nueva fecha programada (YYYY-MM-DD)')

    if (value) {
      onReschedule(scheduleId, value)
    }
  }

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900">
      <div className="flex flex-col gap-3 border-b border-slate-800 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-medium text-white">Cronograma de mantenimientos</h2>
          <p className="mt-1 text-sm text-slate-400">
            {openSchedules.length} abiertos / {tomorrowCount} programados para manana
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:items-end">
          {canCreate && (
            <button
              className="rounded-md border border-cyan-700 px-3 py-2 text-sm font-medium text-cyan-100 transition hover:border-cyan-400 hover:text-white"
              type="button"
              onClick={onCreateSchedule}
            >
              Programar mantenimiento
            </button>
          )}
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <Metric label="Programados" value={countByStatus(schedules, 'scheduled')} />
            <Metric label="En proceso" value={countByStatus(schedules, 'in_progress')} />
            <Metric label="Vencidos" value={countByStatus(schedules, 'overdue')} />
          </div>
        </div>
      </div>

      {status === 'loading' ? (
        <div className="px-4 py-16 text-center text-sm text-slate-400">
          <AppLoader label="Cargando cronograma..." />
        </div>
      ) : status === 'error' ? (
        <div className="px-4 py-12 text-center text-sm text-red-200">
          No fue posible cargar el cronograma.
        </div>
      ) : openSchedules.length === 0 ? (
        <div className="px-4 py-12 text-center text-sm text-slate-400">
          No hay mantenimientos abiertos.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-slate-950 text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Equipo</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Prioridad</th>
                <th className="px-4 py-3 font-medium">Tecnico</th>
                <th className="px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {openSchedules.map((schedule) => (
                <tr key={schedule.id} className="border-t border-slate-800">
                  <td className="px-4 py-3 text-white">{formatDate(schedule.scheduledFor)}</td>
                  <td className="px-4 py-3 text-slate-300">{equipmentName(schedule)}</td>
                  <td className="px-4 py-3 text-slate-300">
                    {schedule.maintenanceTypeLabel ?? maintenanceTypeLabel(schedule.maintenanceType)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge value={schedule.statusLabel ?? maintenanceStatusLabel(schedule.status)} />
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {schedule.priorityLabel ?? priorityLabel(schedule.priority)}
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {schedule.assignedTechnician?.name ?? 'Sin asignar'}
                  </td>
                  <td className="px-4 py-3">
                    {canUpdate || canClose ? (
                      <div className="flex flex-wrap gap-2">
                        {canUpdate && (
                          <>
                            <ActionButton label="Pendiente" onClick={() => onMarkPending(schedule.id)} />
                            <ActionButton label="Iniciar" onClick={() => onStart(schedule.id)} />
                            <ActionButton label="Reprogramar" onClick={() => askForDate(schedule.id)} />
                            <ActionButton label="Cancelar" tone="danger" onClick={() => onCancel(schedule.id)} />
                          </>
                        )}
                        {canClose && (
                          <ActionButton label="Finalizar" onClick={() => setScheduleToFinish(schedule)} />
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500">Solo lectura</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <FinishMaintenanceModal
        schedule={scheduleToFinish}
        onClose={() => setScheduleToFinish(null)}
        onSubmit={async (payload) => {
          if (!scheduleToFinish) {
            return
          }

          await onFinish(scheduleToFinish, payload)
          setScheduleToFinish(null)
        }}
      />
    </section>
  )
}

function countByStatus(schedules: MaintenanceSchedule[], status: string) {
  return schedules.filter((schedule) => schedule.status === status).length
}

function FinishMaintenanceModal({
  onClose,
  onSubmit,
  schedule,
}: {
  onClose: () => void
  onSubmit: (payload: FinishMaintenanceSchedulePayload) => Promise<void>
  schedule: MaintenanceSchedule | null
}) {
  const [description, setDescription] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [actionsTaken, setActionsTaken] = useState('')
  const [partsReplaced, setPartsReplaced] = useState('')
  const [cost, setCost] = useState('')
  const [nextMaintenanceAt, setNextMaintenanceAt] = useState('')
  const [performedAt, setPerformedAt] = useState(() => new Date().toISOString().slice(0, 10))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasError, setHasError] = useState(false)

  if (!schedule) {
    return null
  }

  const activeSchedule = schedule

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setIsSubmitting(true)
    setHasError(false)

    try {
      await onSubmit({
        actionsTaken: actionsTaken || undefined,
        cost: cost ? Number(cost) : undefined,
        description: description || undefined,
        diagnosis: diagnosis || undefined,
        nextMaintenanceAt: nextMaintenanceAt || undefined,
        partsReplaced: partsReplaced || undefined,
        performedAt: performedAt || undefined,
        performedBy: activeSchedule.assignedTechnician?.id,
      })
      setDescription('')
      setDiagnosis('')
      setActionsTaken('')
      setPartsReplaced('')
      setCost('')
      setNextMaintenanceAt('')
      setPerformedAt(new Date().toISOString().slice(0, 10))
    } catch {
      setHasError(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/80 px-4 py-6">
      <form
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-slate-700 bg-slate-900 p-5 shadow-2xl"
        onSubmit={handleSubmit}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-cyan-300">Finalizar mantenimiento</p>
            <h3 className="mt-1 text-lg font-semibold text-white">{equipmentName(schedule)}</h3>
            <p className="mt-1 text-sm text-slate-400">
              {schedule.assignedTechnician?.name ?? 'Sin tecnico asignado'} / {formatDate(schedule.scheduledFor)}
            </p>
          </div>
          <button
            className="rounded-md border border-slate-700 px-2.5 py-1 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
            type="button"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>

        {hasError && (
          <p className="mt-4 rounded-md border border-red-900 bg-red-950/30 px-3 py-2 text-sm text-red-200">
            No fue posible finalizar el mantenimiento.
          </p>
        )}

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Input label="Fecha realizada" type="date" value={performedAt} onChange={setPerformedAt} />
          <Input label="Costo" type="number" value={cost} onChange={setCost} />
        </div>
        <div className="mt-4 grid gap-4">
          <Textarea label="Descripcion" value={description} onChange={setDescription} />
          <Textarea label="Diagnostico" value={diagnosis} onChange={setDiagnosis} />
          <Textarea label="Acciones realizadas" value={actionsTaken} onChange={setActionsTaken} />
          <Textarea label="Partes reemplazadas" value={partsReplaced} onChange={setPartsReplaced} />
          <Input
            label="Proximo mantenimiento"
            type="date"
            value={nextMaintenanceAt}
            onChange={setNextMaintenanceAt}
          />
        </div>

        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            className="rounded-md border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white"
            type="button"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="rounded-md border border-cyan-700 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:border-cyan-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSubmitting || !diagnosis || !actionsTaken}
            type="submit"
          >
            {isSubmitting ? 'Guardando...' : 'Finalizar'}
          </button>
        </div>
      </form>
    </div>
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
        className="mt-1 min-h-24 w-full resize-y rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 outline-none transition focus:border-cyan-500"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
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

function StatusBadge({ value }: { value: string }) {
  return (
    <span className="inline-flex rounded-md border border-cyan-800 bg-cyan-950/40 px-2 py-1 text-xs font-medium text-cyan-200">
      {value}
    </span>
  )
}

function ActionButton({
  label,
  onClick,
  tone = 'default',
}: {
  label: string
  onClick: () => void
  tone?: 'default' | 'danger'
}) {
  const toneClass =
    tone === 'danger'
      ? 'border-red-800 text-red-200 hover:border-red-500 hover:text-white'
      : 'border-slate-700 text-slate-300 hover:border-cyan-500 hover:text-white'

  return (
    <button
      className={`rounded-md border px-2.5 py-1 text-xs font-medium transition ${toneClass}`}
      type="button"
      onClick={onClick}
    >
      {label}
    </button>
  )
}
