import type { Equipment } from '../types/inventory'
import { equipmentStatusLabel } from '../utils/enumLabels'

type EquipmentTableProps = {
  equipment: Equipment[]
  onSelectEquipment: (equipmentId: string) => void
  selectedEquipmentId: string | null
}

export function EquipmentTable({
  equipment,
  onSelectEquipment,
  selectedEquipmentId,
}: EquipmentTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
        <h2 className="text-base font-medium text-white">Inventario de equipos</h2>
        <span className="text-sm text-slate-400">{equipment.length} registros</span>
      </div>

      {equipment.length === 0 ? (
        <div className="px-4 py-12 text-center text-sm text-slate-400">
          Todavia no hay equipos registrados.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-slate-950 text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Codigo</th>
                <th className="px-4 py-3 font-medium">Serial</th>
                <th className="px-4 py-3 font-medium">Equipo</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Ubicacion</th>
                <th className="px-4 py-3 font-medium">Responsable</th>
                <th className="px-4 py-3 font-medium">Hoja de vida</th>
              </tr>
            </thead>
            <tbody>
              {equipment.map((item) => (
                <tr
                  key={item.id}
                  className={
                    item.id === selectedEquipmentId
                      ? 'border-t border-cyan-800 bg-cyan-950/30'
                      : 'border-t border-slate-800'
                  }
                >
                  <td className="px-4 py-3 text-white">{item.internalCode}</td>
                  <td className="px-4 py-3 text-slate-300">{item.serial}</td>
                  <td className="px-4 py-3 text-slate-300">
                    {[item.brand, item.model].filter(Boolean).join(' ') || item.type}
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {equipmentStatusLabel(item.status)}
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {[item.headquarter?.name, item.location?.area, item.location?.office]
                      .filter(Boolean)
                      .join(' / ') || 'Sin ubicacion'}
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {[item.currentResponsible?.name, item.secondaryResponsible?.name]
                      .filter(Boolean)
                      .join(' / ') || 'Sin asignar'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      className="rounded-md border border-cyan-700 px-3 py-1.5 text-xs font-medium text-cyan-200 transition hover:border-cyan-400 hover:text-white"
                      type="button"
                      onClick={() => onSelectEquipment(item.id)}
                    >
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
