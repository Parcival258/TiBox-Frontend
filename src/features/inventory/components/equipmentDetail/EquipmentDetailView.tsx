import { EquipmentLifeSheet } from '../EquipmentLifeSheet'
import { EquipmentOperationsPanel } from '../EquipmentOperationsPanel'
import type { EquipmentCatalogs } from '../../types/equipmentCatalogs'
import type { EquipmentLifeSheet as EquipmentLifeSheetType } from '../../types/equipmentLifeSheet'
import type { LifeSheetState } from '@/shared/types/ui'

type EquipmentDetailViewProps = {
  canAssignEquipment: boolean
  canCreateFailureReports: boolean
  canCreateMaintenance: boolean
  canManageEquipmentAttachments: boolean
  canManageFailureReports: boolean
  canReturnEquipment: boolean
  catalogs: EquipmentCatalogs | null
  lifeSheet: EquipmentLifeSheetType | null
  lifeSheetStatus: LifeSheetState
  onAssignEquipment: (userId: string, notes?: string) => Promise<void>
  onBack: () => void
  onCreateFailure: (payload: { title: string; description: string; priority: string }) => Promise<void>
  onCreateMaintenanceRecord: (payload: {
    actionsTaken?: string
    cost?: number
    description?: string
    diagnosis?: string
    maintenanceType: 'preventive' | 'corrective'
    nextMaintenanceAt?: string
    performedBy?: string
    priority: string
  }) => Promise<void>
  onDeleteAttachment: (attachmentId: string) => Promise<void>
  onResolveFailure: (failureReportId: string) => Promise<void>
  onReturnEquipment: (notes?: string) => Promise<void>
  onUploadAttachment: (file: File) => Promise<void>
}

export function EquipmentDetailView({
  canAssignEquipment,
  canCreateFailureReports,
  canCreateMaintenance,
  canManageEquipmentAttachments,
  canManageFailureReports,
  canReturnEquipment,
  catalogs,
  lifeSheet,
  lifeSheetStatus,
  onAssignEquipment,
  onBack,
  onCreateFailure,
  onCreateMaintenanceRecord,
  onDeleteAttachment,
  onResolveFailure,
  onReturnEquipment,
  onUploadAttachment,
}: EquipmentDetailViewProps) {
  return (
    <section className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-3 border-b border-slate-800 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-cyan-300">Detalle del equipo</p>
          <h2 className="mt-1 text-2xl font-semibold text-white">
            {lifeSheet?.equipment.internalCode ?? 'Equipo'}
          </h2>
        </div>
        <button
          className="rounded-md border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white"
          type="button"
          onClick={onBack}
        >
          Volver al inventario
        </button>
      </div>

      <div className="grid flex-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(340px,420px)]">
        <EquipmentLifeSheet
          canResolveFailures={canManageFailureReports}
          lifeSheet={lifeSheet}
          status={lifeSheetStatus}
          onDeleteAttachment={canManageEquipmentAttachments ? onDeleteAttachment : undefined}
          onResolveFailure={canManageFailureReports ? onResolveFailure : undefined}
        />
        <EquipmentOperationsPanel
          canAssign={canAssignEquipment}
          canCreateFailure={canCreateFailureReports}
          canCreateMaintenance={canCreateMaintenance}
          canReturn={canReturnEquipment}
          canUploadAttachment={canManageEquipmentAttachments}
          catalogs={catalogs}
          lifeSheet={lifeSheet}
          status={lifeSheetStatus}
          onAssign={onAssignEquipment}
          onCreateFailure={onCreateFailure}
          onCreateMaintenance={onCreateMaintenanceRecord}
          onReturn={onReturnEquipment}
          onUploadAttachment={onUploadAttachment}
        />
      </div>
    </section>
  )
}
