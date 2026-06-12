import { getJson, patchJson, postJson } from '@/shared/services/api'
import type { Alert, AlertCatalogs, AlertRunResult, PaginatedResponse } from '@/shared/types/inventory'

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
