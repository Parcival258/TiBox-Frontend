import { getJson, patchJson, postJson } from '@/shared/services/api'
import type {
  CreateMaintenanceSchedulePayload,
  MaintenanceSchedule,
  MaintenanceScheduleCatalogs,
  PaginatedResponse,
} from '@/shared/types/inventory'

export async function getMaintenanceSchedules() {
  const response = await getJson<PaginatedResponse<MaintenanceSchedule>>('/api/v1/maintenance/schedules?perPage=50')
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
  return patchJson<MaintenanceSchedule>(`/api/v1/maintenance/schedules/${scheduleId}/reschedule`, { scheduledFor })
}
