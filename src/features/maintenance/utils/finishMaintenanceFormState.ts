import type { FinishMaintenanceSchedulePayload, MaintenanceSchedule } from '../types'
import { todayIsoDate } from './maintenanceDisplay'

export type FinishMaintenanceFormState = {
  actionsTaken: string
  cost: string
  description: string
  diagnosis: string
  nextMaintenanceAt: string
  partsReplaced: string
  performedAt: string
}

export function createFinishMaintenanceForm(): FinishMaintenanceFormState {
  return {
    actionsTaken: '',
    cost: '',
    description: '',
    diagnosis: '',
    nextMaintenanceAt: '',
    partsReplaced: '',
    performedAt: todayIsoDate(),
  }
}

export function finishMaintenanceFormToPayload(
  form: FinishMaintenanceFormState,
  schedule: MaintenanceSchedule,
): FinishMaintenanceSchedulePayload {
  return {
    actionsTaken: form.actionsTaken || undefined,
    cost: form.cost ? Number(form.cost) : undefined,
    description: form.description || undefined,
    diagnosis: form.diagnosis || undefined,
    nextMaintenanceAt: form.nextMaintenanceAt || undefined,
    partsReplaced: form.partsReplaced || undefined,
    performedAt: form.performedAt || undefined,
    performedBy: schedule.assignedTechnician?.id,
  }
}
