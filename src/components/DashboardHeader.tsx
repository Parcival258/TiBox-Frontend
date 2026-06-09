import { NotificationBell } from './NotificationBell'
import type { NotificationItem } from '../hooks/useNotificationInbox'

type DashboardHeaderProps = {
  notifications: NotificationItem[]
  status: 'loading' | 'ready' | 'error'
  theme: 'dark' | 'light'
  unreadNotifications: number
  userName: string
  onClearNotifications: () => void
  onLogout: () => void
  onMarkNotificationsRead: () => void
  onToggleTheme: () => void
}

const statusLabel = {
  loading: 'Cargando datos',
  ready: 'Backend conectado',
  error: 'No se pudo conectar al backend',
}

export function DashboardHeader({
  notifications,
  onClearNotifications,
  status,
  theme,
  unreadNotifications,
  userName,
  onLogout,
  onMarkNotificationsRead,
  onToggleTheme,
}: DashboardHeaderProps) {
  return (
    <header className="flex flex-col gap-4 border-b border-slate-800 pb-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-cyan-300">
          Inventario TI
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Dashboard</h1>
      </div>
      <div className="flex flex-col gap-2 sm:items-end">
        <div className="rounded-md border border-slate-800 bg-slate-900 px-4 py-2 text-sm text-slate-300">
          {statusLabel[status]}
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2 text-sm text-slate-400">
          <span>{userName}</span>
          <NotificationBell
            notifications={notifications}
            unreadCount={unreadNotifications}
            onClear={onClearNotifications}
            onMarkAllRead={onMarkNotificationsRead}
          />
          <label className="theme-toggle-switch" title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}>
            <span className="sr-only">{theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}</span>
            <input
              aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
              checked={theme === 'light'}
              className="theme-toggle-checkbox"
              type="checkbox"
              onChange={onToggleTheme}
            />
            <span className="theme-toggle-slider" aria-hidden="true" />
          </label>
          <button
            className="rounded-md border border-slate-700 px-3 py-1 text-slate-300 transition hover:border-slate-500 hover:text-white"
            type="button"
            onClick={onLogout}
          >
            Salir
          </button>
        </div>
      </div>
    </header>
  )
}
