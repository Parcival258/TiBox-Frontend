import type { RoleOption } from '../types'
import { UserFilterSelect } from './UserFieldControls'

type UserFiltersProps = {
  departmentFilter: string
  departmentOptions: string[]
  hasFilters: boolean
  roleFilter: string
  roles: RoleOption[]
  search: string
  statusFilter: string
  onClear: () => void
  onDepartmentFilterChange: (value: string) => void
  onRoleFilterChange: (value: string) => void
  onSearchChange: (value: string) => void
  onStatusFilterChange: (value: string) => void
}

export function UserFilters({
  departmentFilter,
  departmentOptions,
  hasFilters,
  roleFilter,
  roles,
  search,
  statusFilter,
  onClear,
  onDepartmentFilterChange,
  onRoleFilterChange,
  onSearchChange,
  onStatusFilterChange,
}: UserFiltersProps) {
  return (
    <div className="grid gap-3 border-b border-slate-800 px-4 py-4 md:grid-cols-2 xl:grid-cols-[minmax(220px,1.5fr)_minmax(140px,1fr)_minmax(140px,1fr)_minmax(160px,1fr)_auto]">
      <label className="block text-sm">
        <span className="text-slate-500">Buscar</span>
        <input
          className="mt-1 h-10 w-full rounded-md border border-slate-700 bg-slate-950 px-3 text-sm text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-cyan-500"
          placeholder="Nombre, correo, cargo..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </label>
      <UserFilterSelect
        label="Rol"
        value={roleFilter}
        onChange={onRoleFilterChange}
        options={roles.map((role) => ({ label: role.name, value: role.id }))}
      />
      <UserFilterSelect
        label="Estado"
        value={statusFilter}
        onChange={onStatusFilterChange}
        options={[
          { label: 'Activos', value: 'active' },
          { label: 'Inactivos', value: 'inactive' },
        ]}
      />
      <UserFilterSelect
        label="Departamento"
        value={departmentFilter}
        onChange={onDepartmentFilterChange}
        options={departmentOptions.map((department) => ({ label: department, value: department }))}
      />
      <div className="flex items-end">
        <button
          className="h-10 rounded-md border border-slate-700 px-3 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          disabled={!hasFilters}
          type="button"
          onClick={onClear}
        >
          Limpiar
        </button>
      </div>
    </div>
  )
}
