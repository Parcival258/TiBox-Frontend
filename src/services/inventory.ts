import { buildUrl, deleteJson, getJson, patchJson, postForm, postJson } from './api'
import type {
  Alert,
  AlertCatalogs,
  AlertRunResult,
  CreateFailureReportPayload,
  CreateEquipmentLoanPayload,
  CreateMaintenanceSchedulePayload,
  CreateMaintenanceRecordPayload,
  DashboardSummary,
  Equipment,
  EquipmentAttachment,
  EquipmentAssignment,
  EquipmentCatalogs,
  EquipmentFilters,
  EquipmentLifeSheet,
  EquipmentLoan,
  EquipmentPayload,
  EquipmentType,
  EquipmentTypePayload,
  FailureReport,
  Headquarter,
  HeadquarterPayload,
  Location,
  LocationPayload,
  LoanEquipment,
  MaintenanceRecord,
  MaintenanceSchedule,
  MaintenanceScheduleCatalogs,
  PaginatedResponse,
  ReturnEquipmentLoanPayload,
  RequestEquipmentLoanPayload,
} from '../types/inventory'

export function getDashboard() {
  return getJson<DashboardSummary>('/api/v1/dashboard')
}

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

export async function getEquipmentLoans() {
  const response = await getJson<PaginatedResponse<EquipmentLoan>>('/api/v1/equipment-loans?perPage=50')

  return response.data
}

export function createEquipmentLoan(payload: CreateEquipmentLoanPayload) {
  return postJson<EquipmentLoan>('/api/v1/equipment-loans', payload)
}

export function requestEquipmentLoan(payload: RequestEquipmentLoanPayload) {
  return postJson<EquipmentLoan>('/api/v1/equipment-loans/requests', payload)
}

export function getRequestableEquipment() {
  return getJson<LoanEquipment[]>('/api/v1/equipment-loans/requestable-equipment')
}

export function approveEquipmentLoan(loanId: string, equipmentId: string) {
  return patchJson<EquipmentLoan>(`/api/v1/equipment-loans/${loanId}/approve`, { equipmentId })
}

export function rejectEquipmentLoan(loanId: string, reason: string) {
  return patchJson<EquipmentLoan>(`/api/v1/equipment-loans/${loanId}/reject`, { reason })
}

export function returnEquipmentLoan(loanId: string, payload: ReturnEquipmentLoanPayload) {
  return patchJson<EquipmentLoan>(`/api/v1/equipment-loans/${loanId}/return`, payload)
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

export function getHeadquarters() {
  return getJson<Headquarter[]>('/api/v1/headquarters')
}

export function createHeadquarter(payload: HeadquarterPayload) {
  return postJson<Headquarter>('/api/v1/headquarters', payload)
}

export function updateHeadquarter(headquarterId: string, payload: HeadquarterPayload) {
  return patchJson<Headquarter>(`/api/v1/headquarters/${headquarterId}`, payload)
}

export function deactivateHeadquarter(headquarterId: string) {
  return deleteJson(`/api/v1/headquarters/${headquarterId}`)
}

export function getLocations() {
  return getJson<Location[]>('/api/v1/locations')
}

export function createLocation(payload: LocationPayload) {
  return postJson<Location>('/api/v1/locations', payload)
}

export function updateLocation(locationId: string, payload: LocationPayload) {
  return patchJson<Location>(`/api/v1/locations/${locationId}`, payload)
}

export function deactivateLocation(locationId: string) {
  return deleteJson(`/api/v1/locations/${locationId}`)
}

export async function getMaintenanceSchedules() {
  const response = await getJson<PaginatedResponse<MaintenanceSchedule>>(
    '/api/v1/maintenance/schedules?perPage=50'
  )

  return response.data
}

export function getMaintenanceScheduleCatalogs() {
  return getJson<MaintenanceScheduleCatalogs>('/api/v1/maintenance/schedules/catalogs')
}

export function createMaintenanceSchedule(payload: CreateMaintenanceSchedulePayload) {
  return postJson<MaintenanceSchedule>('/api/v1/maintenance/schedules', payload)
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
  return patchJson<MaintenanceSchedule>(`/api/v1/maintenance/schedules/${scheduleId}/reschedule`, {
    scheduledFor,
  })
}

export async function getAlerts() {
  const response = await getJson<PaginatedResponse<Alert>>('/api/v1/alerts?perPage=50')

  return response.data
}

export function getAlertCatalogs() {
  return getJson<AlertCatalogs>('/api/v1/alerts/catalogs')
}

export function runAlertChecks() {
  return postJson<AlertRunResult>('/api/v1/alerts/run')
}

export function acknowledgeAlert(alertId: string) {
  return patchJson<Alert>(`/api/v1/alerts/${alertId}/acknowledge`)
}

export function assignAlert(alertId: string, assignedTo: string) {
  return patchJson<Alert>(`/api/v1/alerts/${alertId}/assign`, { assignedTo })
}

export function addAlertNote(alertId: string, note: string) {
  return patchJson<Alert>(`/api/v1/alerts/${alertId}/note`, { note })
}

export function selfAssignAlert(alertId: string) {
  return patchJson<Alert>(`/api/v1/alerts/${alertId}/self-assign`)
}

export function resolveAlert(alertId: string) {
  return patchJson<Alert>(`/api/v1/alerts/${alertId}/resolve`)
}

export function dismissAlert(alertId: string) {
  return patchJson<Alert>(`/api/v1/alerts/${alertId}/dismiss`)
}
