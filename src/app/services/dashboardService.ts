import { getJson } from '@/shared/services/api'
import type { DashboardSummary } from '@/shared/types/inventory'

export function getDashboard() {
  return getJson<DashboardSummary>('/api/v1/dashboard')
}
