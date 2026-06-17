import type { Equipment } from '@/features/inventory/types/equipmentCore'
import type { MaintenanceSchedule } from '../types'

export function maintenanceEquipmentLabel(item: Equipment) {
  const model = [item.brand, item.model].filter(Boolean).join(' ')

  return `${item.internalCode} / ${model || item.type}`
}

export function scheduleEquipmentName(schedule: MaintenanceSchedule) {
  if (!schedule.equipment) {
    return 'Equipo no disponible'
  }

  const model = [schedule.equipment.brand, schedule.equipment.model].filter(Boolean).join(' ')

  return `${schedule.equipment.internalCode} / ${model || schedule.equipment.type}`
}

export function todayIsoDate() {
  return new Date().toISOString().slice(0, 10)
}
