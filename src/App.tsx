import { useEffect, useState } from 'react'
import { AlertCenter } from './components/AlertCenter'
import { DashboardHeader } from './components/DashboardHeader'
import { EquipmentFormModal } from './components/EquipmentFormModal'
import { EquipmentLifeSheet } from './components/EquipmentLifeSheet'
import { EquipmentOperationsPanel } from './components/EquipmentOperationsPanel'
import { EquipmentTable } from './components/EquipmentTable'
import { HeadquartersPanel } from './components/HeadquartersPanel'
import { LandingPage } from './components/LandingPage'
import { LoginPanel } from './components/LoginPanel'
import { LoginLoader } from './components/Loaders'
import { MaintenanceScheduleBoard } from './components/MaintenanceScheduleBoard'
import { MaintenanceScheduleFormModal } from './components/MaintenanceScheduleFormModal'
import { MetricGrid } from './components/MetricGrid'
import { emptyDashboard } from './constants/dashboard'
import { getCurrentUser, login, logout } from './services/auth'
import {
  acknowledgeAlert,
  assignAlert,
  assignEquipment,
  cancelMaintenanceSchedule,
  createEquipment,
  createFailureReport,
  createMaintenanceRecord,
  createMaintenanceSchedule,
  deleteEquipmentAttachment,
  deleteEquipment,
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
  returnEquipment,
  runAlertChecks,
  selfAssignAlert,
  startMaintenanceSchedule,
  updateEquipment,
  uploadEquipmentAttachment,
} from './services/inventory'
import type {
  Alert,
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
} from './types/inventory'
import { can } from './utils/permissions'
import './App.css'

type LoadState = 'loading' | 'ready' | 'error'
type AuthState = 'checking' | 'authenticated' | 'guest' | 'submitting'
type LifeSheetState = 'idle' | 'loading' | 'ready' | 'error'
type ModuleState = 'loading' | 'ready' | 'error'
type ActiveView = 'inventory' | 'maintenance' | 'alerts'
type ThemeMode = 'dark' | 'light'

const defaultEquipmentFilters: EquipmentFilters = {
  orderBy: 'createdAt',
  orderDirection: 'desc',
  page: 1,
  perPage: 10,
}

