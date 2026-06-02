export type DashboardSummary = {
  equipment: {
    total: number
    active: number
    inMaintenance: number
    damaged: number
  }
  maintenance: {
    upcoming: number
    overdue: number
  }
  expirations: {
    leases: number
    warranties: number
  }
}

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
  headquarter: {
    name: string
  } | null
  location: {
    area: string | null
    office: string | null
  } | null
  currentResponsible: {
    name: string
  } | null
  secondaryResponsible: {
    name: string
  } | null
  purchaseDate?: string | null
  warrantyUntil?: string | null
  leaseProvider?: string | null
  leaseContractNumber?: string | null
  leaseUntil?: string | null
  lastMaintenanceAt?: string | null
  nextMaintenanceAt?: string | null
  notes?: string | null
}

type Person = {
  id: string
  name: string
  email?: string
  jobTitle?: string | null
  department?: string | null
} | null

export type Responsible = NonNullable<Person>

export type EquipmentCatalogs = {
  statuses: readonly string[]
  ownershipTypes: readonly string[]
  types: string[]
  brands: string[]
  headquarters: Array<{
    id: string
    name: string
    city: string | null
  }>
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
  maintenanceType: 'preventive' | 'corrective'
  status?: string
  priority?: string
  performedAt?: string
  performedBy?: string
  description?: string
  diagnosis?: string
  actionsTaken?: string
  partsReplaced?: string
  cost?: number
  nextMaintenanceAt?: string
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

export type CatalogItem = {
  label: string
  value: string
}

export type MaintenanceScheduleCatalogs = {
  maintenanceTypes: CatalogItem[]
  priorities: CatalogItem[]
  statuses: CatalogItem[]
}

export type Alert = {
  id: string
  type: string
  severity: string
  severityLabel: string
  status: string
  statusLabel: string
  title: string
  message: string
  entityType: string
  entityId: string
  equipmentId: string | null
  assignedTo: string | null
  channels: string[]
  triggeredAt: string
  dueAt: string | null
  acknowledgedAt: string | null
  resolvedAt: string | null
  equipment?: {
    internalCode: string
    type: string
    brand: string | null
    model: string | null
  } | null
  assignee?: {
    name: string
    email?: string
  } | null
}

export type AlertCatalogs = {
  channels: CatalogItem[]
  severities: CatalogItem[]
  statuses: CatalogItem[]
  types: CatalogItem[]
}

export type AlertRunResult = {
  generated: number
  alerts: Alert[]
  deliveries: Array<{
    alertId: string
    channels: string[]
    emailReady: boolean
    internalReady: boolean
  }>
}

export type TechnicalHistoryItem = {
  id: string
  sourceId: string
  type:
    | 'maintenance_record'
    | 'maintenance_schedule'
    | 'failure_report'
    | 'equipment_assignment'
  date: string
  title: string
  detail: string | null
  status: string
  priority: string | null
}

export type EquipmentLifeSheet = {
  equipment: Equipment
  assignments: EquipmentAssignment[]
  maintenanceSchedules: MaintenanceSchedule[]
  maintenanceRecords: MaintenanceRecord[]
  failureReports: FailureReport[]
  attachments: EquipmentAttachment[]
  maintenanceRecordAttachments: EquipmentAttachment[]
  auditLogs: AuditLog[]
  technicalHistory: TechnicalHistoryItem[]
  summary: {
    totalAssignments: number
    totalMaintenanceRecords: number
    openFailureReports: number
    totalAttachments: number
  }
}

export type Headquarter = {
  id: string
  name: string
  city: string | null
  address: string | null
  isActive: boolean
}

export type PaginationMeta = {
  total: number
  perPage: number
  currentPage: number
  lastPage: number
}

export type PaginatedResponse<T> = {
  meta: PaginationMeta
  data: T[]
}

export type User = {
  id: string
  name: string
  email: string
  role: {
    id: string
    name: string
    slug: string
  } | null
  permissions: string[]
}
