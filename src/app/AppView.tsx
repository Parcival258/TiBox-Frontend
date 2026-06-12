import { AlertsPage, MyCasesPage } from '@/features/alerts'
import { InventoryPage } from '@/features/inventory'
import { EquipmentLoansPage } from '@/features/loans'
import { MaintenancePage } from '@/features/maintenance'
import { ConfigurationPage, HeadquartersPage } from '@/features/settings'
import { UserManagementPage } from '@/features/users'
import type { useWorkspaceController } from './hooks/useWorkspaceController'
import type { User } from '@/shared/types/inventory'
import type { UserPreferences } from '@/shared/types/ui'
import type { ConfirmAction } from './hooks/useConfirmAction'

type Workspace = ReturnType<typeof useWorkspaceController>

type AppViewProps = {
  preferences: UserPreferences
  requestConfirmation: (action: ConfirmAction) => void
  updatePreferences: (changes: Partial<UserPreferences>) => void
  user: User | null
  workspace: Workspace
}

export function AppView({
  preferences,
  requestConfirmation,
  updatePreferences,
  user,
  workspace,
}: AppViewProps) {
  const { actions, notifications, permissions, state } = workspace

  return (
    <div className="app-view-transition" key={state.activeView}>
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
          onOpenEquipmentDetails={actions.openEquipmentDetails}
          onResolveFailure={actions.resolveFailure}
          onReturnEquipment={actions.returnEquipment}
          onSelectEquipment={actions.handleSelectEquipment}
          onUploadAttachment={actions.uploadAttachment}
        />
      )}

      {state.activeView === 'loans' && permissions.canViewEquipmentLoans && (
        <EquipmentLoansPage
          canCreate={permissions.canAssignEquipment}
          canRequest={permissions.canViewEquipmentLoans}
          canReturn={permissions.canReturnEquipment}
          catalogs={state.equipmentCatalogs}
          equipment={state.equipment}
          loans={state.equipmentLoans}
          requestableEquipment={state.requestableEquipment}
          status={state.equipmentLoansStatus}
          onApproveLoan={actions.approveEquipmentLoan}
          onCreateLoan={actions.createEquipmentLoan}
          onRejectLoan={actions.rejectEquipmentLoan}
          onRequestLoan={actions.requestEquipmentLoan}
          onReturnLoan={actions.returnEquipmentLoan}
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

      {state.activeView === 'headquarters' && permissions.canViewSettings && (
        <HeadquartersPage
          canManageEquipmentTypes={permissions.canManageEquipmentTypes}
          canManageHeadquarters={permissions.canManageHeadquarters}
          canManageLocations={permissions.canManageLocations}
          equipmentTypes={state.equipmentTypes}
          headquarters={state.headquarters}
          locations={state.locations}
          onCreateEquipmentType={actions.createEquipmentType}
          onCreateHeadquarter={actions.createHeadquarter}
          onCreateLocation={actions.createLocation}
          onDeactivateEquipmentType={actions.deactivateEquipmentType}
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
          onUpdateEquipmentType={actions.updateEquipmentType}
          onUpdateHeadquarter={actions.updateHeadquarter}
          onUpdateLocation={actions.updateLocation}
        />
      )}

      {state.activeView === 'settings' && (
        <ConfigurationPage
          notificationsCount={notifications.items.length}
          preferences={preferences}
          onChange={updatePreferences}
          onClearNotifications={notifications.clear}
        />
      )}

      {state.activeView === 'users' && permissions.canManageUsers && (
        <UserManagementPage currentUserId={user?.id ?? null} />
      )}

      {state.activeView === 'alerts' && permissions.canViewAlerts && (
        <AlertsPage
          alerts={state.alerts}
          canManage={permissions.canManageAlerts}
          currentUserId={user?.id ?? null}
          isRunning={state.isRunningAlerts}
          status={state.alertsStatus}
          technicians={state.equipmentCatalogs?.technicians ?? []}
          onAcknowledge={(alertId) =>
            actions.handleAlertAction(() => actions.acknowledgeAlert(alertId), 'Alerta reconocida')
          }
          onAssign={(alertId, assignedTo) =>
            actions.handleAlertAction(() => actions.assignAlert(alertId, assignedTo), 'Alerta asignada')
          }
          onDismiss={(alertId) =>
            actions.handleAlertAction(() => actions.dismissAlert(alertId), 'Alerta quitada')
          }
          onResolve={(alertId) =>
            actions.handleAlertAction(() => actions.resolveAlert(alertId), 'Alerta resuelta')
          }
          onRunChecks={actions.handleRunAlertChecks}
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
    </div>
  )
}