function App() {
  const [authStatus, setAuthStatus] = useState<AuthState>('checking')
  const [showLogin, setShowLogin] = useState(false)
  const [status, setStatus] = useState<LoadState>('loading')
  const [user, setUser] = useState<User | null>(null)
  const [loginError, setLoginError] = useState<string | null>(null)
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
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const savedTheme = window.localStorage.getItem('inventory-theme')
    return savedTheme === 'light' ? 'light' : 'dark'
  })

  const canViewMaintenance = can(user, 'maintenance.view')
  const canCreateMaintenance = can(user, 'maintenance.create')
  const canUpdateMaintenance = can(user, 'maintenance.update')
  const canCloseMaintenance = can(user, 'maintenance.close')
  const canViewAlerts = can(user, 'alerts.view')
  const canManageAlerts = can(user, 'alerts.manage')
  const canCreateEquipment = can(user, 'equipment.create')
  const canUpdateEquipment = can(user, 'equipment.update')
  const canDeleteEquipment = can(user, 'equipment.delete')
  const canAssignEquipment = can(user, 'equipment.assign')
  const canReturnEquipment = can(user, 'equipment.return')
  const canManageEquipmentAttachments = can(user, 'equipment.attachments.manage')
  const canCreateFailureReports = can(user, 'failure_reports.create')

  useEffect(() => {
    getCurrentUser()
      .then(({ user: currentUser }) => {
        setUser(currentUser)
        setAuthStatus('authenticated')
      })
      .catch(() => setAuthStatus('guest'))
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem('inventory-theme', theme)
  }, [theme])

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
    if (canViewMaintenance) {
      refreshMaintenanceSchedules()
      getMaintenanceScheduleCatalogs().then(setMaintenanceCatalogs).catch(() => undefined)
    } else {
      setMaintenanceSchedules([])
      setMaintenanceCatalogs(null)
      setMaintenanceStatus('ready')
    }

    if (canViewAlerts) {
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
        if (canViewMaintenance) {
          refreshMaintenanceSchedules()
        }
        if (canViewAlerts) {
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

    if (canViewMaintenance) {
      tasks.push(getMaintenanceSchedules().then((response) => {
        setMaintenanceSchedules(response)
        setMaintenanceStatus('ready')
      }))
    }

    if (canViewAlerts) {
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

  async function handleCreateSchedule(payload: Parameters<typeof createMaintenanceSchedule>[0]) {
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

  function handleAlertAction(action: () => Promise<Alert>) {
    action()
      .then(() => refreshAlerts())
      .catch(() => setAlertsStatus('error'))
  }

  function handleLogin(email: string, password: string) {
    setAuthStatus('submitting')
    setLoginError(null)

    login(email, password)
      .then(({ user: authenticatedUser }) => {
        setUser(authenticatedUser)
        setStatus('loading')
        setAuthStatus('authenticated')
      })
      .catch(() => {
        setLoginError('Credenciales inválidas o backend no disponible.')
        setAuthStatus('guest')
      })
  }

  function handleLogout() {
    logout().finally(() => {
      setUser(null)
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
      setShowLogin(false)
      setAuthStatus('guest')
    })
  }

  if (authStatus === 'checking') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5 text-sm text-slate-300">
        <LoginLoader label="Validando sesion..." />
      </main>
    )
  }

  if (authStatus === 'guest' || authStatus === 'submitting') {
    if (!showLogin) {
      return <LandingPage onEnter={() => setShowLogin(true)} />
    }

    return (
      <LoginPanel
        error={loginError}
        isSubmitting={authStatus === 'submitting'}
        onSubmit={handleLogin}
      />
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col px-4 py-6 sm:px-6 xl:px-8">
        <DashboardHeader
          status={status}
          theme={theme}
          userName={user?.name ?? 'Usuario'}
          onLogout={handleLogout}
          onToggleTheme={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
        />
        <MetricGrid dashboard={dashboard} />
        <nav className="mb-6 flex flex-wrap gap-2">
          <TabButton
            active={activeView === 'inventory'}
            label="Inventario"
            onClick={() => setActiveView('inventory')}
          />
          {canViewMaintenance && (
            <TabButton
              active={activeView === 'maintenance'}
              label="Cronograma"
              onClick={() => setActiveView('maintenance')}
            />
          )}
          {canViewAlerts && (
            <TabButton
              active={activeView === 'alerts'}
              label="Alertas"
              onClick={() => setActiveView('alerts')}
            />
          )}
        </nav>

        {activeView === 'inventory' && (
          <section className="grid flex-1 gap-6 xl:grid-cols-[minmax(0,1fr)_420px] 2xl:grid-cols-[minmax(0,1fr)_440px]">
            <EquipmentTable
              canCreate={canCreateEquipment}
              canDelete={canDeleteEquipment}
              canUpdate={canUpdateEquipment}
              catalogs={equipmentCatalogs}
              equipment={equipment}
              filters={equipmentFilters}
              pagination={equipmentMeta}
              selectedEquipmentId={selectedEquipmentId}
              onChangeFilters={handleChangeEquipmentFilters}
              onCreateEquipment={openCreateEquipment}
              onDeleteEquipment={handleDeleteEquipment}
              onEditEquipment={openEditEquipment}
              onSelectEquipment={handleSelectEquipment}
            />
            <div className="space-y-6">
              <EquipmentLifeSheet
                lifeSheet={lifeSheet}
                status={lifeSheetStatus}
                onDeleteAttachment={
                  canManageEquipmentAttachments
                    ? async (attachmentId) => {
                        if (!lifeSheet) return
                        await deleteEquipmentAttachment(lifeSheet.equipment.id, attachmentId)
                        await refreshSelectedLifeSheet(lifeSheet.equipment.id)
                        await refreshCoreData()
                      }
                    : undefined
                }
              />
              <EquipmentOperationsPanel
                canAssign={canAssignEquipment}
                canCreateFailure={canCreateFailureReports}
                canCreateMaintenance={canCreateMaintenance}
                canReturn={canReturnEquipment}
                canUploadAttachment={canManageEquipmentAttachments}
                catalogs={equipmentCatalogs}
                lifeSheet={lifeSheet}
                status={lifeSheetStatus}
                onAssign={async (userId, notes) => {
                  if (!selectedEquipmentId) return
                  await assignEquipment(selectedEquipmentId, userId, notes)
                  await refreshOperationalData()
                }}
                onReturn={async (notes) => {
                  if (!selectedEquipmentId) return
                  await returnEquipment(selectedEquipmentId, notes)
                  await refreshOperationalData()
                }}
                onCreateFailure={async (payload) => {
                  if (!selectedEquipmentId) return
                  await createFailureReport({
                    equipmentId: selectedEquipmentId,
                    ...payload,
                  })
                  await refreshOperationalData()
                }}
                onCreateMaintenance={async (payload) => {
                  if (!selectedEquipmentId) return
                  await createMaintenanceRecord({
                    equipmentId: selectedEquipmentId,
                    status: 'completed',
                    ...payload,
                  })
                  await refreshOperationalData()
                }}
                onUploadAttachment={async (file) => {
                  if (!selectedEquipmentId) return
                  await uploadEquipmentAttachment(selectedEquipmentId, file)
                  await refreshOperationalData()
                }}
              />
              <HeadquartersPanel headquarters={headquarters} />
            </div>
          </section>
        )}

        {activeView === 'maintenance' && canViewMaintenance && (
          <MaintenanceScheduleBoard
            canClose={canCloseMaintenance}
            canCreate={canCreateMaintenance}
            canUpdate={canUpdateMaintenance}
            schedules={maintenanceSchedules}
            status={maintenanceStatus}
            onCancel={(scheduleId) =>
              handleScheduleAction(() => cancelMaintenanceSchedule(scheduleId))
            }
            onCreateSchedule={() => setIsScheduleFormOpen(true)}
            onFinish={(scheduleId) =>
              handleScheduleAction(() => finishMaintenanceSchedule(scheduleId))
            }
            onMarkPending={(scheduleId) =>
              handleScheduleAction(() => markMaintenancePending(scheduleId))
            }
            onReschedule={(scheduleId, scheduledFor) =>
              handleScheduleAction(() => rescheduleMaintenanceSchedule(scheduleId, scheduledFor))
            }
            onStart={(scheduleId) =>
              handleScheduleAction(() => startMaintenanceSchedule(scheduleId))
            }
          />
        )}

        {activeView === 'alerts' && canViewAlerts && (
          <AlertCenter
            alerts={alerts}
            canManage={canManageAlerts}
            currentUserId={user?.id ?? null}
            isRunning={isRunningAlerts}
            technicians={equipmentCatalogs?.technicians ?? []}
            status={alertsStatus}
            onRunChecks={handleRunAlertChecks}
            onAcknowledge={(alertId) => handleAlertAction(() => acknowledgeAlert(alertId))}
            onAssign={(alertId, assignedTo) => handleAlertAction(() => assignAlert(alertId, assignedTo))}
            onResolve={(alertId) => handleAlertAction(() => resolveAlert(alertId))}
            onSelfAssign={(alertId) => handleAlertAction(() => selfAssignAlert(alertId))}
          />
        )}
        <EquipmentFormModal
          catalogs={equipmentCatalogs}
          equipment={editingEquipment}
          isOpen={isEquipmentFormOpen}
          mode={equipmentFormMode}
          onClose={() => setIsEquipmentFormOpen(false)}
          onSubmit={handleSubmitEquipment}
        />
        <MaintenanceScheduleFormModal
          catalogs={maintenanceCatalogs}
          equipment={equipment}
          equipmentCatalogs={equipmentCatalogs}
          isOpen={isScheduleFormOpen}
          onClose={() => setIsScheduleFormOpen(false)}
          onSubmit={handleCreateSchedule}
        />
      </div>
    </main>
  )
}

function TabButton({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      className={
        active
          ? 'rounded-md border border-cyan-600 bg-cyan-950/50 px-4 py-2 text-sm font-medium text-white'
          : 'rounded-md border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:text-white'
      }
      type="button"
      onClick={onClick}
    >
      {label}
    </button>
  )
}

export default App
