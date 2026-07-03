import { useNotificationInbox } from '@/shared/hooks/useNotificationInbox'
import {
  acknowledgeAlert,
  addAlertNote,
  assignAlert,
  dismissAlert,
  resolveAlert,
  selfAssignAlert,
} from '@/features/alerts/services/alertService'
import {
  cancelMaintenanceSchedule,
  finishMaintenanceSchedule,
  markMaintenancePending,
  rescheduleMaintenanceSchedule,
  startMaintenanceSchedule,
} from '@/features/maintenance/services/maintenanceService'
import type { User } from '@/features/users/types'
import type { AuthState } from '@/shared/types/ui'
import { alertMetrics } from '@/shared/utils/alertMetrics'
import { buildWorkspacePermissions } from '@/app/hooks/workspacePermissions'
import { useInventoryState } from '@/features/inventory/hooks/useInventoryState'
import { useLoansState } from '@/features/loans/hooks/useLoansState'
import { useRealtimeEquipmentLoans } from '@/features/loans/hooks/useRealtimeEquipmentLoans'
import { useMaintenanceState } from '@/features/maintenance/hooks/useMaintenanceState'
import { useAlertsState } from '@/features/alerts/hooks/useAlertsState'
import { useChatState } from '@/features/chat'
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
import { useWorkspaceBootstrapEffects } from './useWorkspaceBootstrapEffects'
import { createWorkspaceControllerNotifications } from './createWorkspaceControllerResult'
import { useWorkspaceRealtimeAlerts } from './useWorkspaceRealtimeAlerts'

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
    equipmentGroups, isScheduleFormOpen, maintenanceCatalogs, maintenanceFilters,
    maintenanceRecords, maintenanceSchedules, maintenanceStatus, setEquipmentGroups,
    setIsScheduleFormOpen, setMaintenanceCatalogs, setMaintenanceFilters,
    setMaintenanceRecords, setMaintenanceSchedules, setMaintenanceStatus,
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
  const chat = useChatState({
    authStatus,
    isChatViewActive: activeView === 'chat',
    onNotify: notificationInbox.addNotification,
    userId: user?.id ?? null,
  })

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
    setEquipmentGroups,
    setEquipmentLoans,
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
  })

  function upsertEquipmentLoan(loan: typeof equipmentLoans[number]) {
    setEquipmentLoans((current) => [
      loan,
      ...current.filter((item) => item.id !== loan.id),
    ])
  }

  const settingsActions = createSettingsActions({
    refreshCoreData: refreshers.refreshCoreData,
    refreshSettingsData: refreshers.refreshSettingsData,
    showSuccess,
  })
  const loanActions = createLoanActions({
    refreshEquipmentLoans: refreshers.refreshEquipmentLoans,
    refreshOperationalData: refreshers.refreshOperationalData,
    showSuccess,
    upsertEquipmentLoan,
  })
  const maintenanceActions = createMaintenanceActions({
    maintenanceFilters,
    refreshDashboard: refreshers.refreshDashboard,
    refreshOperationalData: refreshers.refreshOperationalData,
    setEquipmentGroups,
    setMaintenanceRecords,
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

  useWorkspaceBootstrapEffects({
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
  })

  const resetWorkspace = createWorkspaceResetAction({
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
  })

  useWorkspaceRealtimeAlerts({
    authStatus,
    notificationInbox,
    permissions,
    refreshers,
    showSuccess,
    user,
  })

  useRealtimeEquipmentLoans({
    enabled: authStatus === 'authenticated' && permissions.canViewEquipmentLoans,
    onRefresh: refreshers.refreshEquipmentLoans,
    onUpsert: upsertEquipmentLoan,
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
      refreshMaintenanceRecords: maintenanceActions.refreshMaintenanceRecords,
      handleImportEquipment: inventoryWorkspaceActions.handleImportEquipment,
      handleRestoreEquipment: inventoryWorkspaceActions.handleRestoreEquipment,
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
      setMaintenanceFilters,
      startMaintenanceSchedule,
      acknowledgeAlert,
      ...equipmentOperationsActions,
      ...loanActions,
      ...settingsActions,
      createEquipmentGroup: maintenanceActions.createEquipmentGroup,
      deleteEquipmentGroup: maintenanceActions.deleteEquipmentGroup,
      updateEquipmentGroup: maintenanceActions.updateEquipmentGroup,
      updateMaintenanceReception: maintenanceActions.updateMaintenanceReception,
      updateMaintenanceExecution: maintenanceActions.updateMaintenanceExecution,
      updateMaintenanceClosure: maintenanceActions.updateMaintenanceClosure,
      deleteMaintenanceAttachment: maintenanceActions.deleteMaintenanceAttachment,
      uploadMaintenanceAttachment: maintenanceActions.uploadMaintenanceAttachment,
    },
    metrics,
    chat,
    notifications: createWorkspaceControllerNotifications(notificationInbox),
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
      equipmentGroups,
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
      maintenanceFilters,
      maintenanceRecords,
      maintenanceSchedules,
      maintenanceStatus,
      selectedEquipmentId,
      status,
    },
  }
}
