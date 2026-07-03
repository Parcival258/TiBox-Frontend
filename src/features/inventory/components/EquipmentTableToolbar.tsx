import { type ChangeEvent, type RefObject } from 'react'

type EquipmentTableToolbarProps = {
  canCreate: boolean
  importInputRef: RefObject<HTMLInputElement | null>
  isExportDisabled: boolean
  isExporting: boolean
  isImporting: boolean
  pendingImportFileName: string | null
  totalRecords: number
  onCreateEquipment: () => void
  onDownloadImportTemplate: () => Promise<void>
  onExportEquipment: () => Promise<void>
  onImportEquipment: (event: ChangeEvent<HTMLInputElement>) => Promise<void>
  onProcessImport: () => Promise<void>
  onRemoveImportFile: () => void
}

export function EquipmentTableToolbar({
  canCreate,
  importInputRef,
  isExportDisabled,
  isExporting,
  isImporting,
  pendingImportFileName,
  totalRecords,
  onCreateEquipment,
  onDownloadImportTemplate,
  onExportEquipment,
  onImportEquipment,
  onProcessImport,
  onRemoveImportFile,
}: EquipmentTableToolbarProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-800 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
      <h2 className="text-base font-medium text-white">Inventario de equipos</h2>
      <div className="grid gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
        <span className="text-sm text-slate-400">{totalRecords} registros</span>
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
              disabled={isImporting || Boolean(pendingImportFileName)}
              type="button"
              onClick={() => importInputRef.current?.click()}
            >
              {pendingImportFileName ? 'Archivo listo' : isImporting ? 'Cargando...' : 'Carga masiva'}
            </button>
            <input
              ref={importInputRef}
              accept=".xlsx,.csv,.txt"
              className="hidden"
              type="file"
              onChange={onImportEquipment}
            />
            {pendingImportFileName && (
              <div className="grid max-w-full gap-2 rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs sm:flex sm:items-center">
                <span className="max-w-48 truncate text-slate-300">{pendingImportFileName}</span>
                <button
                  className="text-slate-400 transition hover:text-red-200"
                  disabled={isImporting}
                  type="button"
                  onClick={onRemoveImportFile}
                >
                  Quitar
                </button>
                <button
                  className="rounded border border-indigo-700 px-2 py-0.5 font-medium text-indigo-100 transition hover:border-indigo-400 disabled:opacity-50"
                  disabled={isImporting}
                  type="button"
                  onClick={onProcessImport}
                >
                  {isImporting ? 'Importando...' : 'Importar'}
                </button>
              </div>
            )}
          </>
        )}
        <button
          className="rounded-md border border-emerald-700 px-3 py-1.5 text-xs font-medium text-emerald-100 transition hover:border-emerald-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isExportDisabled}
          type="button"
          onClick={onExportEquipment}
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
  )
}
