export type DashboardSummary = {
  equipment: {
    total: number
    active: number
    inMaintenance: number
    damaged: number
  }
  maintenance: {
    upcoming: number
    overdue: number
  }
  expirations: {
    leases: number
    warranties: number
  }
}
