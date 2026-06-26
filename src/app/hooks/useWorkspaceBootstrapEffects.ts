import { useEffect } from 'react'
import { getMaintenanceScheduleCatalogs } from '@/features/maintenance/services/maintenanceService'
import type { EquipmentFilters } from '@/features/inventory/types/equipmentCore'
import type { MaintenanceScheduleCatalogs } from '@/features/maintenance/types'
import type { AuthState, ModuleState } from '@/shared/types/ui'

type WorkspaceBootstrapPermissions = {
  canViewAlerts: boolean
  canViewMaintenance: boolean
}

type WorkspaceBootstrapRefreshers = {
  refreshAlerts: () => Promise<unknown>
  refreshCoreData: (filters?: EquipmentFilters) => Promise<unknown>
  refreshEquipmentLoans: () => Promise<unknown>
  refreshSelectedLifeSheet: (equipmentId?: string | null) => Promise<unknown>
}

type WorkspaceBootstrapMaintenanceActions = {
  refreshMaintenanceRecords: () => void | Promise<unknown>
  refreshMaintenanceSchedules: () => void | Promise<unknown>
}

type UseWorkspaceBootstrapEffectsOptions = {
  authStatus: AuthState
  equipmentFilters: EquipmentFilters
  equipmentPageSize: number
  maintenanceActions: WorkspaceBootstrapMaintenanceActions
  permissions: WorkspaceBootstrapPermissions
  refreshers: WorkspaceBootstrapRefreshers
  selectedEquipmentId: string | null
  setAlerts: (alerts: []) => void
  setAlertsStatus: (status: ModuleState) => void
  setEquipmentFilters: (filters: EquipmentFilters) => void
  setLifeSheet: (lifeSheet: null) => void
  setLifeSheetStatus: (status: 'loading' | 'ready' | 'error' | 'idle') => void
  setMaintenanceCatalogs: (catalogs: MaintenanceScheduleCatalogs | null) => void
  setMaintenanceSchedules: (schedules: []) => void
  setMaintenanceStatus: (status: ModuleState) => void
  setStatus: (status: 'loading' | 'ready' | 'error') => void
}

export function useWorkspaceBootstrapEffects({
  authStatus,
  equipmentFilters,
  equipmentPageSize,
  maintenanceActions,
  permissions,
  refreshers,
  selectedEquipmentId,
  setAlerts,
  setAlertsStatus,
  setEquipmentFilters,
  setLifeSheet,
  setLifeSheetStatus,
  setMaintenanceCatalogs,
  setMaintenanceSchedules,
  setMaintenanceStatus,
  setStatus,
}: UseWorkspaceBootstrapEffectsOptions) {
  useEffect(() => {
    if (authStatus !== 'authenticated') {
      return
    }

    refreshers.refreshCoreData()
      .catch(() => setStatus('error'))

    refreshers.refreshEquipmentLoans()
    if (permissions.canViewMaintenance) {
      maintenanceActions.refreshMaintenanceSchedules()
      maintenanceActions.refreshMaintenanceRecords()
      getMaintenanceScheduleCatalogs().then(setMaintenanceCatalogs).catch(() => undefined)
    } else {
      setMaintenanceSchedules([])
      setMaintenanceCatalogs(null)
      setMaintenanceStatus('ready')
    }

    if (permissions.canViewAlerts) {
      refreshers.refreshAlerts()
    } else {
      setAlerts([])
      setAlertsStatus('ready')
    }
    // Bootstrap is intentionally restarted only when authentication changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authStatus])

  useEffect(() => {
    if (authStatus !== 'authenticated' || equipmentFilters.perPage === equipmentPageSize) {
      return
    }

    const nextFilters = { ...equipmentFilters, page: 1, perPage: equipmentPageSize }
    setEquipmentFilters(nextFilters)
    refreshers.refreshCoreData(nextFilters)
      .catch(() => setStatus('error'))
    // The current filter snapshot is applied when the preference changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authStatus, equipmentPageSize])

  useEffect(() => {
    if (!selectedEquipmentId || authStatus !== 'authenticated') {
      return
    }

    refreshers.refreshSelectedLifeSheet(selectedEquipmentId)
    // The selected life sheet is refreshed only when the active equipment changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authStatus, selectedEquipmentId, setLifeSheet, setLifeSheetStatus])
}
