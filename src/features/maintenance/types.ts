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
  currentStage: MaintenanceStage | null
  scheduledDate: string | null
  receivedAt: string | null
  performedAt: string | null
  closedAt: string | null
  performer: Person
  equipment?: {
    id: string
    internalCode: string
    assetTag?: string | null
    serial?: string
    type: string
    brand: string | null
    model: string | null
    headquarter?: { id?: string; name: string } | null
    location?: { area: string | null; office: string | null } | null
  }
  description: string | null
  initialEquipmentState: string | null
  receptionObservations: string | null
  diagnosis: string | null
  actionsTaken: string | null
  technicalObservations: string | null
  partsReplaced: string | null
  componentsUsed: string | null
  cost: string | null
  componentsCost: string | null
  softwareWork: string | null
  finalEquipmentState: string | null
  receivedByName: string | null
  finalDestination: string | null
  nextMaintenanceAt: string | null
}

export type MaintenanceStage = 'reception' | 'execution' | 'closure'

export type CreateMaintenanceRecordPayload = {
  equipmentId: string
  maintenanceScheduleId?: string
  maintenanceType: 'preventive' | 'corrective'
  status?: string
  priority?: string
  currentStage?: MaintenanceStage
  scheduledDate?: string
  receivedAt?: string
  performedAt?: string
  closedAt?: string
  performedBy?: string
  description?: string
  initialEquipmentState?: string
  receptionObservations?: string
  diagnosis?: string
  actionsTaken?: string
  technicalObservations?: string
  partsReplaced?: string
  componentsUsed?: string
  cost?: number
  componentsCost?: number
  softwareWork?: string
  finalEquipmentState?: string
  receivedByName?: string
  finalDestination?: string
  nextMaintenanceAt?: string
}

export type MaintenanceFilters = {
  equipmentGroupId?: string
  headquarterId?: string
  maintenanceScheduleId?: string
  maintenanceType?: 'preventive' | 'corrective'
  scheduledFrom?: string
  scheduledTo?: string
  status?: string
}

export type MaintenanceAttachment = {
  id: string
  fileName: string
  mimeType: string | null
  sizeBytes: number | null
  maintenanceStage: MaintenanceStage | null
  createdAt: string
  uploader?: Person | null
}

export type MaintenanceHistoryItem = {
  id: string
  action: string
  oldValues: Record<string, unknown> | null
  newValues: Record<string, unknown> | null
  createdAt: string
  user?: Person | null
}

export type EquipmentGroup = {
  id: string
  name: string
  description: string | null
  equipment: Array<{
    id: string
    internalCode: string
    type: string
    brand: string | null
    model: string | null
  }>
}

export type EquipmentGroupPayload = {
  description?: string
  equipmentIds?: string[]
  name: string
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
