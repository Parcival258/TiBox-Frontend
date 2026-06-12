import { useState } from 'react'
import type { MaintenanceSchedule, MaintenanceScheduleCatalogs } from '@/shared/types/inventory'
import type { ModuleState } from '@/shared/types/ui'

export function useMaintenanceState() {
  const [maintenanceSchedules, setMaintenanceSchedules] = useState<MaintenanceSchedule[]>([])
  const [maintenanceCatalogs, setMaintenanceCatalogs] = useState<MaintenanceScheduleCatalogs | null>(null)
  const [maintenanceStatus, setMaintenanceStatus] = useState<ModuleState>('loading')
  const [isScheduleFormOpen, setIsScheduleFormOpen] = useState(false)

  return {
    isScheduleFormOpen,
    maintenanceCatalogs,
    maintenanceSchedules,
    maintenanceStatus,
    setIsScheduleFormOpen,
    setMaintenanceCatalogs,
    setMaintenanceSchedules,
    setMaintenanceStatus,
  }
}
