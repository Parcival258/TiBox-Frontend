import { useEffect, useMemo, useState } from 'react'

export type NotificationItem = {
  createdAt: string
  id: string
  readAt: string | null
  subText?: string
  title: string
  type: 'alert' | 'ticket' | 'system'
}

const maxNotifications = 30

function storageKey(userId: string | null) {
  return `inventario.notifications.${userId ?? 'guest'}`
}

function readStoredNotifications(userId: string | null): NotificationItem[] {
  try {
    const rawValue = window.localStorage.getItem(storageKey(userId))
    if (!rawValue) {
      return []
    }

    const parsed = JSON.parse(rawValue)

    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function useNotificationInbox(
  userId: string | null,
  enabled = true,
  soundEnabled = false
) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])

  useEffect(() => {
    setNotifications(readStoredNotifications(userId))
  }, [userId])

  useEffect(() => {
    window.localStorage.setItem(storageKey(userId), JSON.stringify(notifications))
  }, [notifications, userId])

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.readAt).length,
    [notifications]
  )

  function addNotification(notification: Omit<NotificationItem, 'createdAt' | 'id' | 'readAt'>) {
    if (!enabled) {
      return
    }

    if (soundEnabled) {
      playNotificationSound()
    }

    setNotifications((current) => {
      const createdAt = new Date().toISOString()
      const nextNotification: NotificationItem = {
        ...notification,
        createdAt,
        id: `${createdAt}-${Math.random().toString(36).slice(2, 8)}`,
        readAt: null,
      }

      return [nextNotification, ...current].slice(0, maxNotifications)
    })
  }

  function clearNotifications() {
    setNotifications([])
  }

  function markAllAsRead() {
    const readAt = new Date().toISOString()
    setNotifications((current) =>
      current.map((notification) =>
        notification.readAt ? notification : { ...notification, readAt }
      )
    )
  }

  return {
    addNotification,
    clearNotifications,
    markAllAsRead,
    notifications,
    unreadCount,
  }
}

function playNotificationSound() {
  const AudioContextClass = window.AudioContext

  if (!AudioContextClass) {
    return
  }

  const context = new AudioContextClass()
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.frequency.value = 720
  gain.gain.setValueAtTime(0.05, context.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.16)
  oscillator.connect(gain)
  gain.connect(context.destination)
  oscillator.start()
  oscillator.stop(context.currentTime + 0.16)
  oscillator.addEventListener('ended', () => context.close())
}
