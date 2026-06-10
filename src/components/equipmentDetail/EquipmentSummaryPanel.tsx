import { AppLoader } from '../Loaders'
import type { EquipmentLifeSheet } from '../../types/inventory'
import { equipmentStatusLabel, ownershipTypeLabel } from '../../utils/enumLabels'

type EquipmentSummaryPanelProps = {
  lifeSheet: EquipmentLifeSheet | null
  onOpenDetails: () => void
  status: 'idle' | 'loading' | 'ready' | 'error'
}

function valueOrEmpty(value: string | null | undefined) {
  return value || 'Sin dato'
}

export function EquipmentSummaryPanel({
  lifeSheet,
  onOpenDetails,
  status,
}: EquipmentSummaryPanelProps) {
  if (status === 'idle') {
    return (
      <aside className="rounded-lg border border-slate-800 bg-slate-900 p-5 text-sm text-slate-400">
        Selecciona un equipo para ver sus detalles basicos.
      </aside>
    )
  }

  if (status === 'loading') {
    return (
      <aside className="rounded-lg border border-slate-800 bg-slate-900 p-5 text-sm text-slate-400">
        <AppLoader label="Cargando detalles..." />
      </aside>
    )
  }

  if (status === 'error' || !lifeSheet) {
    return (
      <aside className="rounded-lg border border-red-900 bg-red-950/30 p-5 text-sm text-red-200">
        No fue posible cargar los detalles del equipo.
      </aside>
    )
  }

  const { equipment, summary } = lifeSheet
  const title = [equipment.brand, equipment.model].filter(Boolean).join(' ') || equipment.type
  const location =
    [equipment.headquarter?.name, equipment.location?.area, equipment.location?.office]
      .filter(Boolean)
      .join(' / ') || 'Sin ubicacion'

  return (
    <aside className="rounded-lg border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-cyan-300">Equipo seleccionado</p>
          <h2 className="mt-1 truncate text-xl font-semibold text-white">{equipment.internalCode}</h2>
          <p className="mt-1 truncate text-sm text-slate-400">{title}</p>
        </div>
        <button
          className="shrink-0 rounded-md border border-cyan-700 px-3 py-2 text-xs font-semibold text-cyan-100 transition hover:border-cyan-400 hover:text-white"
          type="button"
          onClick={onOpenDetails}
        >
          Ver todo
        </button>
      </div>

      <div className="mt-5 grid gap-3 text-sm">
        <SummaryInfo label="Estado" value={equipmentStatusLabel(equipment.status)} />
        <SummaryInfo label="Responsable" value={valueOrEmpty(equipment.currentResponsible?.name)} />
        <SummaryInfo label="Ubicacion" value={location} />
        <SummaryInfo label="Propiedad" value={ownershipTypeLabel(equipment.ownershipType)} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <Metric label="Fallas" value={summary.openFailureReports} />
        <Metric label="Mant." value={summary.totalMaintenanceRecords} />
      </div>
    </aside>
  )
}

function SummaryInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-800 bg-slate-950 px-3 py-2">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-slate-200">{value}</p>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-slate-800 bg-slate-950 px-3 py-2">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  )
}
