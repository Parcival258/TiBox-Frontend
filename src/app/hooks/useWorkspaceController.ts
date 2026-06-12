import { useEffect } from 'react'
import { emptyDashboard } from '@/app/constants/dashboard'
import { defaultEquipmentFilters } from '@/features/inventory/constants/equipmentFilters'
import { useNotificationInbox } from '@/shared/hooks/useNotificationInbox'
import { useRealtimeAlerts } from '@/shared/hooks/useRealtimeAlerts'
import {
  acknowledgeAlert,
  addAlertNote,
  assignAlert,
  cancelMaintenanceSchedule,
  createEquipment,
  createMaintenanceRecord,
  createMaintenanceSchedule,
  deleteEquipment,
  dismissAlert,
  finishMaintenanceSchedule,
  getAlerts,
  getDashboard,
  getEquipment,
  getEquipmentCatalogs,
  getEquipmentTypes,
  getEquipmentLifeSheet,
  getEquipmentLoans,
  getHeadquarters,
  getLocations,
  getRequestableEquipment,
  getMaintenanceScheduleCatalogs,
  getMaintenanceSchedules,
  markMaintenancePending,
  rescheduleMaintenanceSchedule,
  resolveAlert,
  runAlertChecks,
  selfAssignAlert,
  startMaintenanceSchedule,
  updateEquipment,
} from '@/services/inventory'
import type {
  CreateMaintenanceSchedulePayload,
  Equipment,
  EquipmentFilters,
  EquipmentPayload,
  FinishMaintenanceSchedulePayload,
  MaintenanceSchedule,
  User,
} from '@/shared/types/inventory'
import type { AuthState } from '@/shared/types/ui'
import { alertMetrics } from '@/shared/utils/alertMetrics'
import {
  downloadEquipmentImportTemplate,
  readEquipmentImportFile,
  type EquipmentImportResult,
} from '@/features/inventory/utils/equipmentBulkImport'
import { downloadEquipmentCsv } from '@/features/inventory/utils/equipmentCsv'
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

  useEffect(() => {
    if (authStatus !== 'authenticated') {
      return
    }

    Promise.all([getDashboard(), getEquipment(equipmentFilters)])
      .then(([dashboardResponse, equipmentResponse]) => {
        setDashboard(dashboardResponse)
        setEquipment(equipmentResponse.data)
        setEquipmentMeta(equipmentResponse.meta)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))

    refreshAuxiliaryData()
    refreshEquipmentLoans()
    if (permissions.canViewMaintenance) {
      refreshMaintenanceSchedules()
      getMaintenanceScheduleCatalogs().then(setMaintenanceCatalogs).catch(() => undefined)
    } else {
      setMaintenanceSchedules([])
      setMaintenanceCatalogs(null)
      setMaintenanceStatus('ready')
    }

    if (permissions.canViewAlerts) {
      refreshAlerts()
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
    getEquipment(nextFilters)
      .then((response) => {
        setEquipment(response.data)
        setEquipmentMeta(response.meta)
      })
      .catch(() => setStatus('error'))
    // The current filter snapshot is applied when the preference changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authStatus, equipmentPageSize])

  useEffect(() => {
    if (!selectedEquipmentId || authStatus !== 'authenticated') {
      return
    }

    getEquipmentLifeSheet(selectedEquipmentId)
      .then((response) => {
        setLifeSheet(response)
        setLifeSheetStatus('ready')
      })
      .catch(() => {
        setLifeSheet(null)
        setLifeSheetStatus('error')
      })
  }, [authStatus, selectedEquipmentId, setLifeSheet, setLifeSheetStatus])

  function handleSelectEquipment(equipmentId: string) {
    if (equipmentId === selectedEquipmentId) {
      if (lifeSheetStatus === 'error' || lifeSheetStatus === 'idle') {
        refreshSelectedLifeSheet(equipmentId)
      }

      return
    }

    setSelectedEquipmentId(equipmentId)
    setLifeSheet(null)
    setLifeSheetStatus('loading')
  }

  function openEquipmentDetails(equipmentId: string) {
    setSelectedEquipmentId(equipmentId)
    setLifeSheet(null)
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

  function openCreateEquipment() {
    setEquipmentFormMode('create')
    setEditingEquipment(null)
    setIsEquipmentFormOpen(true)
  }

  function openEditEquipment(equipmentItem: Equipment) {
    setEquipmentFormMode('edit')
    setEditingEquipment(equipmentItem)
    setIsEquipmentFormOpen(true)
  }

  async function handleSubmitEquipment(payload: EquipmentPayload) {
    if (equipmentFormMode === 'create') {
      const createdEquipment = await createEquipment(payload)
      setSelectedEquipmentId(createdEquipment.id)
      await refreshCoreData()
      await refreshSelectedLifeSheet(createdEquipment.id)
      return
    }

    if (!editingEquipment) {
      return
    }

    await updateEquipment(editingEquipment.id, payload)
    await refreshCoreData()

    if (selectedEquipmentId === editingEquipment.id) {
      await refreshSelectedLifeSheet(editingEquipment.id)
    }
  }

  function handleDeleteEquipment(equipmentId: string) {
    return deleteEquipment(equipmentId)
      .then(async () => {
        if (selectedEquipmentId === equipmentId) {
          setSelectedEquipmentId(null)
          setLifeSheet(null)
          setLifeSheetStatus('idle')
        }

        await refreshCoreData()
        if (permissions.canViewMaintenance) {
          refreshMaintenanceSchedules()
        }
        if (permissions.canViewAlerts) {
          refreshAlerts()
        }
      })
      .catch(() => setStatus('error'))
  }

  function refreshCoreData(filters = equipmentFilters) {
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

  function refreshAuxiliaryData() {
    getEquipmentCatalogs()
      .then(setEquipmentCatalogs)
      .catch(() => setEquipmentCatalogs(null))

    refreshSettingsData()
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

  function handleChangeEquipmentFilters(filters: EquipmentFilters) {
    const nextFilters = {
      ...defaultEquipmentFilters,
      ...filters,
    }

    setEquipmentFilters(nextFilters)
    getEquipment(nextFilters)
      .then((response) => {
        setEquipment(response.data)
        setEquipmentMeta(response.meta)
      })
      .catch(() => setStatus('error'))
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

  async function refreshOperationalData() {
    const tasks: Array<Promise<unknown>> = [
      refreshCoreData(),
      refreshEquipmentLoans(),
      refreshSelectedLifeSheet(),
    ]

    if (permissions.canViewMaintenance) {
      tasks.push(getMaintenanceSchedules().then((response) => {
        setMaintenanceSchedules(response)
        setMaintenanceStatus('ready')
      }))
    }

    if (permissions.canViewAlerts) {
      tasks.push(getAlerts().then((response) => {
        setAlerts(response)
        setAlertsStatus('ready')
      }))
    }

    await Promise.all(tasks)
  }

  function refreshMaintenanceSchedules() {
    setMaintenanceStatus('loading')
    getMaintenanceSchedules()
      .then((response) => {
        setMaintenanceSchedules(response)
        setMaintenanceStatus('ready')
      })
      .catch(() => setMaintenanceStatus('error'))
  }

  function refreshEquipmentLoans() {
    setEquipmentLoansStatus('loading')
    return Promise.all([getEquipmentLoans(), getRequestableEquipment()])
      .then(([loansResponse, equipmentResponse]) => {
        setEquipmentLoans(loansResponse)
        setRequestableEquipment(equipmentResponse)
        setEquipmentLoansStatus('ready')
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

  function handleScheduleAction(action: () => Promise<MaintenanceSchedule>) {
    action()
      .then(() => {
        refreshMaintenanceSchedules()
        return getDashboard()
      })
      .then(setDashboard)
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

  async function handleExportEquipment() {
    const filters = {
      ...equipmentFilters,
      page: 1,
      perPage: 100,
    }
    const firstPage = await getEquipment(filters)
    const allEquipment = [...firstPage.data]

    for (let page = 2; page <= firstPage.meta.lastPage; page += 1) {
      const response = await getEquipment({ ...filters, page })
      allEquipment.push(...response.data)
    }

    downloadEquipmentCsv(allEquipment)
  }

  async function handleDownloadEquipmentImportTemplate() {
    downloadEquipmentImportTemplate(equipmentCatalogs)
  }

  async function handleImportEquipment(file: File): Promise<EquipmentImportResult> {
    const parsed = await readEquipmentImportFile(file, equipmentCatalogs)
    const errors = [...parsed.errors]
    let created = 0

    for (const row of parsed.rows) {
      try {
        await createEquipment(row.payload)
        created += 1
      } catch {
        errors.push(`Fila ${row.rowNumber}: no fue posible crear el equipo.`)
      }
    }

    await refreshCoreData()
    showSuccess(
      'Carga masiva procesada',
      `${created} equipo${created === 1 ? '' : 's'} creado${created === 1 ? '' : 's'}.`
    )

    return {
      created,
      errors,
      total: parsed.rows.length,
    }
  }

  function handleRunAlertChecks() {
    setIsRunningAlerts(true)
    runAlertChecks()
      .then(() => {
        refreshAlerts()
        return getDashboard()
      })
      .then(setDashboard)
      .catch(() => setAlertsStatus('error'))
      .finally(() => setIsRunningAlerts(false))
  }

  function handleAlertAction(action: () => Promise<unknown>, message?: string) {
    action()
      .then(() => {
        if (message) {
          showSuccess(message, 'La informacion se actualizo correctamente.')
        }

        return refreshAlerts()
      })
      .catch(() => setAlertsStatus('error'))
  }

  function resetWorkspace() {
    setDashboard(emptyDashboard)
    setEquipment([])
    setEquipmentCatalogs(null)
    setEquipmentTypes([])
    setEquipmentFilters({ ...defaultEquipmentFilters, perPage: equipmentPageSize })
    setEquipmentMeta(null)
    setMaintenanceSchedules([])
    setEquipmentLoans([])
    setRequestableEquipment([])
    setMaintenanceCatalogs(null)
    setAlerts([])
    setEditingEquipment(null)
    setSelectedEquipmentId(null)
    setIsEquipmentFormOpen(false)
    setIsScheduleFormOpen(false)
    setLifeSheet(null)
    setLifeSheetStatus('idle')
    setHeadquarters([])
    setLocations([])
    setMaintenanceStatus('loading')
    setEquipmentLoansStatus('loading')
    setAlertsStatus('loading')
    setActiveView('inventory')
    setStatus('loading')
  }

  useRealtimeAlerts({
    canHandleFailureQueue: permissions.canManageFailureReports,
    canManageAlerts: permissions.canManageAlerts,
    canTrackReportedTickets: permissions.canViewFailureReports,
    canViewAlerts: permissions.canViewAlerts,
    enabled:
      authStatus === 'authenticated' &&
      (permissions.canViewAlerts || permissions.canViewFailureReports),
    onDashboardRefresh: () => getDashboard().then(setDashboard),
    onNotify: notificationInbox.addNotification,
    onRefresh: refreshAlerts,
    onTicketRefresh: refreshOperationalData,
    showSuccess,
    userId: user?.id ?? null,
  })

  const settingsActions = createSettingsActions({ refreshCoreData, refreshSettingsData, showSuccess })
  const loanActions = createLoanActions({
    refreshEquipmentLoans,
    refreshOperationalData,
    showSuccess,
  })
  const equipmentOperationsActions = createEquipmentOperationsActions({
    lifeSheet,
    refreshCoreData,
    refreshOperationalData,
    refreshSelectedLifeSheet,
    selectedEquipmentId,
    showSuccess,
  })

  return {
    actions: {
      addAlertNote,
      assignAlert,
      cancelMaintenanceSchedule,
      dismissAlert,
      finishMaintenanceSchedule,
      handleAlertAction,
      handleChangeEquipmentFilters,
      setEquipmentPageSize: (perPage: number) =>
        handleChangeEquipmentFilters({ ...equipmentFilters, page: 1, perPage }),
      handleCreateSchedule,
      handleDeleteEquipment,
      handleDownloadEquipmentImportTemplate,
      handleExportEquipment,
      handleFinishSchedule,
      handleImportEquipment,
      handleRunAlertChecks,
      handleScheduleAction,
      handleSelectEquipment,
      handleSubmitEquipment,
      markMaintenancePending,
      openCreateEquipment,
      openEquipmentDetails,
      openEditEquipment,
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
