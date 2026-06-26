import type { MouseEvent } from 'react'
import { AppLoader } from '@/shared/ui/Loaders'
import { formatDate } from '@/shared/utils/dateFormat'
import {
  maintenanceStatusLabel,
  maintenanceTypeLabel,
  priorityLabel,
} from '@/shared/utils/enumLabels'
import type { MaintenanceSchedule } from '../types'
import { scheduleEquipmentName } from '../utils/maintenanceDisplay'

type MaintenanceScheduleTableProps = {
  canClose: boolean
  openSchedules: MaintenanceSchedule[]
  status: 'loading' | 'ready' | 'error'
  onFinish: (schedule: MaintenanceSchedule) => void
  onOpenContextMenu: (
    schedule: MaintenanceSchedule,
    event: MouseEvent<HTMLTableRowElement>,
  ) => void
}

export function MaintenanceScheduleTable({
  canClose,
  openSchedules,
  status,
  onFinish,
  onOpenContextMenu,
}: MaintenanceScheduleTableProps) {
  if (status === 'loading') {
    return (
      <div className="px-4 py-16 text-center text-sm text-slate-400">
        <AppLoader label="Cargando mantenimientos..." />
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="px-4 py-12 text-center text-sm text-red-200">
        No fue posible cargar los mantenimientos.
      </div>
    )
  }

  if (openSchedules.length === 0) {
    return (
      <div className="px-4 py-12 text-center text-sm text-slate-400">
        No hay mantenimientos abiertos.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px] text-left text-sm">
        <thead className="bg-slate-950 text-slate-400">
          <tr>
            <th className="px-4 py-3 font-medium">Fecha</th>
            <th className="px-4 py-3 font-medium">Equipo</th>
            <th className="px-4 py-3 font-medium">Tipo</th>
            <th className="px-4 py-3 font-medium">Estado</th>
            <th className="px-4 py-3 font-medium">Prioridad</th>
            <th className="px-4 py-3 font-medium">Tecnico</th>
          </tr>
        </thead>
        <tbody>
          {openSchedules.map((schedule) => (
            <tr
              key={schedule.id}
              className="app-click-row border-t border-slate-800"
              tabIndex={0}
              onClick={() => {
                if (canClose) {
                  onFinish(schedule)
                }
              }}
              onContextMenu={(event) => onOpenContextMenu(schedule, event)}
            >
              <td className="px-4 py-3 text-white">{formatDate(schedule.scheduledFor)}</td>
              <td className="px-4 py-3 text-slate-300">{scheduleEquipmentName(schedule)}</td>
              <td className="px-4 py-3 text-slate-300">
                {schedule.maintenanceTypeLabel ?? maintenanceTypeLabel(schedule.maintenanceType)}
              </td>
              <td className="px-4 py-3">
                <MaintenanceStatusBadge
                  value={schedule.statusLabel ?? maintenanceStatusLabel(schedule.status)}
                />
              </td>
              <td className="px-4 py-3 text-slate-300">
                {schedule.priorityLabel ?? priorityLabel(schedule.priority)}
              </td>
              <td className="px-4 py-3 text-slate-300">
                {schedule.assignedTechnician?.name ?? 'Sin asignar'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function MaintenanceStatusBadge({ value }: { value: string }) {
  return (
    <span className="inline-flex rounded-md border border-cyan-800 bg-cyan-950/40 px-2 py-1 text-xs font-medium text-cyan-200">
      {value}
    </span>
  )
}
