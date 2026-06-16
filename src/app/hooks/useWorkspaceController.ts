import { useEffect } from 'react'
import { useNotificationInbox } from '@/shared/hooks/useNotificationInbox'
import { useRealtimeAlerts } from '@/shared/hooks/useRealtimeAlerts'
import {
  acknowledgeAlert,
  addAlertNote,
  assignAlert,
  cancelMaintenanceSchedule,
  dismissAlert,
  finishMaintenanceSchedule,
  getMaintenanceScheduleCatalogs,
  markMaintenancePending,
  rescheduleMaintenanceSchedule,
  resolveAlert,
  selfAssignAlert,
  startMaintenanceSchedule,
} from '@/services/inventory'
import type {
  User,
} from '@/shared/types/inventory'
import type { AuthState } from '@/shared/types/ui'
import { alertMetrics } from '@/shared/utils/alertMetrics'
import { buildWorkspacePermissions } from '@/app/hooks/workspacePermissions'
import { useInventoryState } from '@/features/inventory/hooks/useInventoryState'
import { useLoansState } from '@/features/loans/hooks/useLoansState'
import { useMaintenanceState } from '@/features/maintenance/hooks/useMaintenanceState'
import { useAlertsState } from '@/features/alerts/hooks/useAlertsState'
import { useSettingsState } from '@/features/settings/hooks/useSettingsState'
import { useWorkspaceNavigation } from './useWorkspaceNavigation'
import { createSettingsActions } from '@/features/settings/actions/createSettingsActions'
import { createLoanActions } from '@/features/loans/actions/createLoanActions'
import { createEquipmentOperationsActions } from '@/features/inventory/actions/createEquipmentOperationsActions'
import { createInventoryWorkspaceActions } from '@/features/inventory/actions/createInventoryWorkspaceActions'
import { createMaintenanceActions } from '@/features/maintenance/actions/createMaintenanceActions'
import { createAlertActions } from '@/features/alerts/actions/createAlertActions'
import { createWorkspaceRefreshers } from '@/app/actions/createWorkspaceRefreshers'
import { createWorkspaceResetAction } from '@/app/actions/createWorkspaceResetAction'

type UseWorkspaceControllerOptions = {
  authStatus: AuthState
  equipmentPageSize: number
  notificationsEnabled: boolean
  notificationSoundEnabled: boolean
  showSuccess: (message: string, subText?: string) => void
  user: User | null
}

