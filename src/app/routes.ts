import type { ActiveView } from '@/shared/types/ui'

export const VIEW_PATHS: Record<ActiveView, string> = {
  inventory: '/inventario',
  loans: '/prestamos',
  maintenance: '/mantenimiento',
  headquarters: '/sedes-y-tipos',
  settings: '/configuracion',
  systemLogs: '/logs-del-sistema',
  users: '/usuarios',
  cases: '/mis-casos',
  alerts: '/alertas',
  chat: '/chat',
}

export function viewFromPath(pathname: string): ActiveView | null {
  const normalizedPath = pathname !== '/' ? pathname.replace(/\/$/, '') : pathname
  const entry = Object.entries(VIEW_PATHS).find(([, path]) => path === normalizedPath)
  return (entry?.[0] as ActiveView | undefined) ?? null
}
