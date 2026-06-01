import type { MaintenanceSchedule } from '../types/inventory'
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
  onFinish: (scheduleId: string) => void
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
  const openSchedules = schedules.filter((schedule) =>
    ['scheduled', 'pending', 'in_progress', 'rescheduled', 'overdue'].includes(schedule.status)
  )
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowKey = tomorrow.toISOString().slice(0, 10)
  const tomorrowCount = schedules.filter((schedule) =>
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
      ) : schedules.length === 0 ? (
        <div className="px-4 py-12 text-center text-sm text-slate-400">
          No hay mantenimientos programados.
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
              {schedules.map((schedule) => (
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
                          <ActionButton label="Finalizar" onClick={() => onFinish(schedule.id)} />
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
    </section>
  )
}

function countByStatus(schedules: MaintenanceSchedule[], status: string) {
  return schedules.filter((schedule) => schedule.status === status).length
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
