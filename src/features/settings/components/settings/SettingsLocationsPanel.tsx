import { useMemo, useState, type MouseEvent } from 'react'
import { ErrorNotice } from '@/shared/ui/ErrorNotice'
import { InfoNotice } from '@/shared/ui/InfoNotice'
import { AddItemButton } from './AddItemButton'
import type { Headquarter, Location } from '../../types'
import { StatusPill } from '../../pages/SettingsFormFields'

type SettingsLocationsPanelProps = {
  canManage: boolean
  errorNotice: { message: string; subText: string } | null
  locations: Location[]
  selectedHeadquarter: Headquarter | undefined
  showHierarchyInfo: boolean
  onAdd: () => void
  onClearError: () => void
  onCloseHierarchyInfo: () => void
  onEdit: (location: Location) => void
  onOpenContextMenu: (location: Location, event: MouseEvent<HTMLTableRowElement>) => void
}

export function SettingsLocationsPanel({
  canManage,
  errorNotice,
  locations,
  selectedHeadquarter,
  showHierarchyInfo,
  onAdd,
  onClearError,
  onCloseHierarchyInfo,
  onEdit,
  onOpenContextMenu,
}: SettingsLocationsPanelProps) {
  const [search, setSearch] = useState('')
  const [floorFilter, setFloorFilter] = useState('')
  const [areaFilter, setAreaFilter] = useState('')
  const [officeFilter, setOfficeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const floorOptions = useMemo(() => uniqueLocationValues(locations, 'floor'), [locations])
  const areaOptions = useMemo(
    () =>
      uniqueLocationValues(
        locations.filter((location) => !floorFilter || location.floor === floorFilter),
        'area'
      ),
    [floorFilter, locations]
  )
  const officeOptions = useMemo(
    () =>
      uniqueLocationValues(
        locations.filter(
          (location) =>
            (!floorFilter || location.floor === floorFilter) &&
            (!areaFilter || location.area === areaFilter)
        ),
        'office'
      ),
    [areaFilter, floorFilter, locations]
  )
  const filteredLocations = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return locations.filter((location) => {
      const matchesSearch =
        !normalizedSearch ||
        [location.floor, location.area, location.office, location.description]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(normalizedSearch))
      const matchesFloor = !floorFilter || location.floor === floorFilter
      const matchesArea = !areaFilter || location.area === areaFilter
      const matchesOffice = !officeFilter || location.office === officeFilter
      const matchesStatus =
        !statusFilter ||
        (statusFilter === 'active' && location.isActive) ||
        (statusFilter === 'inactive' && !location.isActive)

      return matchesSearch && matchesFloor && matchesArea && matchesOffice && matchesStatus
    })
  }, [areaFilter, floorFilter, locations, officeFilter, search, statusFilter])
  const hasFilters = Boolean(search || floorFilter || areaFilter || officeFilter || statusFilter)

  function clearFilters() {
    setSearch('')
    setFloorFilter('')
    setAreaFilter('')
    setOfficeFilter('')
    setStatusFilter('')
  }

  function changeFloorFilter(value: string) {
    setFloorFilter(value)
    setAreaFilter('')
    setOfficeFilter('')
  }

  function changeAreaFilter(value: string) {
    setAreaFilter(value)
    setOfficeFilter('')
  }

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900">
      <div className="flex flex-col gap-3 border-b border-slate-800 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-cyan-300">Jerarquia</p>
          <h2 className="mt-1 text-lg font-semibold text-white">
            {selectedHeadquarter?.name ?? 'Ubicaciones'}
          </h2>
          <p className="mt-1 text-sm text-slate-400">Sede / piso / area / oficina</p>
        </div>
        {canManage && <AddItemButton label="Ubicacion" onClick={onAdd} />}
        {errorNotice && (
          <ErrorNotice
            message={errorNotice.message}
            subText={errorNotice.subText}
            onClose={onClearError}
          />
        )}
      </div>

      <div className="grid gap-3 border-b border-slate-800 px-4 py-4 md:grid-cols-2 xl:grid-cols-[minmax(200px,1.4fr)_minmax(100px,0.8fr)_minmax(130px,1fr)_minmax(130px,1fr)_minmax(120px,0.9fr)_auto]">
        <label className="block text-sm">
          <span className="text-slate-500">Buscar</span>
          <input
            className="mt-1 h-10 w-full rounded-md border border-slate-700 bg-slate-950 px-3 text-sm text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-cyan-500"
            placeholder="Piso, area, oficina..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <LocationFilterSelect
          label="Piso"
          options={floorOptions.map((value) => ({ label: value, value }))}
          value={floorFilter}
          onChange={changeFloorFilter}
        />
        <LocationFilterSelect
          label="Area"
          options={areaOptions.map((value) => ({ label: value, value }))}
          value={areaFilter}
          onChange={changeAreaFilter}
        />
        <LocationFilterSelect
          label="Oficina"
          options={officeOptions.map((value) => ({ label: value, value }))}
          value={officeFilter}
          onChange={setOfficeFilter}
        />
        <LocationFilterSelect
          label="Estado"
          options={[
            { label: 'Activas', value: 'active' },
            { label: 'Inactivas', value: 'inactive' },
          ]}
          value={statusFilter}
          onChange={setStatusFilter}
        />
        <div className="flex items-end gap-2">
          <span className="h-10 rounded-md border border-slate-800 px-3 py-2 text-sm text-slate-400">
            {filteredLocations.length}/{locations.length}
          </span>
          <button
            className="h-10 rounded-md border border-slate-700 px-3 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            disabled={!hasFilters}
            type="button"
            onClick={clearFilters}
          >
            Limpiar
          </button>
        </div>
      </div>

      {showHierarchyInfo && (
        <InfoNotice
          message="Jerarquia de ubicaciones"
          subText="Primero selecciona la sede; luego registra ubicaciones por piso, area y oficina."
          onClose={onCloseHierarchyInfo}
        />
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="bg-slate-950 text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Piso</th>
              <th className="px-4 py-3 font-medium">Area</th>
              <th className="px-4 py-3 font-medium">Oficina</th>
              <th className="px-4 py-3 font-medium">Descripcion</th>
              <th className="px-4 py-3 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {filteredLocations.length === 0 ? (
              <tr>
                <td className="px-4 py-10 text-center text-slate-400" colSpan={5}>
                  {locations.length === 0
                    ? 'Esta sede no tiene ubicaciones registradas.'
                    : 'No hay ubicaciones que coincidan con los filtros.'}
                </td>
              </tr>
            ) : (
              filteredLocations.map((location) => (
                <tr
                  key={location.id}
                  className="app-click-row border-t border-slate-800"
                  tabIndex={0}
                  onClick={() => {
                    if (canManage) {
                      onEdit(location)
                    }
                  }}
                  onContextMenu={(event) => onOpenContextMenu(location, event)}
                >
                  <td className="px-4 py-3 text-slate-300">{location.floor || 'Sin piso'}</td>
                  <td className="px-4 py-3 text-white">{location.area || 'Sin area'}</td>
                  <td className="px-4 py-3 text-slate-300">{location.office || 'Sin oficina'}</td>
                  <td className="px-4 py-3 text-slate-400">{location.description || 'Sin descripcion'}</td>
                  <td className="px-4 py-3"><StatusPill isActive={location.isActive} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function uniqueLocationValues(locations: Location[], key: 'area' | 'floor' | 'office') {
  return Array.from(
    new Set(
      locations
        .map((location) => location[key])
        .filter((value): value is string => Boolean(value))
    )
  ).sort((first, second) => first.localeCompare(second))
}

function LocationFilterSelect({
  label,
  onChange,
  options,
  value,
}: {
  label: string
  onChange: (value: string) => void
  options: Array<{ label: string; value: string }>
  value: string
}) {
  return (
    <label className="block text-sm">
      <span className="text-slate-500">{label}</span>
      <select
        className="mt-1 h-10 w-full rounded-md border border-slate-700 bg-slate-950 px-3 text-sm text-slate-200 outline-none transition focus:border-cyan-500"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Todos</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
