import type { MouseEvent } from 'react'
import type { Equipment } from '../types/equipmentCore'
import {
  type ContextMenuState,
} from '@/shared/ui/contextActionMenu/ContextActionMenu'
import { equipmentStatusLabel } from '@/shared/utils/enumLabels'

type EquipmentGridProps = {
  canDelete: boolean
  canUpdate: boolean
  equipment: Equipment[]
  selectedEquipmentId: string | null
  onDeleteEquipment: (equipmentId: string) => void
  onEditEquipment: (equipment: Equipment) => void
  onOpenEquipmentDetails: (equipmentId: string) => void
  onSelectEquipment: (equipmentId: string) => void
  onSetContextMenu: (menu: ContextMenuState) => void
}

export function EquipmentGrid({
  canDelete,
  canUpdate,
  equipment,
  selectedEquipmentId,
  onDeleteEquipment,
  onEditEquipment,
  onOpenEquipmentDetails,
  onSelectEquipment,
  onSetContextMenu,
}: EquipmentGridProps) {
  if (equipment.length === 0) {
    return (
      <div className="px-4 py-12 text-center text-sm text-slate-400">
        No hay equipos que coincidan con los filtros.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[980px] table-fixed text-left text-sm">
        <colgroup>
          <col className="w-[9%]" />
          <col className="w-[9%]" />
          <col className="w-[12%]" />
          <col className="w-[13%]" />
          <col className="w-[13%]" />
          <col className="w-[11%]" />
          <col className="w-[18%]" />
          <col className="w-[15%]" />
        </colgroup>
        <thead className="bg-slate-950 text-slate-400">
          <tr>
            <th className="px-4 py-3 font-medium">Codigo</th>
            <th className="px-4 py-3 font-medium">Serial</th>
            <th className="px-4 py-3 font-medium">Equipo</th>
            <th className="px-4 py-3 font-medium">Red</th>
            <th className="px-4 py-3 font-medium">Hardware</th>
            <th className="px-4 py-3 font-medium">Estado</th>
            <th className="px-4 py-3 font-medium">Ubicacion</th>
            <th className="px-4 py-3 font-medium">Responsable</th>
          </tr>
        </thead>
        <tbody>
          {equipment.map((item) => (
            <EquipmentGridRow
              canDelete={canDelete}
              canUpdate={canUpdate}
              equipment={item}
              isSelected={item.id === selectedEquipmentId}
              key={item.id}
              onDeleteEquipment={onDeleteEquipment}
              onEditEquipment={onEditEquipment}
              onOpenEquipmentDetails={onOpenEquipmentDetails}
              onSelectEquipment={onSelectEquipment}
              onSetContextMenu={onSetContextMenu}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function EquipmentGridRow({
  canDelete,
  canUpdate,
  equipment,
  isSelected,
  onDeleteEquipment,
  onEditEquipment,
  onOpenEquipmentDetails,
  onSelectEquipment,
  onSetContextMenu,
}: {
  canDelete: boolean
  canUpdate: boolean
  equipment: Equipment
  isSelected: boolean
  onDeleteEquipment: (equipmentId: string) => void
  onEditEquipment: (equipment: Equipment) => void
  onOpenEquipmentDetails: (equipmentId: string) => void
  onSelectEquipment: (equipmentId: string) => void
  onSetContextMenu: (menu: ContextMenuState) => void
}) {
  const isRetired = equipment.status === 'retired'

  function openContextMenu(event: MouseEvent<HTMLTableRowElement>) {
    event.preventDefault()
    onSelectEquipment(equipment.id)
    onSetContextMenu({
      x: event.clientX,
      y: event.clientY,
      actions: [
        {
          icon: 'eye',
          label: 'Ver detalle',
          onSelect: () => onOpenEquipmentDetails(equipment.id),
        },
        ...(canUpdate && !isRetired
          ? [
              {
                icon: 'edit' as const,
                label: 'Editar',
                onSelect: () => onEditEquipment(equipment),
              },
            ]
          : []),
        ...(canDelete && !isRetired
          ? [
              {
                icon: 'trash' as const,
                label: 'Retirar',
                onSelect: () => onDeleteEquipment(equipment.id),
                separatorBefore: true,
                tone: 'danger' as const,
              },
            ]
          : []),
      ],
    })
  }

  return (
    <tr
      tabIndex={0}
      className={
        isSelected
          ? 'app-click-row border-t border-cyan-800 bg-cyan-950/30'
          : 'app-click-row border-t border-slate-800'
      }
      onClick={() => onSelectEquipment(equipment.id)}
      onContextMenu={openContextMenu}
    >
      <td className="break-words px-4 py-3 text-white">{equipment.internalCode}</td>
      <td className="break-words px-4 py-3 text-slate-300">{equipment.serial}</td>
      <td className="break-words px-4 py-3 text-slate-300">
        {[equipment.brand, equipment.model].filter(Boolean).join(' ') || equipment.type}
      </td>
      <td className="break-words px-4 py-3 text-slate-300">
        <div className="break-words">{equipment.ipAddresses || 'Sin IP'}</div>
        <div className="break-words text-xs text-slate-500">{equipment.macAddress || 'Sin MAC'}</div>
      </td>
      <td className="break-words px-4 py-3 text-slate-300">
        <div className="break-words">{equipment.processor || 'Sin procesador'}</div>
        <div className="break-words text-xs text-slate-500">
          {[equipment.storageType, formatStorage(equipment.storageCapacityGb)]
            .filter(Boolean)
            .join(' / ') || 'Sin almacenamiento'}
        </div>
      </td>
      <td className="break-words px-4 py-3 text-slate-300">
        {equipmentStatusLabel(equipment.status)}
      </td>
      <td className="break-words px-4 py-3 text-slate-300">
        {[equipment.headquarter?.name, equipment.location?.area, equipment.location?.office]
          .filter(Boolean)
          .join(' / ') || 'Sin ubicacion'}
      </td>
      <td className="break-words px-4 py-3 text-slate-300">
        {[equipment.currentResponsible?.name, equipment.secondaryResponsible?.name]
          .filter(Boolean)
          .join(' / ') || 'Sin asignar'}
      </td>
    </tr>
  )
}

function formatStorage(value: number | null) {
  return value === null || value === undefined ? null : `${value} GB`
}
