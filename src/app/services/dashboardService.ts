import { getJson } from '@/shared/services/api'
import type { DashboardSummary } from '@/app/types/dashboard'

export function getDashboard() {
  return getJson<DashboardSummary>('/api/v1/dashboard')
}
