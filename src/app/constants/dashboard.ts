import type { DashboardSummary } from '@/app/types/dashboard'

export const emptyDashboard: DashboardSummary = {
  equipment: {
    total: 0,
    active: 0,
    inMaintenance: 0,
    damaged: 0,
  },
  maintenance: {
    upcoming: 0,
    overdue: 0,
  },
  expirations: {
    leases: 0,
    warranties: 0,
  },
}
