import { useEffect, useState } from 'react'
import { emptyDashboard } from '../constants/dashboard'
import { defaultEquipmentFilters } from '../constants/equipmentFilters'
import { useNotificationInbox } from './useNotificationInbox'
import { useRealtimeAlerts } from './useRealtimeAlerts'
import {
  acknowledgeAlert,
  addAlertNote,
  assignAlert,
  assignEquipment,
  cancelMaintenanceSchedule,
  createEquipmentLoan,
  createEquipment,
  createFailureReport,
  createHeadquarter,
  createLocation,
  createMaintenanceRecord,
  createMaintenanceSchedule,
  deactivateHeadquarter,
  deactivateLocation,
  deleteEquipment,
  deleteEquipmentAttachment,
  dismissAlert,
  finishMaintenanceSchedule,
  getAlerts,
  getDashboard,
  getEquipment,
  getEquipmentCatalogs,
  getEquipmentLifeSheet,
  getEquipmentLoans,
  getHeadquarters,
  getLocations,
  getMaintenanceScheduleCatalogs,
  getMaintenanceSchedules,
  markMaintenancePending,
  rescheduleMaintenanceSchedule,
  resolveAlert,
  resolveFailureReport,
  returnEquipmentLoan,
  returnEquipment,
  runAlertChecks,
  selfAssignAlert,
  startMaintenanceSchedule,
  updateHeadquarter,
  updateLocation,
  updateEquipment,
  uploadEquipmentAttachment,
} from '../services/inventory'
import type {
  Alert,
  CreateEquipmentLoanPayload,
  CreateMaintenanceSchedulePayload,
  DashboardSummary,
  Equipment,
  EquipmentCatalogs,
  EquipmentFilters,
  EquipmentLifeSheet as EquipmentLifeSheetType,
  EquipmentLoan,
  EquipmentPayload,
  FinishMaintenanceSchedulePayload,
  Headquarter,
  HeadquarterPayload,
  Location,
  LocationPayload,
  MaintenanceSchedule,
  MaintenanceScheduleCatalogs,
  PaginationMeta,
  ReturnEquipmentLoanPayload,
  User,
} from '../types/inventory'
import type { ActiveView, AuthState, LifeSheetState, LoadState, ModuleState } from '../types/ui'
import { alertMetrics } from '../utils/alertMetrics'
import {
  downloadEquipmentImportTemplate,
  readEquipmentImportFile,
  type EquipmentImportResult,
} from '../utils/equipmentBulkImport'
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
  const [locations, setLocations] = useState<Location[]>([])
  const [maintenanceSchedules, setMaintenanceSchedules] = useState<MaintenanceSchedule[]>([])
  const [maintenanceCatalogs, setMaintenanceCatalogs] =
    useState<MaintenanceScheduleCatalogs | null>(null)
  const [maintenanceStatus, setMaintenanceStatus] = useState<ModuleState>('loading')
  const [equipmentLoans, setEquipmentLoans] = useState<EquipmentLoan[]>([])
  const [equipmentLoansStatus, setEquipmentLoansStatus] = useState<ModuleState>('loading')
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [alertsStatus, setAlertsStatus] = useState<ModuleState>('loading')
  const [isRunningAlerts, setIsRunningAlerts] = useState(false)
  const [equipmentFormMode, setEquipmentFormMode] = useState<'create' | 'edit'>('create')
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null)
  const [isEquipmentFormOpen, setIsEquipmentFormOpen] = useState(false)
  const [isScheduleFormOpen, setIsScheduleFormOpen] = useState(false)
  const notificationInbox = useNotificationInbox(user?.id ?? null)

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
    canViewFailureReports: can(user, 'failure_reports.view'),
    canReturnEquipment: can(user, 'equipment.return'),
    canUpdateEquipment: can(user, 'equipment.update'),
    canViewEquipmentLoans: can(user, 'equipment.view'),
    canUpdateMaintenance: can(user, 'maintenance.update'),
    canViewAlerts: can(user, 'alerts.view'),
    canViewMaintenance: can(user, 'maintenance.view'),
    canManageHeadquarters: can(user, 'settings.headquarters.manage'),
    canManageLocations: can(user, 'settings.locations.manage'),
    canManageUsers: user?.role?.slug === 'admin' && can(user, 'users.update'),
    canViewSettings: can(user, 'settings.headquarters.view') || can(user, 'settings.locations.view'),
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
    return getEquipmentLoans()
      .then((response) => {
        setEquipmentLoans(response)
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
    setEquipmentFilters(defaultEquipmentFilters)
    setEquipmentMeta(null)
    setMaintenanceSchedules([])
    setEquipmentLoans([])
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
      createHeadquarter: async (payload: HeadquarterPayload) => {
        await createHeadquarter(payload)
        await refreshSettingsData()
        await refreshCoreData()
        showSuccess('Sede creada', 'La sede quedo disponible para asignar ubicaciones.')
      },
      createLocation: async (payload: LocationPayload) => {
        await createLocation(payload)
        await refreshSettingsData()
        await refreshCoreData()
        showSuccess('Ubicacion creada', 'La ubicacion quedo disponible para los equipos.')
      },
      deactivateHeadquarter: async (headquarterId: string) => {
        await deactivateHeadquarter(headquarterId)
        await refreshSettingsData()
        await refreshCoreData()
        showSuccess('Sede desactivada', 'La sede ya no queda activa para nuevas asignaciones.')
      },
      deactivateLocation: async (locationId: string) => {
        await deactivateLocation(locationId)
        await refreshSettingsData()
        await refreshCoreData()
        showSuccess('Ubicacion desactivada', 'La ubicacion ya no queda activa para nuevas asignaciones.')
      },
      acknowledgeAlert,
      assignEquipment: async (userId: string, notes?: string) => {
        if (!selectedEquipmentId) return
        await assignEquipment(selectedEquipmentId, userId, notes)
        await refreshOperationalData()
      },
      createEquipmentLoan: async (payload: CreateEquipmentLoanPayload) => {
        await createEquipmentLoan(payload)
        showSuccess('Prestamo registrado', 'El seguimiento quedo activo hasta la devolucion.')
        await refreshOperationalData()
      },
      createFailure: async (payload: { title: string; description: string; priority: string }) => {
        if (!selectedEquipmentId) return
        await createFailureReport({
          equipmentId: selectedEquipmentId,
          ...payload,
        })
        showSuccess('Falla reportada', 'Se creo una alerta para que el equipo tecnico la atienda.')
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
      returnEquipmentLoan: async (loanId: string, payload: ReturnEquipmentLoanPayload) => {
        await returnEquipmentLoan(loanId, payload)
        showSuccess('Devolucion registrada', 'El prestamo quedo cerrado correctamente.')
        await refreshOperationalData()
      },
      uploadAttachment: async (file: File) => {
        if (!selectedEquipmentId) return
        await uploadEquipmentAttachment(selectedEquipmentId, file)
        await refreshOperationalData()
      },
      updateHeadquarter: async (headquarterId: string, payload: HeadquarterPayload) => {
        await updateHeadquarter(headquarterId, payload)
        await refreshSettingsData()
        await refreshCoreData()
        showSuccess('Sede actualizada', 'Los cambios quedaron guardados.')
      },
      updateLocation: async (locationId: string, payload: LocationPayload) => {
        await updateLocation(locationId, payload)
        await refreshSettingsData()
        await refreshCoreData()
        showSuccess('Ubicacion actualizada', 'Los cambios quedaron guardados.')
      },
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

function downloadEquipmentCsv(equipment: Equipment[]) {
  const headers = [
    'Codigo',
    'Serial',
    'Tipo',
    'Marca',
    'Modelo',
    'Estado',
    'Propiedad',
    'IP',
    'MAC',
    'Procesador',
    'Almacenamiento',
    'Sede',
    'Ubicacion',
    'Responsable',
    'Responsable secundario',
    'Ultimo mantenimiento',
    'Proximo mantenimiento',
    'Notas',
  ]
  const rows = equipment.map((item) => [
    item.internalCode,
    item.serial,
    item.type,
    item.brand,
    item.model,
    item.status,
    item.ownershipType,
    item.ipAddresses,
    item.macAddress,
    item.processor,
    [item.storageType, item.storageCapacityGb ? `${item.storageCapacityGb} GB` : null]
      .filter(Boolean)
      .join(' / '),
    item.headquarter?.name,
    [item.location?.area, item.location?.office].filter(Boolean).join(' / '),
    item.currentResponsible?.name,
    item.secondaryResponsible?.name,
    item.lastMaintenanceAt,
    item.nextMaintenanceAt,
    item.notes,
  ])
  const csv = [headers, ...rows].map((row) => row.map(csvCell).join(';')).join('\r\n')
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `inventario-equipos-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

function csvCell(value: string | number | null | undefined) {
  const text = value === null || value === undefined ? '' : String(value)

  return `"${text.replace(/"/g, '""')}"`
}
