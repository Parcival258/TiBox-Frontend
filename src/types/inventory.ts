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
  status: string
  priority: string
  scheduledFor: string
  assignedTechnician: Person
  frequencyMonths: number | null
  notes: string | null
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

export type EquipmentLifeSheet = {
  equipment: Equipment
  assignments: EquipmentAssignment[]
  maintenanceSchedules: MaintenanceSchedule[]
  maintenanceRecords: MaintenanceRecord[]
  failureReports: FailureReport[]
  attachments: EquipmentAttachment[]
  auditLogs: AuditLog[]
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

export type PaginatedResponse<T> = {
  meta: {
    total: number
    perPage: number
    currentPage: number
    lastPage: number
  }
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
