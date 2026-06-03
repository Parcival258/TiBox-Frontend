import { useEffect, useState } from 'react'
import { emptyDashboard } from '../constants/dashboard'
import { defaultEquipmentFilters } from '../constants/equipmentFilters'
import {
  acknowledgeAlert,
  addAlertNote,
  assignAlert,
  assignEquipment,
  cancelMaintenanceSchedule,
  createEquipment,
  createFailureReport,
  createMaintenanceRecord,
  createMaintenanceSchedule,
  deleteEquipment,
  deleteEquipmentAttachment,
  dismissAlert,
  finishMaintenanceSchedule,
  getAlerts,
  getDashboard,
  getEquipment,
  getEquipmentCatalogs,
  getEquipmentLifeSheet,
  getHeadquarters,
  getMaintenanceScheduleCatalogs,
  getMaintenanceSchedules,
  markMaintenancePending,
  rescheduleMaintenanceSchedule,
  resolveAlert,
  resolveFailureReport,
  returnEquipment,
  runAlertChecks,
  selfAssignAlert,
  startMaintenanceSchedule,
  updateEquipment,
  uploadEquipmentAttachment,
} from '../services/inventory'
import type {
  Alert,
  CreateMaintenanceSchedulePayload,
  DashboardSummary,
  Equipment,
  EquipmentCatalogs,
  EquipmentFilters,
  EquipmentLifeSheet as EquipmentLifeSheetType,
  EquipmentPayload,
  Headquarter,
  MaintenanceSchedule,
  MaintenanceScheduleCatalogs,
  PaginationMeta,
  User,
} from '../types/inventory'
import type { ActiveView, AuthState, LifeSheetState, LoadState, ModuleState } from '../types/ui'
import { alertMetrics } from '../utils/alertMetrics'
import { can } from '../utils/permissions'

type UseInventoryWorkspaceOptions = {
  authStatus: AuthState
  showSuccess: (message: string, subText?: string) => void
  user: User | null
}

