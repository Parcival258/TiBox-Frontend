import type { MaintenanceSchedule } from '../types'

type MaintenanceScheduleHeaderProps = {
  canCreate: boolean
  openSchedules: MaintenanceSchedule[]
  schedules: MaintenanceSchedule[]
  tomorrowCount: number
  onCreateSchedule: () => void
}

export function MaintenanceScheduleHeader({
  canCreate,
  openSchedules,
  schedules,
  tomorrowCount,
  onCreateSchedule,
}: MaintenanceScheduleHeaderProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-800 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-base font-medium text-white">Mantenimientos</h2>
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
          <MaintenanceMetric label="Programados" value={countByStatus(schedules, 'scheduled')} />
          <MaintenanceMetric label="En proceso" value={countByStatus(schedules, 'in_progress')} />
          <MaintenanceMetric label="Vencidos" value={countByStatus(schedules, 'overdue')} />
        </div>
      </div>
    </div>
  )
}

function countByStatus(schedules: MaintenanceSchedule[], status: string) {
  return schedules.filter((schedule) => schedule.status === status).length
}

function MaintenanceMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-slate-800 bg-slate-950 px-3 py-2">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  )
}
