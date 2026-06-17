import { useState, type MouseEvent } from 'react'
import type { FinishMaintenanceSchedulePayload, MaintenanceSchedule } from '../types'
import {
  ContextActionMenu,
  type ContextMenuState,
} from '@/shared/ui/contextActionMenu/ContextActionMenu'
import { displayDateToIso } from '@/shared/utils/dateFormat'
import { MaintenanceFinishModal } from './MaintenanceFinishModal'
import { MaintenanceScheduleHeader } from './MaintenanceScheduleHeader'
import { MaintenanceScheduleTable } from './MaintenanceScheduleTable'

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
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null)
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
    const value = window.prompt('Nueva fecha programada (DD/MM/AAAA)')

    if (value) {
      const isoDate = displayDateToIso(value)

      if (!isoDate) {
        window.alert('La fecha debe tener el formato DD/MM/AAAA.')
        return
      }

      onReschedule(scheduleId, isoDate)
    }
  }

  function openContextMenu(
    schedule: MaintenanceSchedule,
    event: MouseEvent<HTMLTableRowElement>,
  ) {
    event.preventDefault()
    if (!canUpdate && !canClose) {
      return
    }

    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      actions: [
        ...(canUpdate
          ? [
              {
                icon: 'check' as const,
                label: 'Marcar pendiente',
                onSelect: () => onMarkPending(schedule.id),
              },
              {
                icon: 'play' as const,
                label: 'Iniciar',
                onSelect: () => onStart(schedule.id),
              },
              {
                icon: 'calendar' as const,
                label: 'Reprogramar',
                onSelect: () => askForDate(schedule.id),
              },
              {
                icon: 'trash' as const,
                label: 'Cancelar',
                onSelect: () => onCancel(schedule.id),
                separatorBefore: true,
                tone: 'danger' as const,
              },
            ]
          : []),
        ...(canClose
          ? [
              {
                icon: 'settings' as const,
                label: 'Finalizar',
                onSelect: () => setScheduleToFinish(schedule),
                separatorBefore: canUpdate,
                tone: 'success' as const,
              },
            ]
          : []),
      ],
    })
  }

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900">
      <MaintenanceScheduleHeader
        canCreate={canCreate}
        openSchedules={openSchedules}
        schedules={schedules}
        tomorrowCount={tomorrowCount}
        onCreateSchedule={onCreateSchedule}
      />

      <MaintenanceScheduleTable
        canClose={canClose}
        openSchedules={openSchedules}
        status={status}
        onFinish={setScheduleToFinish}
        onOpenContextMenu={openContextMenu}
      />

      <ContextActionMenu menu={contextMenu} onClose={() => setContextMenu(null)} />
      <MaintenanceFinishModal
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
