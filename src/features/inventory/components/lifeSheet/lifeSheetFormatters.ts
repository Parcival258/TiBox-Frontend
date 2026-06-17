import type { TechnicalHistoryItem } from '../../types/equipmentHistory'
import {
  failureStatusLabel,
  maintenanceStatusLabel,
} from '@/shared/utils/enumLabels'

export function valueOrEmpty(value: string | null | undefined) {
  return value || 'Sin dato'
}

export function formatStorageCapacity(value: number | null | undefined) {
  return value === null || value === undefined ? 'Sin dato' : `${value} GB`
}

export function formatBytes(value: number | null | undefined) {
  if (!value) {
    return 'Tamano no disponible'
  }

  if (value < 1024 * 1024) {
    return `${Math.round(value / 1024)} KB`
  }

  return `${(value / 1024 / 1024).toFixed(1)} MB`
}

export function technicalHistoryTypeLabel(item: TechnicalHistoryItem) {
  const labels: Record<TechnicalHistoryItem['type'], string> = {
    equipment_assignment: 'Asignacion',
    equipment_loan: 'Prestamo',
    failure_report: 'Falla',
    maintenance_record: 'Mantenimiento',
    maintenance_schedule: 'Programacion',
  }

  return labels[item.type]
}

export function technicalHistoryStatusLabel(item: TechnicalHistoryItem) {
  if (item.type === 'failure_report') {
    return failureStatusLabel(item.status)
  }

  if (item.type === 'equipment_assignment') {
    return item.status === 'returned' ? 'Devuelto' : 'Activo'
  }

  if (item.type === 'equipment_loan') {
    if (item.status === 'returned') return 'Devuelto'
    if (item.status === 'overdue') return 'Vencido'

    return 'Activo'
  }

  return maintenanceStatusLabel(item.status)
}
