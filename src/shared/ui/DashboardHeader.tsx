import { NotificationBell } from './NotificationBell'
import type { NotificationItem } from '../hooks/useNotificationInbox'

type DashboardHeaderProps = {
  notifications: NotificationItem[]
  notificationsEnabled: boolean
  status: 'loading' | 'ready' | 'error'
  unreadNotifications: number
  onClearNotifications: () => void
  onMarkNotificationsRead: () => void
}

const statusLabel = {
  loading: 'Cargando datos',
  ready: 'Conectado',
  error: 'No se pudo conectar',
}

export function DashboardHeader({
  notifications,
  notificationsEnabled,
  onClearNotifications,
  status,
  unreadNotifications,
  onMarkNotificationsRead,
}: DashboardHeaderProps) {
  return (
    <header className="flex flex-col gap-4 border-b border-slate-800 pb-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-cyan-300">
          TIBOX
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-white">INICIO</h1>
      </div>
      <div className="flex flex-col gap-2 sm:items-end">
        <div className="rounded-md border border-slate-800 bg-slate-900 px-4 py-2 text-sm text-slate-300">
          {statusLabel[status]}
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2 text-sm text-slate-400">
          {notificationsEnabled && (
            <NotificationBell
              notifications={notifications}
              unreadCount={unreadNotifications}
              onClear={onClearNotifications}
              onMarkAllRead={onMarkNotificationsRead}
            />
          )}
        </div>
      </div>
    </header>
  )
}
