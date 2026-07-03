import { getDashboard } from '@/app/services/dashboardService'
import { getAlerts } from '@/features/alerts/services/alertService'
import { getEquipmentLoans, getRequestableEquipment } from '@/features/loans/services/loanService'
import {
  getEquipmentGroups,
  getMaintenanceRecords,
  getMaintenanceSchedules,
} from '@/features/maintenance/services/maintenanceService'
import { getHeadquarters, getLocations } from '@/features/settings/services/settingsService'
import { getEquipmentTypes } from '@/features/inventory/services/equipmentTypesService'
import { getEquipment, getEquipmentCatalogs, getEquipmentLifeSheet } from '@/features/inventory/services/equipmentQuery'
import type { Alert } from '@/features/alerts/types'
import type { DashboardSummary } from '@/app/types/dashboard'
import type { EquipmentCatalogs, EquipmentType } from '@/features/inventory/types/equipmentCatalogs'
import type { Equipment, EquipmentFilters } from '@/features/inventory/types/equipmentCore'
import type { EquipmentLifeSheet } from '@/features/inventory/types/equipmentLifeSheet'
import type { EquipmentLoan, LoanEquipment } from '@/features/loans/types'
import type { EquipmentGroup, MaintenanceRecord, MaintenanceSchedule } from '@/features/maintenance/types'
import type { Headquarter, Location } from '@/features/settings/types'
import type { PaginationMeta } from '@/shared/types/pagination'
import type { LifeSheetState, LoadState, ModuleState } from '@/shared/types/ui'

type WorkspaceRefresherDependencies = {
  canViewAlerts: boolean
  canViewMaintenance: boolean
  equipmentFilters: EquipmentFilters
  selectedEquipmentId: string | null
  setAlerts: (alerts: Alert[]) => void
  setAlertsStatus: (status: ModuleState) => void
  setDashboard: (dashboard: DashboardSummary) => void
  setEquipment: (equipment: Equipment[]) => void
  setEquipmentCatalogs: (catalogs: EquipmentCatalogs | null) => void
  setEquipmentLoans: (loans: EquipmentLoan[]) => void
  setEquipmentGroups: (groups: EquipmentGroup[]) => void
  setEquipmentMeta: (meta: PaginationMeta | null) => void
  setEquipmentTypes: (types: EquipmentType[]) => void
  setHeadquarters: (headquarters: Headquarter[]) => void
  setLifeSheet: (lifeSheet: EquipmentLifeSheet | null) => void
  setLifeSheetStatus: (status: LifeSheetState) => void
  setLocations: (locations: Location[]) => void
  setMaintenanceRecords: (records: MaintenanceRecord[]) => void
  setMaintenanceSchedules: (schedules: MaintenanceSchedule[]) => void
  setMaintenanceStatus: (status: ModuleState) => void
  setRequestableEquipment: (equipment: LoanEquipment[]) => void
  setEquipmentLoansStatus: (status: ModuleState) => void
  setStatus: (status: LoadState) => void
}

export function createWorkspaceRefreshers({
  canViewAlerts,
  canViewMaintenance,
  equipmentFilters,
  selectedEquipmentId,
  setAlerts,
  setAlertsStatus,
  setDashboard,
  setEquipment,
  setEquipmentCatalogs,
  setEquipmentLoans,
  setEquipmentGroups,
  setEquipmentLoansStatus,
  setEquipmentMeta,
  setEquipmentTypes,
  setHeadquarters,
  setLifeSheet,
  setLifeSheetStatus,
  setLocations,
  setMaintenanceRecords,
  setMaintenanceSchedules,
  setMaintenanceStatus,
  setRequestableEquipment,
  setStatus,
}: WorkspaceRefresherDependencies) {
  function refreshDashboard() {
    return getDashboard().then(setDashboard)
  }

  async function refreshSettingsData() {
    await Promise.all([
      getEquipmentTypes()
        .then(setEquipmentTypes)
        .catch(() => setEquipmentTypes([])),
      getHeadquarters()
        .then(setHeadquarters)
        .catch(() => setHeadquarters([])),
      getLocations()
        .then(setLocations)
        .catch(() => setLocations([])),
    ])
  }

  function refreshAuxiliaryData() {
    getEquipmentCatalogs()
      .then(setEquipmentCatalogs)
      .catch(() => setEquipmentCatalogs(null))

    refreshSettingsData()
  }

  function refreshCoreData(filters = equipmentFilters) {
    setStatus('loading')
    refreshAuxiliaryData()

    return Promise.all([getDashboard(), getEquipment(filters)]).then(
      ([dashboardResponse, equipmentResponse]) => {
        setDashboard(dashboardResponse)
        setEquipment(equipmentResponse.data)
        setEquipmentMeta(equipmentResponse.meta)
        setStatus('ready')
      }
    )
  }

  function refreshSelectedLifeSheet(equipmentId = selectedEquipmentId) {
    if (!equipmentId) {
      return Promise.resolve()
    }

    setLifeSheetStatus('loading')
    return getEquipmentLifeSheet(equipmentId)
      .then((response) => {
        setLifeSheet(response)
        setLifeSheetStatus('ready')
      })
      .catch(() => {
        setLifeSheet(null)
        setLifeSheetStatus('error')
      })
  }

  function refreshEquipmentLoans() {
    setEquipmentLoansStatus('loading')
    return getEquipmentLoans()
      .then((loansResponse) => {
        setEquipmentLoans(loansResponse)
        setEquipmentLoansStatus('ready')
        return getRequestableEquipment()
          .then(setRequestableEquipment)
          .catch(() => setRequestableEquipment([]))
      })
      .catch(() => setEquipmentLoansStatus('error'))
  }

  function refreshAlerts() {
    setAlertsStatus('loading')
    return getAlerts()
      .then((response) => {
        setAlerts(response)
        setAlertsStatus('ready')
      })
      .catch(() => setAlertsStatus('error'))
  }

  async function refreshOperationalData() {
    const tasks: Array<Promise<unknown>> = [
      refreshCoreData(),
      refreshEquipmentLoans(),
      refreshSelectedLifeSheet(),
    ]

    if (canViewMaintenance) {
      tasks.push(
        Promise.all([getMaintenanceSchedules(), getMaintenanceRecords(), getEquipmentGroups()]).then(
          ([schedulesResponse, recordsResponse, groupsResponse]) => {
          setMaintenanceSchedules(schedulesResponse)
          setMaintenanceRecords(recordsResponse)
          setEquipmentGroups(groupsResponse)
          setMaintenanceStatus('ready')
          }
        )
      )
    }

    if (canViewAlerts) {
      tasks.push(
        getAlerts().then((response) => {
          setAlerts(response)
          setAlertsStatus('ready')
        })
      )
    }

    await Promise.all(tasks)
  }

  return {
    refreshAlerts,
    refreshAuxiliaryData,
    refreshCoreData,
    refreshDashboard,
    refreshEquipmentLoans,
    refreshOperationalData,
    refreshSelectedLifeSheet,
    refreshSettingsData,
  }
}
