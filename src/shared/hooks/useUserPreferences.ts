import { useEffect, useState } from 'react'
import type { UserPreferences } from '@/shared/types/ui'

const defaultPreferences: UserPreferences = {
  dashboardStatsSize: 'medium',
  density: 'comfortable',
  equipmentPerPage: 10,
  notificationsEnabled: true,
  notificationSoundEnabled: false,
  reduceMotion: false,
  showDashboardStats: true,
  theme: 'dark',
}

function storageKey(userId: string | null) {
  return `inventory.preferences.${userId ?? 'guest'}`
}

function readPreferences(userId: string | null): UserPreferences {
  try {
    const stored = window.localStorage.getItem(storageKey(userId))
    const legacyTheme = window.localStorage.getItem('inventory-theme')
    const parsed = stored ? JSON.parse(stored) : {}

    const storedTheme = parsed.theme === 'light' || parsed.theme === 'dark' ? parsed.theme : null

    return {
      ...defaultPreferences,
      ...parsed,
      theme: storedTheme ?? (legacyTheme === 'light' ? 'light' : 'dark'),
    }
  } catch {
    return defaultPreferences
  }
}

export function useUserPreferences(userId: string | null) {
  const [storedPreferences, setStoredPreferences] = useState(() => ({
    ownerId: userId,
    value: readPreferences(userId),
  }))
  const preferences =
    storedPreferences.ownerId === userId ? storedPreferences.value : readPreferences(userId)

  useEffect(() => {
    if (storedPreferences.ownerId !== userId) {
      return
    }

    document.documentElement.dataset.theme = preferences.theme
    document.documentElement.dataset.density = preferences.density
    document.documentElement.dataset.motion = preferences.reduceMotion ? 'reduced' : 'full'
    window.localStorage.setItem(storageKey(userId), JSON.stringify(preferences))
  }, [preferences, storedPreferences.ownerId, userId])

  function updatePreferences(nextPreferences: Partial<UserPreferences>) {
    setStoredPreferences((current) => ({
      ownerId: userId,
      value: {
        ...(current.ownerId === userId ? current.value : readPreferences(userId)),
        ...nextPreferences,
      },
    }))
  }

  return { preferences, updatePreferences }
}