export function useInventoryWorkspace({
  authStatus,
  showSuccess,
  user,
}: UseInventoryWorkspaceOptions) {
  const [status, setStatus] = useState<LoadState>('loading')
  const [dashboard, setDashboard] = useState<DashboardSummary>(emptyDashboard)
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [equipmentCatalogs, setEquipmentCatalogs] = useState<EquipmentCatalogs | null>(null)
  const [equipmentFilters, setEquipmentFilters] =
    useState<EquipmentFilters>(defaultEquipmentFilters)
  const [equipmentMeta, setEquipmentMeta] = useState<PaginationMeta | null>(null)
  const [activeView, setActiveView] = useState<ActiveView>('inventory')
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null)
  const [lifeSheet, setLifeSheet] = useState<EquipmentLifeSheetType | null>(null)
  const [lifeSheetStatus, setLifeSheetStatus] = useState<LifeSheetState>('idle')
  const [headquarters, setHeadquarters] = useState<Headquarter[]>([])
  const [maintenanceSchedules, setMaintenanceSchedules] = useState<MaintenanceSchedule[]>([])
  const [maintenanceCatalogs, setMaintenanceCatalogs] =
    useState<MaintenanceScheduleCatalogs | null>(null)
  const [maintenanceStatus, setMaintenanceStatus] = useState<ModuleState>('loading')
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [alertsStatus, setAlertsStatus] = useState<ModuleState>('loading')
  const [isRunningAlerts, setIsRunningAlerts] = useState(false)
  const [equipmentFormMode, setEquipmentFormMode] = useState<'create' | 'edit'>('create')
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null)
  const [isEquipmentFormOpen, setIsEquipmentFormOpen] = useState(false)
  const [isScheduleFormOpen, setIsScheduleFormOpen] = useState(false)

  const permissions = {
    canAssignEquipment: can(user, 'equipment.assign'),
    canCloseMaintenance: can(user, 'maintenance.close'),
    canCreateEquipment: can(user, 'equipment.create'),
    canCreateFailureReports: can(user, 'failure_reports.create'),
    canCreateMaintenance: can(user, 'maintenance.create'),
    canDeleteEquipment: can(user, 'equipment.delete'),
    canManageAlerts: can(user, 'alerts.manage'),
    canManageEquipmentAttachments: can(user, 'equipment.attachments.manage'),
    canManageFailureReports: can(user, 'failure_reports.manage'),
    canReturnEquipment: can(user, 'equipment.return'),
    canUpdateEquipment: can(user, 'equipment.update'),
    canUpdateMaintenance: can(user, 'maintenance.update'),
    canViewAlerts: can(user, 'alerts.view'),
    canViewMaintenance: can(user, 'maintenance.view'),
  }

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
  }, [authStatus])

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
  }, [authStatus, selectedEquipmentId])

  function handleSelectEquipment(equipmentId: string) {
    if (equipmentId === selectedEquipmentId) {
      if (lifeSheetStatus === 'error') {
        refreshSelectedLifeSheet(equipmentId)
      }

      return
    }

    setSelectedEquipmentId(equipmentId)
    setLifeSheet(null)
    setLifeSheetStatus('loading')
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
    const shouldDelete = window.confirm('Retirar este equipo del inventario?')

    if (!shouldDelete) {
      return
    }

    deleteEquipment(equipmentId)
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

    getHeadquarters()
      .then(setHeadquarters)
      .catch(() => setHeadquarters([]))
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

  function refreshAlerts() {
    setAlertsStatus('loading')
    getAlerts()
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
    setEquipmentFilters(defaultEquipmentFilters)
    setEquipmentMeta(null)
    setMaintenanceSchedules([])
    setMaintenanceCatalogs(null)
    setAlerts([])
    setEditingEquipment(null)
    setSelectedEquipmentId(null)
    setIsEquipmentFormOpen(false)
    setIsScheduleFormOpen(false)
    setLifeSheet(null)
    setLifeSheetStatus('idle')
    setHeadquarters([])
    setMaintenanceStatus('loading')
    setAlertsStatus('loading')
    setActiveView('inventory')
    setStatus('loading')
  }

  return {
    actions: {
      addAlertNote,
      assignAlert,
      cancelMaintenanceSchedule,
      dismissAlert,
      finishMaintenanceSchedule,
      handleAlertAction,
      handleChangeEquipmentFilters,
      handleCreateSchedule,
      handleDeleteEquipment,
      handleRunAlertChecks,
      handleScheduleAction,
      handleSelectEquipment,
      handleSubmitEquipment,
      markMaintenancePending,
      openCreateEquipment,
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
      assignEquipment: async (userId: string, notes?: string) => {
        if (!selectedEquipmentId) return
        await assignEquipment(selectedEquipmentId, userId, notes)
        await refreshOperationalData()
      },
      createFailure: async (payload: { title: string; description: string; priority: string }) => {
        if (!selectedEquipmentId) return
        await createFailureReport({
          equipmentId: selectedEquipmentId,
          ...payload,
        })
        await refreshOperationalData()
      },
      createMaintenanceRecord: async (payload: {
        actionsTaken?: string
        cost?: number
        description?: string
        diagnosis?: string
        maintenanceType: 'preventive' | 'corrective'
        nextMaintenanceAt?: string
        performedBy?: string
        priority: string
      }) => {
        if (!selectedEquipmentId) return
        await createMaintenanceRecord({
          equipmentId: selectedEquipmentId,
          status: 'completed',
          ...payload,
        })
        await refreshOperationalData()
      },
      deleteAttachment: async (attachmentId: string) => {
        if (!lifeSheet) return
        await deleteEquipmentAttachment(lifeSheet.equipment.id, attachmentId)
        await refreshSelectedLifeSheet(lifeSheet.equipment.id)
        await refreshCoreData()
      },
      resolveFailure: async (failureReportId: string) => {
        await resolveFailureReport(failureReportId)
        showSuccess('Falla resuelta', 'La falla y su alerta asociada quedaron cerradas.')
        await refreshOperationalData()
      },
      resolveFailureReport,
      returnEquipment: async (notes?: string) => {
        if (!selectedEquipmentId) return
        await returnEquipment(selectedEquipmentId, notes)
        await refreshOperationalData()
      },
      uploadAttachment: async (file: File) => {
        if (!selectedEquipmentId) return
        await uploadEquipmentAttachment(selectedEquipmentId, file)
        await refreshOperationalData()
      },
    },
    metrics,
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
      equipmentMeta,
      headquarters,
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
