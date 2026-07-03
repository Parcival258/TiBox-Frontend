import { EquipmentFormModal } from '@/features/inventory'
import { MaintenanceScheduleFormModal } from '@/features/maintenance'
import { ConfirmDialog } from '@/shared/ui'
import type { useWorkspaceController } from './hooks/useWorkspaceController'
import type { ConfirmAction } from './hooks/useConfirmAction'

type Workspace = ReturnType<typeof useWorkspaceController>

type AppOverlaysProps = {
  confirmation: {
    action: ConfirmAction | null
    cancel: () => void
    confirm: () => void
  }
  workspace: Workspace
}

export function AppOverlays({ confirmation, workspace }: AppOverlaysProps) {
  const { actions, state } = workspace

  return (
    <>
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
        equipmentGroups={state.equipmentGroups}
        isOpen={state.isScheduleFormOpen}
        onClose={() => actions.setIsScheduleFormOpen(false)}
        onSubmit={actions.handleCreateSchedule}
      />
      <ConfirmDialog
        confirmLabel={confirmation.action?.confirmLabel}
        isOpen={Boolean(confirmation.action)}
        message={confirmation.action?.message ?? ''}
        title={confirmation.action?.title ?? ''}
        onCancel={confirmation.cancel}
        onConfirm={confirmation.confirm}
      />
    </>
  )
}
