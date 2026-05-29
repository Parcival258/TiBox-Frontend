import type { Equipment } from '../types/inventory'

type EquipmentTableProps = {
  equipment: Equipment[]
}

export function EquipmentTable({ equipment }: EquipmentTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
        <h2 className="text-base font-medium text-white">Inventario de equipos</h2>
        <span className="text-sm text-slate-400">{equipment.length} registros</span>
      </div>

      {equipment.length === 0 ? (
        <div className="px-4 py-12 text-center text-sm text-slate-400">
          Todavía no hay equipos registrados.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-950 text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Código</th>
                <th className="px-4 py-3 font-medium">Serial</th>
                <th className="px-4 py-3 font-medium">Equipo</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Ubicación</th>
                <th className="px-4 py-3 font-medium">Responsable</th>
              </tr>
            </thead>
            <tbody>
              {equipment.map((item) => (
                <tr key={item.id} className="border-t border-slate-800">
                  <td className="px-4 py-3 text-white">{item.internal_code}</td>
                  <td className="px-4 py-3 text-slate-300">{item.serial}</td>
                  <td className="px-4 py-3 text-slate-300">
                    {[item.brand, item.model].filter(Boolean).join(' ') || item.type}
                  </td>
                  <td className="px-4 py-3 text-slate-300">{item.status}</td>
                  <td className="px-4 py-3 text-slate-300">
                    {[item.headquarter_name, item.location_area, item.location_office]
                      .filter(Boolean)
                      .join(' / ') || 'Sin ubicación'}
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {[item.responsible_name, item.secondary_responsible_name]
                      .filter(Boolean)
                      .join(' / ') || 'Sin asignar'}
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
