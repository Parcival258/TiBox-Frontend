import { deleteJson, getJson, patchJson } from '@/shared/services/api'

export type SystemErrorLogEntry = {
  id: string
  level: 'error'
  method?: string
  message: string
  name?: string
  path?: string
  stack?: string
  status?: number
  timestamp: string
  userId?: string | null
}

export type SystemErrorLogsResponse = {
  entries: SystemErrorLogEntry[]
  file: {
    exists: boolean
    path: string
    size: number
    updatedAt: string | null
  }
  settings: {
    enabled: boolean
  }
}

type SerializedSystemErrorLogsResponse = {
  data: SystemErrorLogsResponse
}

function unwrapSystemLogs(response: SystemErrorLogsResponse | SerializedSystemErrorLogsResponse) {
  return 'data' in response ? response.data : response
}

export function getSystemErrorLogs(limit = 100) {
  return getJson<SystemErrorLogsResponse | SerializedSystemErrorLogsResponse>(`/api/v1/system-logs/errors?limit=${limit}`)
    .then(unwrapSystemLogs)
}

export function clearSystemErrorLogs() {
  return deleteJson('/api/v1/system-logs/errors')
}

export function updateSystemErrorLogSettings(enabled: boolean) {
  return patchJson<{ data: { enabled: boolean } } | { enabled: boolean }>('/api/v1/system-logs/settings', {
    enabled,
  }).then((response) => ('data' in response ? response.data : response))
}
