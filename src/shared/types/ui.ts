export type ActiveView =
  | 'inventory'
  | 'loans'
  | 'maintenance'
  | 'headquarters'
  | 'settings'
  | 'users'
  | 'cases'
  | 'alerts'

export type AuthState = 'checking' | 'authenticated' | 'guest' | 'submitting'
export type LifeSheetState = 'idle' | 'loading' | 'ready' | 'error'
export type LoadState = 'loading' | 'ready' | 'error'
export type ModuleState = 'loading' | 'ready' | 'error'
export type ThemeMode = 'dark' | 'light'
export type InterfaceDensity = 'compact' | 'comfortable' | 'spacious'

export type UserPreferences = {
  density: InterfaceDensity
  equipmentPerPage: 10 | 25 | 50 | 100
  notificationsEnabled: boolean
  notificationSoundEnabled: boolean
  reduceMotion: boolean
  theme: ThemeMode
}
