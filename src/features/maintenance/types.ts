import type { Person } from '@/shared/types/person'

export type CatalogItem = {
  label: string
  value: string
}

export type MaintenanceSchedule = {
  id: string
  maintenanceType: string
  maintenanceTypeLabel?: string
  status: string
  statusLabel?: string
  priority: string
  priorityLabel?: string
  scheduledFor: string
  assignedTechnician: Person
  equipment?: {
    id: string
    internalCode: string
    type: string
    brand: string | null
    model: string | null
  }
  frequencyMonths: number | null
  notes: string | null
}

export type CreateMaintenanceSchedulePayload = {
  equipmentId: string
  maintenanceType: 'preventive' | 'corrective'
  status?: string
  priority?: string
  scheduledFor: string
  assignedTechnicianId?: string
  frequencyMonths?: number
  notes?: string
}

export type MaintenanceRecord = {
  id: string
  maintenanceType: string
  status: string
  priority: string
  scheduledDate: string | null
  performedAt: string | null
  performer: Person
  description: string | null
  diagnosis: string | null
  actionsTaken: string | null
  partsReplaced: string | null
  cost: string | null
  nextMaintenanceAt: string | null
}

export type CreateMaintenanceRecordPayload = {
  equipmentId: string
  maintenanceScheduleId?: string
  maintenanceType: 'preventive' | 'corrective'
  status?: string
  priority?: string
  scheduledDate?: string
  performedAt?: string
  performedBy?: string
  description?: string
  diagnosis?: string
  actionsTaken?: string
  partsReplaced?: string
  cost?: number
  nextMaintenanceAt?: string
}

export type FinishMaintenanceSchedulePayload = {
  actionsTaken?: string
  cost?: number
  description?: string
  diagnosis?: string
  nextMaintenanceAt?: string
  partsReplaced?: string
  performedAt?: string
  performedBy?: string
}

export type MaintenanceScheduleCatalogs = {
  maintenanceTypes: CatalogItem[]
  priorities: CatalogItem[]
  statuses: CatalogItem[]
}
