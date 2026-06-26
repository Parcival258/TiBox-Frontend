import { useState } from 'react'
import type {
  EquipmentGroup,
  MaintenanceFilters,
  MaintenanceRecord,
  MaintenanceSchedule,
  MaintenanceScheduleCatalogs,
} from '../types'
import type { ModuleState } from '@/shared/types/ui'

export function useMaintenanceState() {
  const [maintenanceSchedules, setMaintenanceSchedules] = useState<MaintenanceSchedule[]>([])
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([])
  const [equipmentGroups, setEquipmentGroups] = useState<EquipmentGroup[]>([])
  const [maintenanceFilters, setMaintenanceFilters] = useState<MaintenanceFilters>({})
  const [maintenanceCatalogs, setMaintenanceCatalogs] = useState<MaintenanceScheduleCatalogs | null>(null)
  const [maintenanceStatus, setMaintenanceStatus] = useState<ModuleState>('loading')
  const [isScheduleFormOpen, setIsScheduleFormOpen] = useState(false)

  return {
    isScheduleFormOpen,
    maintenanceCatalogs,
    equipmentGroups,
    maintenanceFilters,
    maintenanceRecords,
    maintenanceSchedules,
    maintenanceStatus,
    setEquipmentGroups,
    setIsScheduleFormOpen,
    setMaintenanceCatalogs,
    setMaintenanceFilters,
    setMaintenanceRecords,
    setMaintenanceSchedules,
    setMaintenanceStatus,
  }
}
