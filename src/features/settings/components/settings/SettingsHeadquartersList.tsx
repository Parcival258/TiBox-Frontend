import type { MouseEvent } from 'react'
import { AddItemButton } from './AddItemButton'
import type { Headquarter } from '../../types'
import { StatusPill } from '../../pages/SettingsFormFields'

type SettingsHeadquartersListProps = {
  activeHeadquarterId: string
  canManage: boolean
  headquarters: Headquarter[]
  onAdd: () => void
  onContextMenu: (headquarter: Headquarter, event: MouseEvent<HTMLButtonElement>) => void
  onSelect: (headquarterId: string) => void
}

export function SettingsHeadquartersList({
  activeHeadquarterId,
  canManage,
  headquarters,
  onAdd,
  onContextMenu,
  onSelect,
}: SettingsHeadquartersListProps) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900">
      <div className="flex flex-col gap-3 border-b border-slate-800 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-cyan-300">Configuracion</p>
          <h2 className="mt-1 text-lg font-semibold text-white">Sedes</h2>
        </div>
        {canManage && <AddItemButton label="Sede" onClick={onAdd} />}
      </div>

      <div className="divide-y divide-slate-800">
        {headquarters.map((headquarter) => (
          <button
            key={headquarter.id}
            className={`block w-full px-4 py-3 text-left transition ${
              headquarter.id === activeHeadquarterId ? 'bg-cyan-950/40' : 'hover:bg-slate-950/70'
            }`}
            type="button"
            onClick={() => onSelect(headquarter.id)}
            onContextMenu={(event) => onContextMenu(headquarter, event)}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-white">{headquarter.name}</p>
                <p className="mt-1 text-sm text-slate-400">
                  {[headquarter.city, headquarter.address].filter(Boolean).join(' / ') || 'Sin ciudad'}
                </p>
              </div>
              <StatusPill isActive={headquarter.isActive} />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
