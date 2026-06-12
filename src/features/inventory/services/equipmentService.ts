import { buildUrl, deleteJson, getJson, patchJson, postForm, postJson } from '@/shared/services/api'
import type {
  CreateFailureReportPayload,
  CreateMaintenanceRecordPayload,
  Equipment,
  EquipmentAssignment,
  EquipmentAttachment,
  EquipmentCatalogs,
  EquipmentFilters,
  EquipmentLifeSheet,
  EquipmentPayload,
  EquipmentType,
  EquipmentTypePayload,
  FailureReport,
  MaintenanceRecord,
  PaginatedResponse,
} from '@/shared/types/inventory'

function toQueryString(filters: EquipmentFilters) {
  const params = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.set(key, String(value))
    }
  })

  const query = params.toString()
  return query ? `?${query}` : ''
}

export function getEquipment(filters: EquipmentFilters = {}) {
  return getJson<PaginatedResponse<Equipment>>(`/api/v1/equipment${toQueryString(filters)}`)
}

export function getEquipmentLifeSheet(equipmentId: string) {
  return getJson<EquipmentLifeSheet>(`/api/v1/equipment/${equipmentId}/life-sheet`)
}

export function getEquipmentCatalogs() {
  return getJson<EquipmentCatalogs>('/api/v1/equipment/catalogs')
}

export function getEquipmentTypes() {
  return getJson<EquipmentType[]>('/api/v1/equipment-types')
}

export function createEquipmentType(payload: EquipmentTypePayload) {
  return postJson<EquipmentType>('/api/v1/equipment-types', payload)
}

export function updateEquipmentType(equipmentTypeId: string, payload: EquipmentTypePayload) {
  return patchJson<EquipmentType>(`/api/v1/equipment-types/${equipmentTypeId}`, payload)
}

export function deactivateEquipmentType(equipmentTypeId: string) {
  return deleteJson(`/api/v1/equipment-types/${equipmentTypeId}`)
}

export function createEquipment(payload: EquipmentPayload) {
  return postJson<Equipment>('/api/v1/equipment', payload)
}

export function updateEquipment(equipmentId: string, payload: Partial<EquipmentPayload>) {
  return patchJson<Equipment>(`/api/v1/equipment/${equipmentId}`, payload)
}

export function deleteEquipment(equipmentId: string) {
  return deleteJson(`/api/v1/equipment/${equipmentId}`)
}

export function assignEquipment(equipmentId: string, userId: string, notes?: string) {
  return postJson<EquipmentAssignment>(`/api/v1/equipment/${equipmentId}/assignments`, {
    userId,
    notes,
  })
}

export function returnEquipment(equipmentId: string, notes?: string) {
  return patchJson<EquipmentAssignment>(`/api/v1/equipment/${equipmentId}/assignments/current/return`, {
    notes,
  })
}

export function createFailureReport(payload: CreateFailureReportPayload) {
  return postJson<FailureReport>('/api/v1/failure-reports', payload)
}

export function resolveFailureReport(failureReportId: string) {
  return patchJson<FailureReport>(`/api/v1/failure-reports/${failureReportId}/close`, {
    status: 'resolved',
  })
}

export function createMaintenanceRecord(payload: CreateMaintenanceRecordPayload) {
  return postJson<MaintenanceRecord>('/api/v1/maintenance/records', payload)
}

export function uploadEquipmentAttachment(equipmentId: string, file: File) {
  const body = new FormData()
  body.append('file', file)
  return postForm<EquipmentAttachment>(`/api/v1/equipment/${equipmentId}/attachments`, body)
}

export function deleteEquipmentAttachment(equipmentId: string, attachmentId: string) {
  return deleteJson(`/api/v1/equipment/${equipmentId}/attachments/${attachmentId}`)
}

export function equipmentAttachmentDownloadUrl(equipmentId: string, attachmentId: string) {
  return buildUrl(`/api/v1/equipment/${equipmentId}/attachments/${attachmentId}`)
}
