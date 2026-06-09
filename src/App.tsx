import { useEffect, useState } from 'react'
import { AlertNotice } from './components/AlertNotice'
import { AppNavigation } from './components/AppNavigation'
import { ConfirmDialog } from './components/ConfirmDialog'
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
import { SettingsPage } from './pages/SettingsPage'
import { getCurrentUser, login, logout } from './services/auth'
import type { User } from './types/inventory'
import type { AuthState } from './types/ui'
import './App.css'

function App() {
  const [authStatus, setAuthStatus] = useState<AuthState>('checking')
  const [showLogin, setShowLogin] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<{
    confirmLabel?: string
    message: string
    onConfirm: () => void
    title: string
  } | null>(null)
  const { clearSuccess, showSuccess, successNotice } = useSuccessNotice()
  const { theme, toggleTheme } = useThemeMode()
  const { actions, metrics, notifications, permissions, state } = useInventoryWorkspace({
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

  function requestConfirmation(action: NonNullable<typeof confirmAction>) {
    setConfirmAction(action)
  }

  function runConfirmedAction() {
    const action = confirmAction

    setConfirmAction(null)
    action?.onConfirm()
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
          notifications={notifications.items}
          status={state.status}
          theme={theme}
          unreadNotifications={notifications.unreadCount}
          userName={user?.name ?? 'Usuario'}
          onClearNotifications={notifications.clear}
          onLogout={handleLogout}
          onMarkNotificationsRead={notifications.markAllAsRead}
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
          <SuccessNotice
            message={successNotice.message}
            subText={successNotice.subText}
            onClose={clearSuccess}
          />
        )}
        <AppNavigation
          activeView={state.activeView}
          alertAttentionCount={metrics.alertAttentionCount}
          canViewAlerts={permissions.canViewAlerts}
          canViewMaintenance={permissions.canViewMaintenance}
          canViewSettings={permissions.canViewSettings}
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
            onDeleteEquipment={(equipmentId) =>
              requestConfirmation({
                confirmLabel: 'Retirar equipo',
                message: 'El equipo saldra del inventario activo. Su historial se conserva para consulta.',
                onConfirm: () => actions.handleDeleteEquipment(equipmentId),
                title: 'Confirmar retiro',
              })
            }
            onDownloadImportTemplate={actions.handleDownloadEquipmentImportTemplate}
            onEditEquipment={actions.openEditEquipment}
            onExportEquipment={actions.handleExportEquipment}
            onImportEquipment={actions.handleImportEquipment}
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
            onFinish={actions.handleFinishSchedule}
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

        {state.activeView === 'settings' && permissions.canViewSettings && (
          <SettingsPage
            canManageHeadquarters={permissions.canManageHeadquarters}
            canManageLocations={permissions.canManageLocations}
            headquarters={state.headquarters}
            locations={state.locations}
            onCreateHeadquarter={actions.createHeadquarter}
            onCreateLocation={actions.createLocation}
            onDeactivateHeadquarter={(headquarterId) =>
              requestConfirmation({
                confirmLabel: 'Desactivar sede',
                message: 'La sede quedara inactiva para nuevas asignaciones. Las ubicaciones y equipos existentes no se eliminan.',
                onConfirm: () => actions.deactivateHeadquarter(headquarterId),
                title: 'Confirmar desactivacion',
              })
            }
            onDeactivateLocation={(locationId) =>
              requestConfirmation({
                confirmLabel: 'Desactivar ubicacion',
                message: 'La ubicacion quedara inactiva para nuevas asignaciones. Los equipos ya asociados conservan su historial.',
                onConfirm: () => actions.deactivateLocation(locationId),
                title: 'Confirmar desactivacion',
              })
            }
            onUpdateHeadquarter={actions.updateHeadquarter}
            onUpdateLocation={actions.updateLocation}
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
        <ConfirmDialog
          confirmLabel={confirmAction?.confirmLabel}
          isOpen={Boolean(confirmAction)}
          message={confirmAction?.message ?? ''}
          title={confirmAction?.title ?? ''}
          onCancel={() => setConfirmAction(null)}
          onConfirm={runConfirmedAction}
        />
      </div>
    </main>
  )
}

export default App