export function useWorkspaceController({
  authStatus,
  equipmentPageSize,
  notificationsEnabled,
  notificationSoundEnabled,
  showSuccess,
  user,
}: UseWorkspaceControllerOptions) {
  const {
    dashboard, editingEquipment, equipment, equipmentCatalogs, equipmentFilters,
    equipmentFormMode, equipmentMeta, isEquipmentFormOpen, lifeSheet, lifeSheetStatus,
    selectedEquipmentId, setDashboard, setEditingEquipment, setEquipment,
    setEquipmentCatalogs, setEquipmentFilters, setEquipmentFormMode, setEquipmentMeta,
    setIsEquipmentFormOpen, setLifeSheet, setLifeSheetStatus, setSelectedEquipmentId,
    setStatus, status,
  } = useInventoryState(equipmentPageSize)
  const { activeView, setActiveView } = useWorkspaceNavigation()
  const { equipmentTypes, headquarters, locations, setEquipmentTypes, setHeadquarters, setLocations } =
    useSettingsState()
  const {
    isScheduleFormOpen, maintenanceCatalogs, maintenanceSchedules, maintenanceStatus,
    setIsScheduleFormOpen, setMaintenanceCatalogs, setMaintenanceSchedules, setMaintenanceStatus,
  } = useMaintenanceState()
  const {
    equipmentLoans, equipmentLoansStatus, requestableEquipment, setEquipmentLoans,
    setEquipmentLoansStatus, setRequestableEquipment,
  } = useLoansState()
  const { alerts, alertsStatus, isRunningAlerts, setAlerts, setAlertsStatus, setIsRunningAlerts } =
    useAlertsState()
  const notificationInbox = useNotificationInbox(
    user?.id ?? null,
    notificationsEnabled,
    notificationSoundEnabled
  )

  const permissions = buildWorkspacePermissions(user)

  const metrics = alertMetrics({
    alerts,
    canManageAlerts: permissions.canManageAlerts,
    userId: user?.id ?? null,
  })

  const refreshers = createWorkspaceRefreshers({
    canViewAlerts: permissions.canViewAlerts,
    canViewMaintenance: permissions.canViewMaintenance,
    equipmentFilters,
    selectedEquipmentId,
    setAlerts,
    setAlertsStatus,
    setDashboard,
    setEquipment,
    setEquipmentCatalogs,
    setEquipmentLoans,
    setEquipmentLoansStatus,
    setEquipmentMeta,
    setEquipmentTypes,
    setHeadquarters,
    setLifeSheet,
    setLifeSheetStatus,
    setLocations,
    setMaintenanceSchedules,
    setMaintenanceStatus,
    setRequestableEquipment,
    setStatus,
  })

  const settingsActions = createSettingsActions({
    refreshCoreData: refreshers.refreshCoreData,
    refreshSettingsData: refreshers.refreshSettingsData,
    showSuccess,
  })
  const loanActions = createLoanActions({
    refreshEquipmentLoans: refreshers.refreshEquipmentLoans,
    refreshOperationalData: refreshers.refreshOperationalData,
    showSuccess,
  })
  const maintenanceActions = createMaintenanceActions({
    refreshDashboard: refreshers.refreshDashboard,
    refreshOperationalData: refreshers.refreshOperationalData,
    setMaintenanceSchedules,
    setMaintenanceStatus,
    showSuccess,
  })
  const alertActions = createAlertActions({
    refreshAlerts: refreshers.refreshAlerts,
    refreshDashboard: refreshers.refreshDashboard,
    setAlertsStatus,
    setIsRunningAlerts,
    showSuccess,
  })

  useEffect(() => {
    if (authStatus !== 'authenticated') {
      return
    }

    refreshers.refreshCoreData()
      .catch(() => setStatus('error'))

    refreshers.refreshEquipmentLoans()
    if (permissions.canViewMaintenance) {
      maintenanceActions.refreshMaintenanceSchedules()
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

  const resetWorkspace = createWorkspaceResetAction({
    equipmentPageSize,
    setActiveView,
    setAlerts,
    setAlertsStatus,
    setDashboard,
    setEditingEquipment,
    setEquipment,
    setEquipmentCatalogs,
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
    setMaintenanceSchedules,
    setMaintenanceStatus,
    setRequestableEquipment,
    setSelectedEquipmentId,
    setStatus,
  })

  useRealtimeAlerts({
    canHandleFailureQueue: permissions.canManageFailureReports,
    canManageAlerts: permissions.canManageAlerts,
    canTrackReportedTickets: permissions.canViewFailureReports,
    canViewAlerts: permissions.canViewAlerts,
    enabled:
      authStatus === 'authenticated' &&
      (permissions.canViewAlerts || permissions.canViewFailureReports),
    onDashboardRefresh: refreshers.refreshDashboard,
    onNotify: notificationInbox.addNotification,
    onRefresh: refreshers.refreshAlerts,
    onTicketRefresh: refreshers.refreshOperationalData,
    showSuccess,
    userId: user?.id ?? null,
  })

  const equipmentOperationsActions = createEquipmentOperationsActions({
    lifeSheet,
    refreshCoreData: refreshers.refreshCoreData,
    refreshOperationalData: refreshers.refreshOperationalData,
    refreshSelectedLifeSheet: refreshers.refreshSelectedLifeSheet,
    selectedEquipmentId,
    showSuccess,
  })
  const inventoryWorkspaceActions = createInventoryWorkspaceActions({
    canViewAlerts: permissions.canViewAlerts,
    canViewMaintenance: permissions.canViewMaintenance,
    editingEquipment,
    equipmentCatalogs,
    equipmentFilters,
    equipmentFormMode,
    lifeSheetStatus,
    refreshAlerts: refreshers.refreshAlerts,
    refreshCoreData: refreshers.refreshCoreData,
    refreshMaintenanceSchedules: maintenanceActions.refreshMaintenanceSchedules,
    refreshSelectedLifeSheet: refreshers.refreshSelectedLifeSheet,
    selectedEquipmentId,
    setEditingEquipment,
    setEquipment,
    setEquipmentFilters,
    setEquipmentFormMode,
    setEquipmentMeta,
    setIsEquipmentFormOpen,
    setLifeSheet,
    setLifeSheetStatus,
    setSelectedEquipmentId,
    setStatus,
    showSuccess,
  })

  return {
    actions: {
      addAlertNote,
      assignAlert,
      cancelMaintenanceSchedule,
      dismissAlert,
      finishMaintenanceSchedule,
      handleAlertAction: alertActions.handleAlertAction,
      handleChangeEquipmentFilters: inventoryWorkspaceActions.handleChangeEquipmentFilters,
      setEquipmentPageSize: (perPage: number) =>
        inventoryWorkspaceActions.handleChangeEquipmentFilters({ ...equipmentFilters, page: 1, perPage }),
      handleCreateSchedule: maintenanceActions.handleCreateSchedule,
      handleDeleteEquipment: inventoryWorkspaceActions.handleDeleteEquipment,
      handleDownloadEquipmentImportTemplate: inventoryWorkspaceActions.handleDownloadEquipmentImportTemplate,
      handleExportEquipment: inventoryWorkspaceActions.handleExportEquipment,
      handleFinishSchedule: maintenanceActions.handleFinishSchedule,
      handleImportEquipment: inventoryWorkspaceActions.handleImportEquipment,
      handleRunAlertChecks: alertActions.handleRunAlertChecks,
      handleScheduleAction: maintenanceActions.handleScheduleAction,
      handleSelectEquipment: inventoryWorkspaceActions.handleSelectEquipment,
      handleSubmitEquipment: inventoryWorkspaceActions.handleSubmitEquipment,
      markMaintenancePending,
      openCreateEquipment: inventoryWorkspaceActions.openCreateEquipment,
      openEquipmentDetails: inventoryWorkspaceActions.openEquipmentDetails,
      openEditEquipment: inventoryWorkspaceActions.openEditEquipment,
      resetWorkspace,
      rescheduleMaintenanceSchedule,
      resolveAlert,
      selfAssignAlert,
      setActiveView,
      setIsEquipmentFormOpen,
      setIsScheduleFormOpen,
      startMaintenanceSchedule,
      acknowledgeAlert,
      ...equipmentOperationsActions,
      ...loanActions,
      ...settingsActions,
    },
    metrics,
    notifications: {
      clear: notificationInbox.clearNotifications,
      items: notificationInbox.notifications,
      markAllAsRead: notificationInbox.markAllAsRead,
      unreadCount: notificationInbox.unreadCount,
    },
    permissions,
    state: {
      activeView,
      alerts,
      alertsStatus,
      dashboard,
      editingEquipment,
      equipment,
      equipmentCatalogs,
      equipmentFilters,
      equipmentFormMode,
      equipmentLoans,
      equipmentLoansStatus,
      equipmentMeta,
      equipmentTypes,
      requestableEquipment,
      headquarters,
      locations,
      isEquipmentFormOpen,
      isRunningAlerts,
      isScheduleFormOpen,
      lifeSheet,
      lifeSheetStatus,
      maintenanceCatalogs,
      maintenanceSchedules,
      maintenanceStatus,
      selectedEquipmentId,
      status,
    },
  }
}
