import { type FormEvent } from 'react'
import type { EquipmentCatalogs } from '../types/equipmentCatalogs'
import type { EquipmentFilters } from '../types/equipmentCore'
import { equipmentStatusLabel, ownershipTypeLabel } from '@/shared/utils/enumLabels'

type EquipmentTableFiltersProps = {
  catalogs: EquipmentCatalogs | null
  filters: EquipmentFilters
  search: string
  onApplySearch: (event: FormEvent) => void
  onChangeFilters: (filters: EquipmentFilters) => void
  onChangeSearch: (value: string) => void
  onClearFilters: () => void
}

export function EquipmentTableFilters({
  catalogs,
  filters,
  search,
  onApplySearch,
  onChangeFilters,
  onChangeSearch,
  onClearFilters,
}: EquipmentTableFiltersProps) {
  return (
    <form
      className="grid gap-3 border-b border-slate-800 px-4 py-4 sm:grid-cols-2 lg:grid-cols-[minmax(220px,1.5fr)_minmax(140px,1fr)_minmax(140px,1fr)_minmax(150px,1fr)_110px_auto]"
      onSubmit={onApplySearch}
    >
      <label className="block text-sm">
        <span className="text-slate-500">Buscar</span>
        <input
          className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 outline-none transition focus:border-cyan-500"
          placeholder="Codigo, serial, IP, MAC..."
          value={search}
          onChange={(event) => onChangeSearch(event.target.value)}
        />
      </label>
      <FilterSelect
        label="Estado"
        value={filters.status ?? ''}
        onChange={(value) => onChangeFilters({ status: value || undefined })}
        options={(catalogs?.statuses ?? []).map((status) => ({
          label: equipmentStatusLabel(status),
          value: status,
        }))}
      />
      <FilterSelect
        label="Tipo"
        value={filters.type ?? ''}
        onChange={(value) => onChangeFilters({ type: value || undefined })}
        options={(catalogs?.types ?? []).map((type) => ({
          label: type,
          value: type,
        }))}
      />
      <FilterSelect
        label="Propiedad"
        value={filters.ownershipType ?? ''}
        onChange={(value) =>
          onChangeFilters({ ownershipType: (value || undefined) as EquipmentFilters['ownershipType'] })
        }
        options={(catalogs?.ownershipTypes ?? []).map((ownershipType) => ({
          label: ownershipTypeLabel(ownershipType),
          value: ownershipType,
        }))}
      />
      <FilterSelect
        label="Por pagina"
        value={String(filters.perPage ?? 10)}
        onChange={(value) => onChangeFilters({ page: 1, perPage: Number(value) })}
        options={[
          { label: '10', value: '10' },
          { label: '20', value: '20' },
          { label: '50', value: '50' },
        ]}
        withEmptyOption={false}
      />
      <div className="grid gap-2 sm:col-span-2 sm:flex sm:flex-wrap sm:items-end lg:col-span-1 lg:flex-nowrap">
        <button
          className="min-w-20 rounded-md border border-cyan-700 px-3 py-2 text-sm font-medium text-cyan-100 transition hover:border-cyan-400 hover:text-white"
          type="submit"
        >
          Filtrar
        </button>
        <button
          className="min-w-20 rounded-md border border-slate-700 px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white"
          type="button"
          onClick={onClearFilters}
        >
          Limpiar
        </button>
      </div>
    </form>
  )
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
