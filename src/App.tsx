import { useEffect, useState } from 'react'
import { AlertNotice } from './components/AlertNotice'
import { AppNavigation } from './components/AppNavigation'
import { DashboardHeader } from './components/DashboardHeader'
import { EquipmentFormModal } from './components/EquipmentFormModal'
import { LandingPage } from './components/LandingPage'
import { LoginPanel } from './components/LoginPanel'
import { LoginLoader } from './components/Loaders'
import { MaintenanceScheduleFormModal } from './components/MaintenanceScheduleFormModal'
import { MetricGrid } from './components/MetricGrid'
import { SuccessNotice } from './components/SuccessNotice'
import { useInventoryWorkspace } from './hooks/useInventoryWorkspace'
import { useSuccessNotice } from './hooks/useSuccessNotice'
import { useThemeMode } from './hooks/useThemeMode'
import { AlertsPage } from './pages/AlertsPage'
import { InventoryPage } from './pages/InventoryPage'
import { MaintenancePage } from './pages/MaintenancePage'
import { MyCasesPage } from './pages/MyCasesPage'
import { getCurrentUser, login, logout } from './services/auth'
import type { User } from './types/inventory'
import type { AuthState } from './types/ui'
import './App.css'

function App() {
  const [authStatus, setAuthStatus] = useState<AuthState>('checking')
  const [showLogin, setShowLogin] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loginError, setLoginError] = useState<string | null>(null)
  const { clearSuccess, showSuccess, successNotice } = useSuccessNotice()
  const { theme, toggleTheme } = useThemeMode()
  const { actions, metrics, permissions, state } = useInventoryWorkspace({
    authStatus,
    showSuccess,
    user,
  })

  useEffect(() => {
    getCurrentUser()
      .then(({ user: currentUser }) => {
        setUser(currentUser)
        setAuthStatus('authenticated')
      })
      .catch(() => setAuthStatus('guest'))
  }, [])

  function handleLogin(email: string, password: string) {
    setAuthStatus('submitting')
    setLoginError(null)

    login(email, password)
      .then(({ user: authenticatedUser }) => {
        setUser(authenticatedUser)
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
      actions.resetWorkspace()
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
          status={state.status}
          theme={theme}
          userName={user?.name ?? 'Usuario'}
          onLogout={handleLogout}
          onToggleTheme={toggleTheme}
        />
        <MetricGrid dashboard={state.dashboard} />
        {permissions.canViewAlerts && metrics.alertAttentionCount > 0 && (
          <AlertNotice
            activeView={state.activeView}
            count={metrics.alertAttentionCount}
            myCount={metrics.myAlertCount}
            unassignedFailureCount={metrics.unassignedFailureCount}
            onOpen={() => actions.setActiveView('alerts')}
          />
        )}
        {successNotice && (
          <div className="mb-5 flex justify-end">
            <SuccessNotice
              message={successNotice.message}
              subText={successNotice.subText}
              onClose={clearSuccess}
            />
          </div>
        )}
        <AppNavigation
          activeView={state.activeView}
          alertAttentionCount={metrics.alertAttentionCount}
          canViewAlerts={permissions.canViewAlerts}
          canViewMaintenance={permissions.canViewMaintenance}
          myCaseCount={metrics.myCaseCount}
          onChangeView={actions.setActiveView}
        />

        {state.activeView === 'inventory' && (
          <InventoryPage
            canAssignEquipment={permissions.canAssignEquipment}
            canCreateEquipment={permissions.canCreateEquipment}
            canCreateFailureReports={permissions.canCreateFailureReports}
            canCreateMaintenance={permissions.canCreateMaintenance}
            canDeleteEquipment={permissions.canDeleteEquipment}
            canManageEquipmentAttachments={permissions.canManageEquipmentAttachments}
            canManageFailureReports={permissions.canManageFailureReports}
            canReturnEquipment={permissions.canReturnEquipment}
            canUpdateEquipment={permissions.canUpdateEquipment}
            catalogs={state.equipmentCatalogs}
            equipment={state.equipment}
            filters={state.equipmentFilters}
            headquarters={state.headquarters}
            lifeSheet={state.lifeSheet}
            lifeSheetStatus={state.lifeSheetStatus}
            pagination={state.equipmentMeta}
            selectedEquipmentId={state.selectedEquipmentId}
            onAssignEquipment={actions.assignEquipment}
            onChangeFilters={actions.handleChangeEquipmentFilters}
            onCreateEquipment={actions.openCreateEquipment}
            onCreateFailure={actions.createFailure}
            onCreateMaintenanceRecord={actions.createMaintenanceRecord}
            onDeleteAttachment={actions.deleteAttachment}
            onDeleteEquipment={actions.handleDeleteEquipment}
            onEditEquipment={actions.openEditEquipment}
            onResolveFailure={actions.resolveFailure}
            onReturnEquipment={actions.returnEquipment}
            onSelectEquipment={actions.handleSelectEquipment}
            onUploadAttachment={actions.uploadAttachment}
          />
        )}

        {state.activeView === 'maintenance' && permissions.canViewMaintenance && (
          <MaintenancePage
            canClose={permissions.canCloseMaintenance}
            canCreate={permissions.canCreateMaintenance}
            canUpdate={permissions.canUpdateMaintenance}
            schedules={state.maintenanceSchedules}
            status={state.maintenanceStatus}
            onCancel={(scheduleId) =>
              actions.handleScheduleAction(() => actions.cancelMaintenanceSchedule(scheduleId))
            }
            onCreateSchedule={() => actions.setIsScheduleFormOpen(true)}
            onFinish={(scheduleId) =>
              actions.handleScheduleAction(() => actions.finishMaintenanceSchedule(scheduleId))
            }
            onMarkPending={(scheduleId) =>
              actions.handleScheduleAction(() => actions.markMaintenancePending(scheduleId))
            }
            onReschedule={(scheduleId, scheduledFor) =>
              actions.handleScheduleAction(() =>
                actions.rescheduleMaintenanceSchedule(scheduleId, scheduledFor)
              )
            }
            onStart={(scheduleId) =>
              actions.handleScheduleAction(() => actions.startMaintenanceSchedule(scheduleId))
            }
          />
        )}

        {state.activeView === 'alerts' && permissions.canViewAlerts && (
          <AlertsPage
            alerts={state.alerts}
            canManage={permissions.canManageAlerts}
            currentUserId={user?.id ?? null}
            isRunning={state.isRunningAlerts}
            technicians={state.equipmentCatalogs?.technicians ?? []}
            status={state.alertsStatus}
            onRunChecks={actions.handleRunAlertChecks}
            onAcknowledge={(alertId) =>
              actions.handleAlertAction(() => actions.acknowledgeAlert(alertId), 'Alerta reconocida')
            }
            onAssign={(alertId, assignedTo) =>
              actions.handleAlertAction(() => actions.assignAlert(alertId, assignedTo), 'Alerta asignada')
            }
            onResolve={(alertId) =>
              actions.handleAlertAction(() => actions.resolveAlert(alertId), 'Alerta resuelta')
            }
            onSelfAssign={(alertId) =>
              actions.handleAlertAction(() => actions.selfAssignAlert(alertId), 'Falla tomada')
            }
          />
        )}
        {state.activeView === 'cases' && permissions.canViewAlerts && (
          <MyCasesPage
            alerts={state.alerts}
            currentUserId={user?.id ?? null}
            status={state.alertsStatus}
            onAddNote={(alertId, note) =>
              actions.handleAlertAction(() => actions.addAlertNote(alertId, note), 'Nota guardada')
            }
            onDismiss={(alertId) =>
              actions.handleAlertAction(() => actions.dismissAlert(alertId), 'Caso quitado')
            }
            onResolveCase={(alert) => {
              const action =
                alert.entityType === 'failure_report'
                  ? () => actions.resolveFailureReport(alert.entityId)
                  : () => actions.resolveAlert(alert.id)

              actions.handleAlertAction(action, 'Caso cerrado')
            }}
          />
        )}
        <EquipmentFormModal
          catalogs={state.equipmentCatalogs}
          equipment={state.editingEquipment}
          isOpen={state.isEquipmentFormOpen}
          mode={state.equipmentFormMode}
          onClose={() => actions.setIsEquipmentFormOpen(false)}
          onSubmit={actions.handleSubmitEquipment}
        />
        <MaintenanceScheduleFormModal
          catalogs={state.maintenanceCatalogs}
          equipment={state.equipment}
          equipmentCatalogs={state.equipmentCatalogs}
          isOpen={state.isScheduleFormOpen}
          onClose={() => actions.setIsScheduleFormOpen(false)}
          onSubmit={actions.handleCreateSchedule}
        />
      </div>
    </main>
  )
}

export default App
