import { useState } from 'react'
import type { Alert } from '../types'
import type { ModuleState } from '@/shared/types/ui'

export function useAlertsState() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [alertsStatus, setAlertsStatus] = useState<ModuleState>('loading')
  const [isRunningAlerts, setIsRunningAlerts] = useState(false)

  return {
    alerts,
    alertsStatus,
    isRunningAlerts,
    setAlerts,
    setAlertsStatus,
    setIsRunningAlerts,
  }
}
