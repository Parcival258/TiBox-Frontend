import type { Equipment } from '../types/equipmentCore'
import { formatDate } from '@/shared/utils/dateFormat'
import { equipmentStatusLabel, ownershipTypeLabel } from '@/shared/utils/enumLabels'

export function downloadEquipmentCsv(equipment: Equipment[]) {
  const headers = [
    'Codigo',
    'Serial',
    'Tipo',
    'Marca',
    'Modelo',
    'Estado',
    'Propiedad',
    'IP',
    'MAC',
    'Procesador',
    'Almacenamiento',
    'Sede',
    'Piso',
    'Area',
    'Oficina',
    'Responsable',
    'Responsable secundario',
    'Ultimo mantenimiento',
    'Proximo mantenimiento',
    'Notas',
  ]
  const rows = equipment.map((item) => [
    item.internalCode,
    item.serial,
    item.type,
    item.brand,
    item.model,
    equipmentStatusLabel(item.status),
    ownershipTypeLabel(item.ownershipType),
    item.ipAddresses,
    item.macAddress,
    item.processor,
    [item.storageType, item.storageCapacityGb ? `${item.storageCapacityGb} GB` : null]
      .filter(Boolean)
      .join(' / '),
    item.headquarter?.name,
    item.location?.floor,
    item.location?.area,
    item.location?.office,
    item.currentResponsible?.name,
    item.secondaryResponsible?.name,
    formatDate(item.lastMaintenanceAt, ''),
    formatDate(item.nextMaintenanceAt, ''),
    item.notes,
  ])
  const csv = [headers, ...rows].map((row) => row.map(csvCell).join(';')).join('\r\n')
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `inventario-equipos-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

function csvCell(value: string | number | null | undefined) {
  const text = value === null || value === undefined ? '' : String(value)
  return `"${text.replace(/"/g, '""')}"`
}
