import type { CreateMaintenanceSchedulePayload } from '../types'

export type MaintenanceScheduleFormState = {
  assignedTechnicianId: string
  equipmentId: string
  frequencyMonths: string
  maintenanceType: 'preventive' | 'corrective'
  notes: string
  priority: string
  scheduledFor: string
  status: string
}

export const emptyMaintenanceScheduleForm: MaintenanceScheduleFormState = {
  assignedTechnicianId: '',
  equipmentId: '',
  frequencyMonths: '',
  maintenanceType: 'preventive',
  notes: '',
  priority: 'medium',
  scheduledFor: '',
  status: 'scheduled',
}

export const fallbackMaintenanceTypes = [
  { label: 'Preventivo', value: 'preventive' },
  { label: 'Correctivo', value: 'corrective' },
]

export const fallbackMaintenancePriorities = [
  { label: 'Baja', value: 'low' },
  { label: 'Media', value: 'medium' },
  { label: 'Alta', value: 'high' },
  { label: 'Critica', value: 'critical' },
]

export const fallbackMaintenanceStatuses = [
  { label: 'Programado', value: 'scheduled' },
  { label: 'Pendiente', value: 'pending' },
  { label: 'En proceso', value: 'in_progress' },
  { label: 'Reprogramado', value: 'rescheduled' },
]

export function maintenanceScheduleFormToPayload(
  form: MaintenanceScheduleFormState,
): CreateMaintenanceSchedulePayload {
  return {
    equipmentId: form.equipmentId,
    maintenanceType: form.maintenanceType,
    scheduledFor: form.scheduledFor,
    assignedTechnicianId: optional(form.assignedTechnicianId),
    frequencyMonths: form.frequencyMonths ? Number(form.frequencyMonths) : undefined,
    notes: optional(form.notes),
    priority: optional(form.priority),
    status: optional(form.status),
  }
}

function optional(value: string) {
  return value.trim() || undefined
}
