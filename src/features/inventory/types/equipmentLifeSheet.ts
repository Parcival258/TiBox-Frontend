import type { EquipmentLoan } from '@/features/loans/types'
import type { MaintenanceRecord, MaintenanceSchedule } from '@/features/maintenance/types'
import type { EquipmentAssignment } from './equipmentAssignments'
import type { EquipmentAttachment } from './equipmentAttachments'
import type { AuditLog } from './equipmentAudit'
import type { Equipment } from './equipmentCore'
import type { FailureReport } from './equipmentFailures'
import type { TechnicalHistoryItem } from './equipmentHistory'

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
