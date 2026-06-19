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
    <header className="flex flex-row items-center justify-between gap-3 border-b border-slate-800 pb-4 sm:gap-4 sm:pb-5">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-cyan-300">
          TIBOX
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-white sm:mt-2 sm:text-3xl">INICIO</h1>
      </div>
      <div className="flex min-w-0 flex-col items-end gap-2">
        <div className="rounded-md border border-slate-800 bg-slate-900 px-2 py-2 text-xs text-slate-300 sm:px-4 sm:text-sm">
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
