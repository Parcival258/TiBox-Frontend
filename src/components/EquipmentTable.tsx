import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import type {
  Equipment,
  EquipmentCatalogs,
  EquipmentFilters,
  PaginationMeta,
} from '../types/inventory'
import { InfoNotice } from './InfoNotice'
import { equipmentStatusLabel, ownershipTypeLabel } from '../utils/enumLabels'
import type { EquipmentImportResult } from '../utils/equipmentBulkImport'
import {
  ContextActionMenu,
  type ContextMenuState,
} from './contextActionMenu/ContextActionMenu'

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
  onSelectEquipment: (equipmentId: string) => void
  pagination: PaginationMeta | null
  selectedEquipmentId: string | null
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
  onSelectEquipment,
  pagination,
  selectedEquipmentId,
}: EquipmentTableProps) {
  const [search, setSearch] = useState(filters.search ?? '')
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<EquipmentImportResult | null>(null)
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null)
  const [activeTip, setActiveTip] = useState(getInitialInventoryTip)
  const importInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    setSearch(filters.search ?? '')
  }, [filters.search])

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

    setIsImporting(true)
    setImportResult(null)

    try {
      setImportResult(await onImportEquipment(file))
    } finally {
      setIsImporting(false)
      event.target.value = ''
    }
  }

  const currentPage = pagination?.currentPage ?? filters.page ?? 1
  const lastPage = pagination?.lastPage ?? 1

  return (
    <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900">
      <div className="flex flex-col gap-3 border-b border-slate-800 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="text-base font-medium text-white">Inventario de equipos</h2>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-slate-400">
            {pagination?.total ?? equipment.length} registros
          </span>
          {canCreate && (
            <>
              <button
                className="rounded-md border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-slate-500 hover:text-white"
                type="button"
                onClick={onDownloadImportTemplate}
              >
                Descargar formato
              </button>
              <button
                className="rounded-md border border-indigo-700 px-3 py-1.5 text-xs font-medium text-indigo-100 transition hover:border-indigo-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isImporting}
                type="button"
                onClick={() => importInputRef.current?.click()}
              >
                {isImporting ? 'Cargando...' : 'Carga masiva'}
              </button>
              <input
                ref={importInputRef}
                accept=".xlsx,.csv,.txt"
                className="hidden"
                type="file"
                onChange={handleImport}
              />
            </>
          )}
          <button
            className="rounded-md border border-emerald-700 px-3 py-1.5 text-xs font-medium text-emerald-100 transition hover:border-emerald-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isExporting || (pagination?.total ?? equipment.length) === 0}
            type="button"
            onClick={handleExport}
          >
            {isExporting ? 'Exportando...' : 'Exportar Excel'}
          </button>
          {canCreate && (
            <button
              className="rounded-md border border-cyan-700 px-3 py-1.5 text-xs font-medium text-cyan-100 transition hover:border-cyan-400 hover:text-white"
              type="button"
              onClick={onCreateEquipment}
            >
              Nuevo equipo
            </button>
          )}
        </div>
      </div>

      {canCreate && activeTip && (
        <InfoNotice
          message={activeTip.message}
          subText={activeTip.subText}
          onClose={() => setActiveTip(null)}
        />
      )}

      {importResult && (
        <div className="border-b border-slate-800 bg-slate-950/70 px-4 py-3 text-sm">
          <p className="text-slate-300">
            Carga masiva: {importResult.created} creados de {importResult.total} filas validas.
          </p>
          {importResult.errors.length > 0 && (
            <details className="mt-2 text-amber-200">
              <summary className="cursor-pointer">Ver observaciones ({importResult.errors.length})</summary>
              <ul className="mt-2 space-y-1 text-xs text-amber-100">
                {importResult.errors.slice(0, 12).map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}

      <form
        className="grid gap-3 border-b border-slate-800 px-4 py-4 md:grid-cols-2 lg:grid-cols-[minmax(220px,1.5fr)_minmax(140px,1fr)_minmax(140px,1fr)_minmax(150px,1fr)_110px_auto]"
        onSubmit={applySearch}
      >
        <label className="block text-sm">
          <span className="text-slate-500">Buscar</span>
          <input
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 outline-none transition focus:border-cyan-500"
            placeholder="Codigo, serial, IP, MAC..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <FilterSelect
          label="Estado"
          value={filters.status ?? ''}
          onChange={(value) => updateFilters({ status: value || undefined })}
          options={(catalogs?.statuses ?? []).map((status) => ({
            label: equipmentStatusLabel(status),
            value: status,
          }))}
        />
        <FilterSelect
          label="Tipo"
          value={filters.type ?? ''}
          onChange={(value) => updateFilters({ type: value || undefined })}
          options={(catalogs?.types ?? []).map((type) => ({
            label: type,
            value: type,
          }))}
        />
        <FilterSelect
          label="Propiedad"
          value={filters.ownershipType ?? ''}
          onChange={(value) =>
            updateFilters({ ownershipType: (value || undefined) as EquipmentFilters['ownershipType'] })
          }
          options={(catalogs?.ownershipTypes ?? []).map((ownershipType) => ({
            label: ownershipTypeLabel(ownershipType),
            value: ownershipType,
          }))}
        />
        <FilterSelect
          label="Por pagina"
          value={String(filters.perPage ?? 10)}
          onChange={(value) => updateFilters({ page: 1, perPage: Number(value) })}
          options={[
            { label: '10', value: '10' },
            { label: '20', value: '20' },
            { label: '50', value: '50' },
          ]}
          withEmptyOption={false}
        />
        <div className="flex flex-wrap items-end gap-2 lg:flex-nowrap">
          <button
            className="min-w-20 rounded-md border border-cyan-700 px-3 py-2 text-sm font-medium text-cyan-100 transition hover:border-cyan-400 hover:text-white"
            type="submit"
          >
            Filtrar
          </button>
          <button
            className="min-w-20 rounded-md border border-slate-700 px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white"
            type="button"
            onClick={clearFilters}
          >
            Limpiar
          </button>
        </div>
      </form>

      {equipment.length === 0 ? (
        <div className="px-4 py-12 text-center text-sm text-slate-400">
          No hay equipos que coincidan con los filtros.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] table-fixed text-left text-sm">
            <colgroup>
              <col className="w-[9%]" />
              <col className="w-[9%]" />
              <col className="w-[12%]" />
              <col className="w-[13%]" />
              <col className="w-[13%]" />
              <col className="w-[11%]" />
              <col className="w-[18%]" />
              <col className="w-[15%]" />
            </colgroup>
            <thead className="bg-slate-950 text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Codigo</th>
                <th className="px-4 py-3 font-medium">Serial</th>
                <th className="px-4 py-3 font-medium">Equipo</th>
                <th className="px-4 py-3 font-medium">Red</th>
                <th className="px-4 py-3 font-medium">Hardware</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Ubicacion</th>
                <th className="px-4 py-3 font-medium">Responsable</th>
              </tr>
            </thead>
            <tbody>
              {equipment.map((item) => (
                <tr
                  key={item.id}
                  tabIndex={0}
                  className={
                    item.id === selectedEquipmentId
                      ? 'app-click-row border-t border-cyan-800 bg-cyan-950/30'
                      : 'app-click-row border-t border-slate-800'
                  }
                  onClick={() => onSelectEquipment(item.id)}
                  onContextMenu={(event) => {
                    event.preventDefault()
                    onSelectEquipment(item.id)
                    setContextMenu({
                      x: event.clientX,
                      y: event.clientY,
                      actions: [
                        {
                          icon: 'eye',
                          label: 'Ver detalle',
                          onSelect: () => onOpenEquipmentDetails(item.id),
                        },
                        ...(canUpdate
                          ? [
                              {
                                icon: 'edit' as const,
                                label: 'Editar',
                                onSelect: () => onEditEquipment(item),
                              },
                            ]
                          : []),
                        ...(canDelete
                          ? [
                              {
                                icon: 'trash' as const,
                                label: 'Retirar',
                                onSelect: () => onDeleteEquipment(item.id),
                                separatorBefore: true,
                                tone: 'danger' as const,
                              },
                            ]
                          : []),
                      ],
                    })
                  }}
                >
                  <td className="break-words px-4 py-3 text-white">{item.internalCode}</td>
                  <td className="break-words px-4 py-3 text-slate-300">{item.serial}</td>
                  <td className="break-words px-4 py-3 text-slate-300">
                    {[item.brand, item.model].filter(Boolean).join(' ') || item.type}
                  </td>
                  <td className="break-words px-4 py-3 text-slate-300">
                    <div className="break-words">{item.ipAddresses || 'Sin IP'}</div>
                    <div className="break-words text-xs text-slate-500">{item.macAddress || 'Sin MAC'}</div>
                  </td>
                  <td className="break-words px-4 py-3 text-slate-300">
                    <div className="break-words">{item.processor || 'Sin procesador'}</div>
                    <div className="break-words text-xs text-slate-500">
                      {[item.storageType, formatStorage(item.storageCapacityGb)]
                        .filter(Boolean)
                        .join(' / ') || 'Sin almacenamiento'}
                    </div>
                  </td>
                  <td className="break-words px-4 py-3 text-slate-300">
                    {equipmentStatusLabel(item.status)}
                  </td>
                  <td className="break-words px-4 py-3 text-slate-300">
                    {[item.headquarter?.name, item.location?.area, item.location?.office]
                      .filter(Boolean)
                      .join(' / ') || 'Sin ubicacion'}
                  </td>
                  <td className="break-words px-4 py-3 text-slate-300">
                    {[item.currentResponsible?.name, item.secondaryResponsible?.name]
                      .filter(Boolean)
                      .join(' / ') || 'Sin asignar'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ContextActionMenu menu={contextMenu} onClose={() => setContextMenu(null)} />

      <div className="flex flex-col gap-3 border-t border-slate-800 px-4 py-3 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <span>
          Pagina {currentPage} de {lastPage}
        </span>
        <div className="flex gap-2">
          <button
            className="rounded-md border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            disabled={currentPage <= 1}
            type="button"
            onClick={() => onChangeFilters({ ...filters, page: currentPage - 1 })}
          >
            Anterior
          </button>
          <button
            className="rounded-md border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            disabled={currentPage >= lastPage}
            type="button"
            onClick={() => onChangeFilters({ ...filters, page: currentPage + 1 })}
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  )
}

function formatStorage(value: number | null) {
  return value === null || value === undefined ? null : `${value} GB`
}

function FilterSelect({
  label,
  onChange,
  options,
  value,
  withEmptyOption = true,
}: {
  label: string
  onChange: (value: string) => void
  options: Array<{ label: string; value: string }>
  value: string
  withEmptyOption?: boolean
}) {
  return (
    <label className="block text-sm">
      <span className="text-slate-500">{label}</span>
      <select
        className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 outline-none transition focus:border-cyan-500"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {withEmptyOption && <option value="">Todos</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
