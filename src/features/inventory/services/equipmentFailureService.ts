import { patchJson, postJson } from '@/shared/services/api'
import type { CreateFailureReportPayload, FailureReport } from '@/shared/types/inventory'

export function createFailureReport(payload: CreateFailureReportPayload) {
  return postJson<FailureReport>('/api/v1/failure-reports', payload)
}

export function resolveFailureReport(failureReportId: string) {
  return patchJson<FailureReport>(`/api/v1/failure-reports/${failureReportId}/close`, {
    status: 'resolved',
  })
}
