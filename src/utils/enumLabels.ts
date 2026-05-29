const equipmentStatusLabels: Record<string, string> = {
  active: 'Activo',
  inactive: 'Inactivo',
  in_maintenance: 'En mantenimiento',
  damaged: 'Danado',
  retired: 'Retirado',
  lost: 'Perdido',
}

const ownershipTypeLabels: Record<string, string> = {
  owned: 'Propio',
  leased: 'Arrendado',
}

const maintenanceTypeLabels: Record<string, string> = {
  preventive: 'Preventivo',
  corrective: 'Correctivo',
}

const maintenanceStatusLabels: Record<string, string> = {
  scheduled: 'Programado',
  pending: 'Pendiente',
  in_progress: 'En proceso',
  completed: 'Completado',
  cancelled: 'Cancelado',
  rescheduled: 'Reprogramado',
  overdue: 'Vencido',
}

const priorityLabels: Record<string, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  critical: 'Critica',
}

const failureStatusLabels: Record<string, string> = {
  open: 'Abierta',
  closed: 'Cerrada',
  in_progress: 'En proceso',
  resolved: 'Resuelta',
}

function labelFrom(map: Record<string, string>, value: string | null | undefined) {
  if (!value) {
    return 'Sin dato'
  }

  return map[value] ?? value
}

export function equipmentStatusLabel(value: string | null | undefined) {
  return labelFrom(equipmentStatusLabels, value)
}

export function ownershipTypeLabel(value: string | null | undefined) {
  return labelFrom(ownershipTypeLabels, value)
}

export function maintenanceTypeLabel(value: string | null | undefined) {
  return labelFrom(maintenanceTypeLabels, value)
}

export function maintenanceStatusLabel(value: string | null | undefined) {
  return labelFrom(maintenanceStatusLabels, value)
}

export function priorityLabel(value: string | null | undefined) {
  return labelFrom(priorityLabels, value)
}

export function failureStatusLabel(value: string | null | undefined) {
  return labelFrom(failureStatusLabels, value)
}
