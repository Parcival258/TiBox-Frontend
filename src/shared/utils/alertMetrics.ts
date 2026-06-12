import type { Alert } from '@/shared/types/inventory'

export function alertMetrics({
  alerts,
  canManageAlerts,
  userId,
}: {
  alerts: Alert[]
  canManageAlerts: boolean
  userId: string | null
}) {
  const visibleAlerts = alerts.filter((alert) => alert.status !== 'dismissed')
  const unresolvedAlerts = visibleAlerts.filter((alert) => alert.status !== 'resolved')
  const alertAttentionCount = unresolvedAlerts.filter((alert) => {
    if (canManageAlerts) {
      return true
    }

    return !alert.assignedTo
  }).length

  return {
    alertAttentionCount,
    myAlertCount: unresolvedAlerts.filter((alert) => alert.assignedTo === userId).length,
    myCaseCount: visibleAlerts.filter((alert) => alert.assignedTo === userId).length,
    unassignedFailureCount: unresolvedAlerts.filter(
      (alert) => alert.type === 'damaged_equipment_reported' && !alert.assignedTo
    ).length,
  }
}
