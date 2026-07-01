import { AlertsPage, MyCasesPage } from '@/features/alerts'
import { ChatPage } from '@/features/chat'
import { InventoryPage } from '@/features/inventory'
import { EquipmentLoansPage } from '@/features/loans'
import { MaintenancePage } from '@/features/maintenance'
import { ConfigurationPage, HeadquartersPage, SystemLogsPage } from '@/features/settings'
import { UserManagementPage } from '@/features/users'
import type { useWorkspaceController } from './hooks/useWorkspaceController'
import type { User } from '@/features/users/types'
import type { UserPreferences } from '@/shared/types/ui'
import type { ConfirmAction } from './hooks/useConfirmAction'
import type { Alert } from '@/features/alerts/types'

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

  function openAlertTarget(alert: Alert) {
    const targetView = alertTargetView(alert)

    if (targetView === 'loans' && permissions.canViewEquipmentLoans) {
      actions.setActiveView('loans')
      return
    }

    if (targetView === 'maintenance' && permissions.canViewMaintenance) {
      actions.setActiveView('maintenance')
      return
    }

    if (targetView === 'cases' && permissions.canViewAlerts) {
      actions.setActiveView('cases')
      return
    }

    actions.setActiveView('inventory')
  }

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
          status={state.status}
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
          onRestoreEquipment={(equipmentId) =>
            requestConfirmation({
              confirmLabel: 'Reintegrar equipo',
              message: 'El equipo volvera al inventario activo con estado Activo.',
              onConfirm: () => actions.handleRestoreEquipment(equipmentId),
              title: 'Confirmar reintegro',
            })
          }
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
          catalogs={state.equipmentCatalogs}
          equipment={state.equipment}
          equipmentGroups={state.equipmentGroups}
          filters={state.maintenanceFilters}
          records={state.maintenanceRecords}
          schedules={state.maintenanceSchedules}
          status={state.maintenanceStatus}
          onChangeFilters={(filters) => {
            actions.setMaintenanceFilters(filters)
            actions.refreshMaintenanceRecords(filters)
          }}
          onCreateGroup={async (payload) => {
            await actions.createEquipmentGroup(payload)
            actions.refreshMaintenanceRecords()
          }}
          onDeleteGroup={async (groupId) => {
            await actions.deleteEquipmentGroup(groupId)
            actions.refreshMaintenanceRecords()
          }}
          onUpdateGroup={async (groupId, payload) => {
            await actions.updateEquipmentGroup(groupId, payload)
            actions.refreshMaintenanceRecords()
          }}
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
          onUpdateClosure={async (recordId, payload) => {
            await actions.updateMaintenanceClosure(recordId, payload)
            actions.refreshMaintenanceRecords()
          }}
          onUpdateExecution={async (recordId, payload) => {
            await actions.updateMaintenanceExecution(recordId, payload)
            actions.refreshMaintenanceRecords()
          }}
          onUpdateReception={async (recordId, payload) => {
            await actions.updateMaintenanceReception(recordId, payload)
            actions.refreshMaintenanceRecords()
          }}
          onUploadEvidence={async (recordId, stage, file) => {
            await actions.uploadMaintenanceAttachment(recordId, stage, file)
          }}
          onDeleteEvidence={async (recordId, attachmentId) => {
            await actions.deleteMaintenanceAttachment(recordId, attachmentId)
          }}
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

      {state.activeView === 'systemLogs' && permissions.canManageSystemLogs && (
        <SystemLogsPage requestConfirmation={requestConfirmation} />
      )}

      {state.activeView === 'users' && permissions.canManageUsers && (
        <UserManagementPage
          currentUserId={user?.id ?? null}
          requestConfirmation={requestConfirmation}
        />
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
          onOpenTarget={openAlertTarget}
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

      {state.activeView === 'chat' && (
        <ChatPage
          chat={workspace.chat}
          currentUserId={user?.id ?? null}
          requestConfirmation={requestConfirmation}
        />
      )}
    </div>
  )
}

function alertTargetView(alert: Alert) {
  if (alert.entityType === 'equipment_loan' || alert.type.startsWith('equipment_loan_')) {
    return 'loans'
  }

  if (alert.entityType === 'maintenance_schedule' || alert.type.includes('maintenance')) {
    return 'maintenance'
  }

  if (alert.entityType === 'failure_report' || alert.type === 'damaged_equipment_reported') {
    return 'cases'
  }

  return 'inventory'
}
