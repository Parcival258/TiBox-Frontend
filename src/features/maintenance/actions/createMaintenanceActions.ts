import { createMaintenanceRecord } from '@/features/inventory/services/equipmentService'
import {
  createMaintenanceSchedule,
  getMaintenanceSchedules,
} from '../services/maintenanceService'
import type {
  CreateMaintenanceSchedulePayload,
  FinishMaintenanceSchedulePayload,
  MaintenanceSchedule,
} from '@/shared/types/inventory'
import type { ModuleState } from '@/shared/types/ui'

type MaintenanceActionDependencies = {
  refreshDashboard: () => Promise<unknown>
  refreshOperationalData: () => Promise<unknown>
  setMaintenanceSchedules: (schedules: MaintenanceSchedule[]) => void
  setMaintenanceStatus: (status: ModuleState) => void
  showSuccess: (message: string, subText?: string) => void
}

export function createMaintenanceActions({
  refreshDashboard,
  refreshOperationalData,
  setMaintenanceSchedules,
  setMaintenanceStatus,
  showSuccess,
}: MaintenanceActionDependencies) {
  function refreshMaintenanceSchedules() {
    setMaintenanceStatus('loading')
    getMaintenanceSchedules()
      .then((response) => {
        setMaintenanceSchedules(response)
        setMaintenanceStatus('ready')
      })
      .catch(() => setMaintenanceStatus('error'))
  }

  function handleScheduleAction(action: () => Promise<MaintenanceSchedule>) {
    action()
      .then(() => {
        refreshMaintenanceSchedules()
        return refreshDashboard()
      })
      .catch(() => setMaintenanceStatus('error'))
  }

  async function handleCreateSchedule(payload: CreateMaintenanceSchedulePayload) {
    await createMaintenanceSchedule(payload)
    await refreshOperationalData()
  }

  async function handleFinishSchedule(
    schedule: MaintenanceSchedule,
    payload: FinishMaintenanceSchedulePayload
  ) {
    if (!schedule.equipment?.id) {
      return
    }

    await createMaintenanceRecord({
      equipmentId: schedule.equipment.id,
      maintenanceScheduleId: schedule.id,
      maintenanceType: schedule.maintenanceType as 'preventive' | 'corrective',
      priority: schedule.priority,
      scheduledDate: schedule.scheduledFor,
      status: 'completed',
      ...payload,
    })
    showSuccess('Mantenimiento finalizado', 'El registro tecnico quedo asociado al cronograma.')
    await refreshOperationalData()
  }

  return {
    handleCreateSchedule,
    handleFinishSchedule,
    handleScheduleAction,
    refreshMaintenanceSchedules,
  }
}
