import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import type {
  Equipment,
  EquipmentFilters,
} from '../types/equipmentCore'
import type { EquipmentCatalogs } from '../types/equipmentCatalogs'
import type { PaginationMeta } from '@/shared/types/pagination'
import { InfoNotice } from '@/shared/ui/InfoNotice'
import { AppLoader } from '@/shared/ui/Loaders'
import type { LoadState } from '@/shared/types/ui'
import type { EquipmentImportResult } from '@/features/inventory/utils/equipmentBulkImport'
import {
  ContextActionMenu,
  type ContextMenuState,
} from '@/shared/ui/contextActionMenu/ContextActionMenu'
import { EquipmentGrid } from './EquipmentGrid'
import { EquipmentImportSummary } from './EquipmentImportSummary'
import { EquipmentTableFilters } from './EquipmentTableFilters'
import { EquipmentTablePagination } from './EquipmentTablePagination'
import { EquipmentTableToolbar } from './EquipmentTableToolbar'

type EquipmentTableProps = {
  canCreate: boolean
  canDelete: boolean
  canUpdate: boolean
  catalogs: EquipmentCatalogs | null
  equipment: Equipment[]
  filters: EquipmentFilters
  onChangeFilters: (filters: EquipmentFilters) => void
  onCreateEquipment: () => void
  onDeleteEquipment: (equipmentId: string) => void
  onDownloadImportTemplate: () => Promise<void>
  onEditEquipment: (equipment: Equipment) => void
  onExportEquipment: () => Promise<void>
  onImportEquipment: (file: File) => Promise<EquipmentImportResult>
  onOpenEquipmentDetails: (equipmentId: string) => void
  onRestoreEquipment: (equipmentId: string) => void
  onSelectEquipment: (equipmentId: string) => void
  pagination: PaginationMeta | null
  selectedEquipmentId: string | null
  status: LoadState
}

const inventoryTips = [
  {
    message: 'Tip de inventario',
    subText: 'Haz click en una fila para ver el resumen del equipo sin abrir formularios.',
  },
  {
    message: 'Acciones rapidas',
    subText: 'Usa click derecho sobre un equipo para editarlo, retirarlo o enfocar su detalle.',
  },
  {
    message: 'Busqueda precisa',
    subText: 'Puedes buscar por codigo, serial, direccion IP o MAC para ubicar equipos mas rapido.',
  },
  {
    message: 'Carga masiva',
    subText: 'Descarga el formato antes de importar para evitar errores de columnas o datos faltantes.',
  },
  {
    message: 'Revision de responsables',
    subText: 'Filtra y revisa equipos sin asignar para mantener claro quien responde por cada activo.',
  },
]

function getInitialInventoryTip() {
  if (Math.random() < 0.35) {
    return null
  }

  return inventoryTips[Math.floor(Math.random() * inventoryTips.length)]
}

export function EquipmentTable({
  canCreate,
  canDelete,
  canUpdate,
  catalogs,
  equipment,
  filters,
  onChangeFilters,
  onCreateEquipment,
  onDeleteEquipment,
  onDownloadImportTemplate,
  onEditEquipment,
  onExportEquipment,
  onImportEquipment,
  onOpenEquipmentDetails,
  onRestoreEquipment,
  onSelectEquipment,
  pagination,
  selectedEquipmentId,
  status,
}: EquipmentTableProps) {
  const filterSearch = filters.search ?? ''
  const [searchInput, setSearchInput] = useState({ filter: filterSearch, value: filterSearch })
  const search = searchInput.filter === filterSearch ? searchInput.value : filterSearch
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<EquipmentImportResult | null>(null)
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null)
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null)
  const [activeTip, setActiveTip] = useState(getInitialInventoryTip)
  const importInputRef = useRef<HTMLInputElement | null>(null)

  function setSearch(value: string) {
    setSearchInput({ filter: filterSearch, value })
  }

  function updateFilters(nextFilters: EquipmentFilters) {
    onChangeFilters({
      ...filters,
      ...nextFilters,
      page: nextFilters.page ?? 1,
    })
  }

  function applySearch(event: FormEvent) {
    event.preventDefault()
    updateFilters({ search: search.trim() || undefined })
  }

  function clearFilters() {
    setSearch('')
    onChangeFilters({
      orderBy: filters.orderBy,
      orderDirection: filters.orderDirection,
      page: 1,
      perPage: filters.perPage,
    })
  }

  async function handleExport() {
    setIsExporting(true)

    try {
      await onExportEquipment()
    } finally {
      setIsExporting(false)
    }
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setPendingImportFile(file)
    setImportResult(null)
    event.target.value = ''
  }

  async function processPendingImport() {
    if (!pendingImportFile) {
      return
    }

    setIsImporting(true)
    setImportResult(null)

    try {
      setImportResult(await onImportEquipment(pendingImportFile))
      setPendingImportFile(null)
    } finally {
      setIsImporting(false)
    }
  }

  function removePendingImportFile() {
    setPendingImportFile(null)
    setImportResult(null)

    if (importInputRef.current) {
      importInputRef.current.value = ''
    }
  }

  const currentPage = pagination?.currentPage ?? filters.page ?? 1
  const lastPage = pagination?.lastPage ?? 1

  return (
    <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900">
      <EquipmentTableToolbar
        canCreate={canCreate}
        importInputRef={importInputRef}
        isExportDisabled={isExporting || (pagination?.total ?? equipment.length) === 0}
        isExporting={isExporting}
        isImporting={isImporting}
        pendingImportFileName={pendingImportFile?.name ?? null}
        totalRecords={pagination?.total ?? equipment.length}
        onCreateEquipment={onCreateEquipment}
        onDownloadImportTemplate={onDownloadImportTemplate}
        onExportEquipment={handleExport}
        onImportEquipment={handleImport}
        onProcessImport={processPendingImport}
        onRemoveImportFile={removePendingImportFile}
      />

      {canCreate && activeTip && (
        <InfoNotice
          message={activeTip.message}
          subText={activeTip.subText}
          onClose={() => setActiveTip(null)}
        />
      )}

      <EquipmentImportSummary result={importResult} />

      <EquipmentTableFilters
        catalogs={catalogs}
        filters={filters}
        search={search}
        onApplySearch={applySearch}
        onChangeFilters={updateFilters}
        onChangeSearch={setSearch}
        onClearFilters={clearFilters}
      />

      {status === 'loading' ? (
        <div className="flex min-h-72 items-center justify-center px-4 py-12">
          <AppLoader label="Cargando inventario..." />
        </div>
      ) : (
        <EquipmentGrid
          canDelete={canDelete}
          canUpdate={canUpdate}
          equipment={equipment}
          selectedEquipmentId={selectedEquipmentId}
          onDeleteEquipment={onDeleteEquipment}
          onEditEquipment={onEditEquipment}
          onOpenEquipmentDetails={onOpenEquipmentDetails}
          onRestoreEquipment={onRestoreEquipment}
          onSelectEquipment={onSelectEquipment}
          onSetContextMenu={setContextMenu}
        />
      )}

      <ContextActionMenu menu={contextMenu} onClose={() => setContextMenu(null)} />

      {status !== 'loading' && (
        <EquipmentTablePagination
          currentPage={currentPage}
          filters={filters}
          lastPage={lastPage}
          onChangeFilters={onChangeFilters}
        />
      )}
    </div>
  )
}
