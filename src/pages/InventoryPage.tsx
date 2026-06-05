import { EquipmentLifeSheet } from '../components/EquipmentLifeSheet'
import { EquipmentOperationsPanel } from '../components/EquipmentOperationsPanel'
import { EquipmentTable } from '../components/EquipmentTable'
import { HeadquartersPanel } from '../components/HeadquartersPanel'
import type {
  Equipment,
  EquipmentCatalogs,
  EquipmentFilters,
  EquipmentLifeSheet as EquipmentLifeSheetType,
  Headquarter,
  PaginationMeta,
} from '../types/inventory'
import type { LifeSheetState } from '../types/ui'
import type { EquipmentImportResult } from '../utils/equipmentBulkImport'

type InventoryPageProps = {
  canAssignEquipment: boolean
  canCreateEquipment: boolean
  canCreateFailureReports: boolean
  canCreateMaintenance: boolean
  canDeleteEquipment: boolean
  canManageEquipmentAttachments: boolean
  canManageFailureReports: boolean
  canReturnEquipment: boolean
  canUpdateEquipment: boolean
  catalogs: EquipmentCatalogs | null
  equipment: Equipment[]
  filters: EquipmentFilters
  headquarters: Headquarter[]
  lifeSheet: EquipmentLifeSheetType | null
  lifeSheetStatus: LifeSheetState
  pagination: PaginationMeta | null
  selectedEquipmentId: string | null
  onAssignEquipment: (userId: string, notes?: string) => Promise<void>
  onChangeFilters: (filters: EquipmentFilters) => void
  onCreateEquipment: () => void
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
  onDeleteEquipment: (equipmentId: string) => void
  onDownloadImportTemplate: () => Promise<void>
  onEditEquipment: (equipment: Equipment) => void
  onExportEquipment: () => Promise<void>
  onImportEquipment: (file: File) => Promise<EquipmentImportResult>
  onResolveFailure: (failureReportId: string) => Promise<void>
  onReturnEquipment: (notes?: string) => Promise<void>
  onSelectEquipment: (equipmentId: string) => void
  onUploadAttachment: (file: File) => Promise<void>
}

export function InventoryPage({
  canAssignEquipment,
  canCreateEquipment,
  canCreateFailureReports,
  canCreateMaintenance,
  canDeleteEquipment,
  canManageEquipmentAttachments,
  canManageFailureReports,
  canReturnEquipment,
  canUpdateEquipment,
  catalogs,
  equipment,
  filters,
  headquarters,
  lifeSheet,
  lifeSheetStatus,
  onAssignEquipment,
  onChangeFilters,
  onCreateEquipment,
  onCreateFailure,
  onCreateMaintenanceRecord,
  onDeleteAttachment,
  onDeleteEquipment,
  onDownloadImportTemplate,
  onEditEquipment,
  onExportEquipment,
  onImportEquipment,
  onResolveFailure,
  onReturnEquipment,
  onSelectEquipment,
  onUploadAttachment,
  pagination,
  selectedEquipmentId,
}: InventoryPageProps) {
  return (
    <section className="grid flex-1 gap-6 xl:grid-cols-[minmax(0,1fr)_420px] 2xl:grid-cols-[minmax(0,1fr)_440px]">
      <EquipmentTable
        canCreate={canCreateEquipment}
        canDelete={canDeleteEquipment}
        canUpdate={canUpdateEquipment}
        catalogs={catalogs}
        equipment={equipment}
        filters={filters}
        pagination={pagination}
        selectedEquipmentId={selectedEquipmentId}
        onChangeFilters={onChangeFilters}
        onCreateEquipment={onCreateEquipment}
        onDeleteEquipment={onDeleteEquipment}
        onDownloadImportTemplate={onDownloadImportTemplate}
        onEditEquipment={onEditEquipment}
        onExportEquipment={onExportEquipment}
        onImportEquipment={onImportEquipment}
        onSelectEquipment={onSelectEquipment}
      />
      <div className="space-y-6">
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
        <HeadquartersPanel headquarters={headquarters} />
      </div>
    </section>
  )
}
