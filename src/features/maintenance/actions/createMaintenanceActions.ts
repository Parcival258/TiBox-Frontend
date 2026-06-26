import {
  createEquipmentGroup,
  createMaintenanceRecord,
  createMaintenanceSchedule,
  getEquipmentGroups,
  getMaintenanceRecords,
  getMaintenanceSchedules,
  updateMaintenanceClosure,
  updateMaintenanceExecution,
  updateMaintenanceReception,
  uploadMaintenanceAttachment,
} from '../services/maintenanceService'
import type {
  CreateMaintenanceSchedulePayload,
  EquipmentGroup,
  FinishMaintenanceSchedulePayload,
  MaintenanceFilters,
  MaintenanceRecord,
  MaintenanceStage,
  MaintenanceSchedule,
} from '../types'
import type { ModuleState } from '@/shared/types/ui'

type MaintenanceActionDependencies = {
  refreshDashboard: () => Promise<unknown>
  refreshOperationalData: () => Promise<unknown>
  maintenanceFilters: MaintenanceFilters
  setEquipmentGroups: (groups: EquipmentGroup[]) => void
  setMaintenanceRecords: (records: MaintenanceRecord[]) => void
  setMaintenanceSchedules: (schedules: MaintenanceSchedule[]) => void
  setMaintenanceStatus: (status: ModuleState) => void
  showSuccess: (message: string, subText?: string) => void
}

export function createMaintenanceActions({
  refreshDashboard,
  refreshOperationalData,
  maintenanceFilters,
  setEquipmentGroups,
  setMaintenanceRecords,
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

  function refreshMaintenanceRecords(filters = maintenanceFilters) {
    setMaintenanceStatus('loading')
    Promise.all([getMaintenanceRecords(filters), getEquipmentGroups()])
      .then(([records, groups]) => {
        setMaintenanceRecords(records)
        setEquipmentGroups(groups)
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
    const schedule = await createMaintenanceSchedule(payload)
    if (schedule.equipment?.id) {
      await createMaintenanceRecord({
        equipmentId: schedule.equipment.id,
        maintenanceScheduleId: schedule.id,
        maintenanceType: schedule.maintenanceType as 'preventive' | 'corrective',
        priority: schedule.priority,
        scheduledDate: schedule.scheduledFor,
        status: schedule.status === 'scheduled' ? 'pending' : schedule.status,
      })
    }
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
    showSuccess('Mantenimiento finalizado', 'El registro tecnico quedo asociado al mantenimiento.')
    await refreshOperationalData()
  }

  return {
    createEquipmentGroup,
    handleCreateSchedule,
    handleFinishSchedule,
    handleScheduleAction,
    refreshMaintenanceRecords,
    refreshMaintenanceSchedules,
    updateMaintenanceClosure,
    updateMaintenanceExecution,
    updateMaintenanceReception,
    uploadMaintenanceAttachment: (
      recordId: string,
      stage: MaintenanceStage,
      file: File
    ) => uploadMaintenanceAttachment(recordId, stage, file),
  }
}
