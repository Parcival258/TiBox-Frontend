import { useState } from 'react'
import type { NotificationItem } from '../hooks/useNotificationInbox'
import { formatDateTime } from '@/shared/utils/dateFormat'

type NotificationBellProps = {
  notifications: NotificationItem[]
  unreadCount: number
  onClear: () => void
  onMarkAllRead: () => void
}

export function NotificationBell({
  notifications,
  onClear,
  onMarkAllRead,
  unreadCount,
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false)

  function toggleOpen() {
    const nextIsOpen = !isOpen
    setIsOpen(nextIsOpen)

    if (nextIsOpen && unreadCount > 0) {
      onMarkAllRead()
    }
  }

  return (
    <div className="relative">
      <button
        aria-label="Notificaciones"
        className="relative grid h-9 w-9 place-items-center rounded-md border border-slate-700 text-slate-300 transition hover:border-cyan-500 hover:text-white"
        title="Notificaciones"
        type="button"
        onClick={toggleOpen}
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 min-w-5 rounded-full border border-amber-300 bg-amber-400 px-1 text-center text-[11px] font-bold leading-5 text-slate-950">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <section className="absolute right-0 z-30 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-lg border border-slate-700 bg-slate-950 shadow-2xl">
          <div className="flex items-center justify-between gap-3 border-b border-slate-800 px-3 py-3">
            <h2 className="text-sm font-semibold text-white">Notificaciones</h2>
            {notifications.length > 0 && (
              <button
                className="text-xs font-medium text-slate-400 transition hover:text-white"
                type="button"
                onClick={onClear}
              >
                Limpiar
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-slate-500">
              No hay notificaciones recientes.
            </p>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {notifications.map((notification) => (
                <article
                  className="border-b border-slate-800 px-3 py-3 last:border-b-0"
                  key={notification.id}
                >
                  <div className="flex items-start gap-2">
                    {!notification.readAt && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-cyan-400" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-100">{notification.title}</p>
                      {notification.subText && (
                        <p className="mt-1 text-sm leading-5 text-slate-400">
                          {notification.subText}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-slate-500">
                        {formatDateTime(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}

function BellIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="M15 17H9" />
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </svg>
  )
}
