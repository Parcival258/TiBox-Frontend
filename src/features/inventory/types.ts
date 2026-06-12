import type { EquipmentLoan } from '@/features/loans/types'
import type { MaintenanceRecord, MaintenanceSchedule } from '@/features/maintenance/types'
import type { Headquarter } from '@/features/settings/types'
import type { Person, Responsible } from '@/shared/types/person'

export type Equipment = {
  id: string
  internalCode: string
  assetTag: string | null
  serial: string
  type: string
  brand: string | null
  model: string | null
  ipAddresses: string | null
  macAddress: string | null
  processor: string | null
  storageType: string | null
  storageCapacityGb: number | null
  ownershipType: 'owned' | 'leased'
  status: string
  headquarter: { name: string } | null
  location: { area: string | null; office: string | null } | null
  currentResponsible: { name: string } | null
  secondaryResponsible: { name: string } | null
  purchaseDate?: string | null
  warrantyUntil?: string | null
  leaseProvider?: string | null
  leaseContractNumber?: string | null
  leaseUntil?: string | null
  lastMaintenanceAt?: string | null
  nextMaintenanceAt?: string | null
  notes?: string | null
}

export type EquipmentCatalogs = {
  statuses: readonly string[]
  ownershipTypes: readonly string[]
  types: string[]
  brands: string[]
  headquarters: Array<{ id: string; name: string; city: string | null }>
  locations: Array<{
    id: string
    headquarterId: string
    floor: string | null
    area: string | null
    office: string | null
  }>
  responsibles: Responsible[]
  technicians: Responsible[]
}

export type EquipmentType = {
  id: string
  name: string
  description: string | null
  isActive: boolean
}

export type EquipmentTypePayload = {
  name: string
  description?: string
  isActive?: boolean
}

export type EquipmentPayload = {
  internalCode: string
  assetTag?: string
  serial: string
  type: string
  brand?: string
  model?: string
  ipAddresses?: string
  macAddress?: string
  processor?: string
  storageType?: string
  storageCapacityGb?: number
  ownershipType?: 'owned' | 'leased'
  status?: string
  headquarterId?: string
  locationId?: string
  currentResponsibleId?: string
  secondaryResponsibleId?: string
  purchaseDate?: string
  warrantyUntil?: string
  leaseProvider?: string
  leaseContractNumber?: string
  leaseUntil?: string
  notes?: string
}

export type EquipmentFilters = {
  brand?: string
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
  ownershipType?: 'owned' | 'leased'
  page?: number
  perPage?: number
  search?: string
  status?: string
  type?: string
}

export type EquipmentAssignment = {
  id: string
  user: Person
  assigner: Person
  assignedAt: string
  returnedAt: string | null
  notes: string | null
}

export type CreateFailureReportPayload = {
  equipmentId: string
  title: string
  description: string
  priority?: string
}

export type FailureReport = {
  id: string
  title: string
  description: string
  status: string
  priority: string
  reporter: Person
  createdAt: string
  closedAt: string | null
}

export type EquipmentAttachment = {
  id: string
  fileName: string
  mimeType: string | null
  sizeBytes: number | null
  uploader: Person
  createdAt: string
}

export type AuditLog = {
  id: string
  action: string
  user: Person
  createdAt: string
}

export type TechnicalHistoryItem = {
  id: string
  sourceId: string
  type: 'maintenance_record' | 'maintenance_schedule' | 'failure_report' | 'equipment_assignment' | 'equipment_loan'
  date: string
  title: string
  detail: string | null
  status: string
  priority: string | null
}

export type EquipmentLifeSheet = {
  equipment: Equipment
  assignments: EquipmentAssignment[]
  loans: EquipmentLoan[]
  maintenanceSchedules: MaintenanceSchedule[]
  maintenanceRecords: MaintenanceRecord[]
  failureReports: FailureReport[]
  attachments: EquipmentAttachment[]
  maintenanceRecordAttachments: EquipmentAttachment[]
  auditLogs: AuditLog[]
  technicalHistory: TechnicalHistoryItem[]
  summary: {
    totalAssignments: number
    totalLoans: number
    totalMaintenanceRecords: number
    openFailureReports: number
    totalAttachments: number
  }
}

export type { Headquarter }
