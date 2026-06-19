import { EquipmentDetailView } from '../components/equipmentDetail/EquipmentDetailView'
import { EquipmentSummaryPanel } from '../components/equipmentDetail/EquipmentSummaryPanel'
import { EquipmentTable } from '../components/EquipmentTable'
import { HeadquartersPanel } from '@/features/settings/components/HeadquartersPanel'
import { useState } from 'react'
import type {
  Equipment,
  EquipmentFilters,
} from '../types/equipmentCore'
import type { EquipmentCatalogs } from '../types/equipmentCatalogs'
import type { EquipmentLifeSheet as EquipmentLifeSheetType } from '../types/equipmentLifeSheet'
import type { Headquarter } from '@/features/settings/types'
import type { PaginationMeta } from '@/shared/types/pagination'
import type { LifeSheetState, LoadState } from '@/shared/types/ui'
import type { EquipmentImportResult } from '@/features/inventory/utils/equipmentBulkImport'

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
  status: LoadState
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
  onOpenEquipmentDetails: (equipmentId: string) => Promise<void>
  onRestoreEquipment: (equipmentId: string) => void
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
  onOpenEquipmentDetails,
  onRestoreEquipment,
  onResolveFailure,
  onReturnEquipment,
  onSelectEquipment,
  onUploadAttachment,
  pagination,
  selectedEquipmentId,
  status,
}: InventoryPageProps) {
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false)

  if (isDetailViewOpen) {
    return (
      <EquipmentDetailView
        canAssignEquipment={canAssignEquipment}
        canCreateFailureReports={canCreateFailureReports}
        canCreateMaintenance={canCreateMaintenance}
        canManageEquipmentAttachments={canManageEquipmentAttachments}
        canManageFailureReports={canManageFailureReports}
        canReturnEquipment={canReturnEquipment}
        catalogs={catalogs}
        lifeSheet={lifeSheet}
        lifeSheetStatus={lifeSheetStatus}
        onAssignEquipment={onAssignEquipment}
        onBack={() => setIsDetailViewOpen(false)}
        onCreateFailure={onCreateFailure}
        onCreateMaintenanceRecord={onCreateMaintenanceRecord}
        onDeleteAttachment={onDeleteAttachment}
        onResolveFailure={onResolveFailure}
        onReturnEquipment={onReturnEquipment}
        onUploadAttachment={onUploadAttachment}
      />
    )
  }

  return (
    <section className="grid flex-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_380px]">
      <EquipmentTable
        canCreate={canCreateEquipment}
        canDelete={canDeleteEquipment}
        canUpdate={canUpdateEquipment}
        catalogs={catalogs}
        equipment={equipment}
        filters={filters}
        pagination={pagination}
        selectedEquipmentId={selectedEquipmentId}
        status={status}
        onChangeFilters={onChangeFilters}
        onCreateEquipment={onCreateEquipment}
        onDeleteEquipment={onDeleteEquipment}
        onDownloadImportTemplate={onDownloadImportTemplate}
        onEditEquipment={onEditEquipment}
        onExportEquipment={onExportEquipment}
        onImportEquipment={onImportEquipment}
        onOpenEquipmentDetails={(equipmentId) => {
          setIsDetailViewOpen(true)
          onOpenEquipmentDetails(equipmentId)
        }}
        onRestoreEquipment={onRestoreEquipment}
        onSelectEquipment={onSelectEquipment}
      />
      <div className="space-y-6">
        <EquipmentSummaryPanel
          lifeSheet={lifeSheet}
          status={lifeSheetStatus}
          onOpenDetails={() => setIsDetailViewOpen(true)}
        />
        <HeadquartersPanel headquarters={headquarters} />
      </div>
    </section>
  )
}
