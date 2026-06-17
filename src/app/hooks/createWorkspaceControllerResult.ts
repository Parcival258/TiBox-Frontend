import type { NotificationItem } from '@/shared/hooks/useNotificationInbox'

type ControllerNotificationInput = {
  clearNotifications: () => void
  markAllAsRead: () => void
  notifications: NotificationItem[]
  unreadCount: number
}

export function createWorkspaceControllerNotifications({
  clearNotifications,
  markAllAsRead,
  notifications,
  unreadCount,
}: ControllerNotificationInput) {
  return {
    clear: clearNotifications,
    items: notifications,
    markAllAsRead,
    unreadCount,
  }
}
