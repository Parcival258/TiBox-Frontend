import { buildUrl, deleteJson, getJson, patchJson, postForm, postJson } from '@/shared/services/api'
import type {
  CreateMaintenanceSchedulePayload,
  CreateMaintenanceRecordPayload,
  EquipmentGroup,
  EquipmentGroupPayload,
  MaintenanceAttachment,
  MaintenanceFilters,
  MaintenanceHistoryItem,
  MaintenanceRecord,
  MaintenanceStage,
  MaintenanceSchedule,
  MaintenanceScheduleCatalogs,
} from '../types'
import type { PaginatedResponse } from '@/shared/types/pagination'

export async function getMaintenanceSchedules() {
  const response = await getJson<PaginatedResponse<MaintenanceSchedule>>('/api/v1/maintenance/schedules?perPage=50')
  return response.data
}

function filtersToQuery(filters: MaintenanceFilters = {}) {
  const params = new URLSearchParams({ perPage: '100' })

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.set(key, value)
    }
  })

  return params.toString()
}

export async function getMaintenanceRecords(filters?: MaintenanceFilters) {
  const response = await getJson<PaginatedResponse<MaintenanceRecord>>(
    `/api/v1/maintenance/records?${filtersToQuery(filters)}`
  )
  return response.data
}

export function getMaintenanceScheduleCatalogs() {
  return getJson<MaintenanceScheduleCatalogs>('/api/v1/maintenance/schedules/catalogs')
}

export function createMaintenanceSchedule(payload: CreateMaintenanceSchedulePayload) {
  return postJson<MaintenanceSchedule>('/api/v1/maintenance/schedules', payload)
}

export function createMaintenanceRecord(payload: CreateMaintenanceRecordPayload) {
  return postJson<MaintenanceRecord>('/api/v1/maintenance/records', payload)
}

export function markMaintenancePending(scheduleId: string) {
  return patchJson<MaintenanceSchedule>(`/api/v1/maintenance/schedules/${scheduleId}/pending`)
}

export function startMaintenanceSchedule(scheduleId: string) {
  return patchJson<MaintenanceSchedule>(`/api/v1/maintenance/schedules/${scheduleId}/start`)
}

export function finishMaintenanceSchedule(scheduleId: string) {
  return patchJson<MaintenanceSchedule>(`/api/v1/maintenance/schedules/${scheduleId}/finish`)
}

export function cancelMaintenanceSchedule(scheduleId: string) {
  return patchJson<MaintenanceSchedule>(`/api/v1/maintenance/schedules/${scheduleId}/cancel`)
}

export function rescheduleMaintenanceSchedule(scheduleId: string, scheduledFor: string) {
  return patchJson<MaintenanceSchedule>(`/api/v1/maintenance/schedules/${scheduleId}/reschedule`, { scheduledFor })
}

export function updateMaintenanceReception(recordId: string, payload: unknown) {
  return patchJson<MaintenanceRecord>(`/api/v1/maintenance/records/${recordId}/reception`, payload)
}

export function updateMaintenanceExecution(recordId: string, payload: unknown) {
  return patchJson<MaintenanceRecord>(`/api/v1/maintenance/records/${recordId}/execution`, payload)
}

export function updateMaintenanceClosure(recordId: string, payload: unknown) {
  return patchJson<MaintenanceRecord>(`/api/v1/maintenance/records/${recordId}/closure`, payload)
}

export function getMaintenanceAttachments(recordId: string) {
  return getJson<MaintenanceAttachment[]>(`/api/v1/maintenance/records/${recordId}/attachments`)
}

export function uploadMaintenanceAttachment(recordId: string, stage: MaintenanceStage, file: File) {
  const body = new FormData()
  body.append('file', file)
  body.append('stage', stage)

  return postForm<MaintenanceAttachment>(`/api/v1/maintenance/records/${recordId}/attachments`, body)
}

export function deleteMaintenanceAttachment(recordId: string, attachmentId: string) {
  return deleteJson(`/api/v1/maintenance/records/${recordId}/attachments/${attachmentId}`)
}

export function maintenanceAttachmentUrl(recordId: string, attachmentId: string) {
  return buildUrl(`/api/v1/maintenance/records/${recordId}/attachments/${attachmentId}`)
}

export function getMaintenanceHistory(recordId: string) {
  return getJson<MaintenanceHistoryItem[]>(`/api/v1/maintenance/records/${recordId}/history`)
}

export function getEquipmentGroups() {
  return getJson<EquipmentGroup[]>('/api/v1/equipment-groups')
}

export function createEquipmentGroup(payload: EquipmentGroupPayload) {
  return postJson<EquipmentGroup>('/api/v1/equipment-groups', payload)
}

export function updateEquipmentGroup(groupId: string, payload: EquipmentGroupPayload) {
  return patchJson<EquipmentGroup>(`/api/v1/equipment-groups/${groupId}`, payload)
}

export function deleteEquipmentGroup(groupId: string) {
  return deleteJson(`/api/v1/equipment-groups/${groupId}`)
}
