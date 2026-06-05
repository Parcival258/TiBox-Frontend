import { MaintenanceScheduleBoard } from '../components/MaintenanceScheduleBoard'
import type { FinishMaintenanceSchedulePayload, MaintenanceSchedule } from '../types/inventory'
import type { ModuleState } from '../types/ui'

type MaintenancePageProps = {
  canClose: boolean
  canCreate: boolean
  canUpdate: boolean
  schedules: MaintenanceSchedule[]
  status: ModuleState
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

export function MaintenancePage(props: MaintenancePageProps) {
  return <MaintenanceScheduleBoard {...props} />
}
