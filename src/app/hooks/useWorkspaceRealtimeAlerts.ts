import { useRealtimeAlerts } from '@/shared/hooks/useRealtimeAlerts'
import type { User } from '@/features/users/types'

type WorkspaceRealtimePermissions = {
  canAssignEquipment: boolean
  canManageAlerts: boolean
  canManageFailureReports: boolean
  canViewAlerts: boolean
  canViewFailureReports: boolean
}

type WorkspaceRealtimeRefreshers = {
  refreshAlerts: () => Promise<unknown>
  refreshDashboard: () => Promise<unknown>
  refreshOperationalData: () => Promise<unknown>
}

type WorkspaceNotificationInbox = {
  addNotification: (notification: Parameters<typeof useRealtimeAlerts>[0]['onNotify'] extends (notification: infer Item) => void ? Item : never) => void
}

type UseWorkspaceRealtimeAlertsOptions = {
  authStatus: string
  notificationInbox: WorkspaceNotificationInbox
  permissions: WorkspaceRealtimePermissions
  refreshers: WorkspaceRealtimeRefreshers
  showSuccess: (message: string, subText?: string) => void
  user: User | null
}

export function useWorkspaceRealtimeAlerts({
  authStatus,
  notificationInbox,
  permissions,
  refreshers,
  showSuccess,
  user,
}: UseWorkspaceRealtimeAlertsOptions) {
  useRealtimeAlerts({
    canHandleFailureQueue: permissions.canManageFailureReports,
    canManageAlerts: permissions.canManageAlerts,
    canManageLoanRequests: permissions.canAssignEquipment,
    canTrackReportedTickets: permissions.canViewFailureReports,
    canViewAlerts: permissions.canViewAlerts,
    enabled:
      authStatus === 'authenticated' &&
      (permissions.canViewAlerts ||
        permissions.canViewFailureReports ||
        permissions.canAssignEquipment),
    onDashboardRefresh: refreshers.refreshDashboard,
    onNotify: notificationInbox.addNotification,
    onRefresh: refreshers.refreshAlerts,
    onTicketRefresh: refreshers.refreshOperationalData,
    showSuccess,
    userId: user?.id ?? null,
  })
}
