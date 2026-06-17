import type { MouseEvent } from 'react'
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
            {locations.length === 0 ? (
              <tr>
                <td className="px-4 py-10 text-center text-slate-400" colSpan={5}>
                  Esta sede no tiene ubicaciones registradas.
                </td>
              </tr>
            ) : (
              locations.map((location) => (
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
