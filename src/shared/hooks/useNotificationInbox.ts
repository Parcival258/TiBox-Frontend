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
  const [storedNotifications, setStoredNotifications] = useState(() => ({
    ownerId: userId,
    value: readStoredNotifications(userId),
  }))
  const notifications =
    storedNotifications.ownerId === userId
      ? storedNotifications.value
      : readStoredNotifications(userId)

  useEffect(() => {
    if (storedNotifications.ownerId !== userId) {
      return
    }

    window.localStorage.setItem(storageKey(userId), JSON.stringify(notifications))
  }, [notifications, storedNotifications.ownerId, userId])

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

    updateNotifications((current) => {
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
    updateNotifications(() => [])
  }

  function markAllAsRead() {
    const readAt = new Date().toISOString()
    updateNotifications((current) =>
      current.map((notification) =>
        notification.readAt ? notification : { ...notification, readAt }
      )
    )
  }

  function updateNotifications(update: (current: NotificationItem[]) => NotificationItem[]) {
    setStoredNotifications((current) => ({
      ownerId: userId,
      value: update(
        current.ownerId === userId ? current.value : readStoredNotifications(userId)
      ),
    }))
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
