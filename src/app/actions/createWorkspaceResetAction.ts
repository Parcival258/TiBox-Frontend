import { emptyDashboard } from '@/app/constants/dashboard'
import { defaultEquipmentFilters } from '@/features/inventory/constants/equipmentFilters'
import type { Alert } from '@/features/alerts/types'
import type { DashboardSummary } from '@/app/types/dashboard'
import type { EquipmentCatalogs, EquipmentType } from '@/features/inventory/types/equipmentCatalogs'
import type { Equipment, EquipmentFilters } from '@/features/inventory/types/equipmentCore'
import type { EquipmentLifeSheet } from '@/features/inventory/types/equipmentLifeSheet'
import type { EquipmentLoan, LoanEquipment } from '@/features/loans/types'
import type {
  EquipmentGroup,
  MaintenanceFilters,
  MaintenanceRecord,
  MaintenanceSchedule,
  MaintenanceScheduleCatalogs,
} from '@/features/maintenance/types'
import type { Headquarter, Location } from '@/features/settings/types'
import type { PaginationMeta } from '@/shared/types/pagination'
import type { ActiveView, LifeSheetState, LoadState, ModuleState } from '@/shared/types/ui'

type WorkspaceResetDependencies = {
  equipmentPageSize: number
  setActiveView: (view: ActiveView) => void
  setAlerts: (alerts: Alert[]) => void
  setAlertsStatus: (status: ModuleState) => void
  setDashboard: (dashboard: DashboardSummary) => void
  setEditingEquipment: (equipment: Equipment | null) => void
  setEquipment: (equipment: Equipment[]) => void
  setEquipmentCatalogs: (catalogs: EquipmentCatalogs | null) => void
  setEquipmentGroups: (groups: EquipmentGroup[]) => void
  setEquipmentFilters: (filters: EquipmentFilters) => void
  setEquipmentFormMode: (mode: 'create' | 'edit') => void
  setEquipmentLoans: (loans: EquipmentLoan[]) => void
  setEquipmentLoansStatus: (status: ModuleState) => void
  setEquipmentMeta: (meta: PaginationMeta | null) => void
  setEquipmentTypes: (types: EquipmentType[]) => void
  setHeadquarters: (headquarters: Headquarter[]) => void
  setIsEquipmentFormOpen: (isOpen: boolean) => void
  setIsScheduleFormOpen: (isOpen: boolean) => void
  setLifeSheet: (lifeSheet: EquipmentLifeSheet | null) => void
  setLifeSheetStatus: (status: LifeSheetState) => void
  setLocations: (locations: Location[]) => void
  setMaintenanceCatalogs: (catalogs: MaintenanceScheduleCatalogs | null) => void
  setMaintenanceFilters: (filters: MaintenanceFilters) => void
  setMaintenanceRecords: (records: MaintenanceRecord[]) => void
  setMaintenanceSchedules: (schedules: MaintenanceSchedule[]) => void
  setMaintenanceStatus: (status: ModuleState) => void
  setRequestableEquipment: (equipment: LoanEquipment[]) => void
  setSelectedEquipmentId: (equipmentId: string | null) => void
  setStatus: (status: LoadState) => void
}

export function createWorkspaceResetAction({
  equipmentPageSize,
  setActiveView,
  setAlerts,
  setAlertsStatus,
  setDashboard,
  setEditingEquipment,
  setEquipment,
  setEquipmentCatalogs,
  setEquipmentGroups,
  setEquipmentFilters,
  setEquipmentFormMode,
  setEquipmentLoans,
  setEquipmentLoansStatus,
  setEquipmentMeta,
  setEquipmentTypes,
  setHeadquarters,
  setIsEquipmentFormOpen,
  setIsScheduleFormOpen,
  setLifeSheet,
  setLifeSheetStatus,
  setLocations,
  setMaintenanceCatalogs,
  setMaintenanceFilters,
  setMaintenanceRecords,
  setMaintenanceSchedules,
  setMaintenanceStatus,
  setRequestableEquipment,
  setSelectedEquipmentId,
  setStatus,
}: WorkspaceResetDependencies) {
  return function resetWorkspace() {
    setDashboard(emptyDashboard)
    setEquipment([])
    setEquipmentCatalogs(null)
    setEquipmentTypes([])
    setEquipmentFilters({ ...defaultEquipmentFilters, perPage: equipmentPageSize })
    setEquipmentMeta(null)
    setEquipmentLoans([])
    setRequestableEquipment([])
    setMaintenanceCatalogs(null)
    setMaintenanceFilters({})
    setMaintenanceRecords([])
    setEquipmentGroups([])
    setAlerts([])
    setEditingEquipment(null)
    setSelectedEquipmentId(null)
    setEquipmentFormMode('create')
    setIsEquipmentFormOpen(false)
    setIsScheduleFormOpen(false)
    setLifeSheet(null)
    setLifeSheetStatus('idle')
    setHeadquarters([])
    setLocations([])
    setMaintenanceSchedules([])
    setMaintenanceStatus('loading')
    setEquipmentLoansStatus('loading')
    setAlertsStatus('loading')
    setActiveView('inventory')
    setStatus('loading')
  }
}
