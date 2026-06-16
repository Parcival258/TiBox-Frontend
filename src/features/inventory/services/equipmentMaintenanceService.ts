import { postJson } from '@/shared/services/api'
import type { CreateMaintenanceRecordPayload, MaintenanceRecord } from '@/shared/types/inventory'

export function createMaintenanceRecord(payload: CreateMaintenanceRecordPayload) {
  return postJson<MaintenanceRecord>('/api/v1/maintenance/records', payload)
}
