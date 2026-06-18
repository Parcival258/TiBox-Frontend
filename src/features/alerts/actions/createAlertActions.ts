import { runAlertChecks } from '../services/alertService'
import type { ModuleState } from '@/shared/types/ui'

type AlertActionDependencies = {
  refreshAlerts: () => Promise<unknown>
  refreshDashboard: () => Promise<unknown>
  setAlertsStatus: (status: ModuleState) => void
  setIsRunningAlerts: (isRunning: boolean) => void
  showSuccess: (message: string, subText?: string) => void
}

export function createAlertActions({
  refreshAlerts,
  refreshDashboard,
  setAlertsStatus,
  setIsRunningAlerts,
  showSuccess,
}: AlertActionDependencies) {
  function handleRunAlertChecks() {
    setIsRunningAlerts(true)
    runAlertChecks()
      .then(() => {
        refreshAlerts()
        return refreshDashboard()
      })
      .catch(() => setAlertsStatus('error'))
      .finally(() => setIsRunningAlerts(false))
  }

  function handleAlertAction(action: () => Promise<unknown>, message?: string) {
    action()
      .then(() => {
        if (message) {
          showSuccess(message, 'La informacion se actualizo correctamente.')
        }

        return refreshAlerts()
      })
      .catch(() => setAlertsStatus('error'))
  }

  return {
    handleAlertAction,
    handleRunAlertChecks,
  }
}
