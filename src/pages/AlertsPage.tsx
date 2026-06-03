import { AlertCenter } from '../components/AlertCenter'
import type { Alert, Responsible } from '../types/inventory'
import type { ModuleState } from '../types/ui'

type AlertsPageProps = {
  alerts: Alert[]
  canManage: boolean
  currentUserId: string | null
  isRunning: boolean
  technicians: Responsible[]
  status: ModuleState
  onAcknowledge: (alertId: string) => void
  onAssign: (alertId: string, assignedTo: string) => void
  onResolve: (alertId: string) => void
  onRunChecks: () => void
  onSelfAssign: (alertId: string) => void
}

export function AlertsPage(props: AlertsPageProps) {
  return <AlertCenter {...props} />
}
