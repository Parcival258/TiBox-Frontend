import type { EquipmentFilters } from '../types/equipmentCore'

type EquipmentTablePaginationProps = {
  currentPage: number
  filters: EquipmentFilters
  lastPage: number
  onChangeFilters: (filters: EquipmentFilters) => void
}

export function EquipmentTablePagination({
  currentPage,
  filters,
  lastPage,
  onChangeFilters,
}: EquipmentTablePaginationProps) {
  return (
    <div className="flex flex-col gap-3 border-t border-slate-800 px-4 py-3 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
      <span>
        Pagina {currentPage} de {lastPage}
      </span>
      <div className="grid grid-cols-2 gap-2 sm:flex">
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
  )
}
