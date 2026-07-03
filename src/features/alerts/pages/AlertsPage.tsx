import { AlertCenter } from '../components/AlertCenter'
import type { Alert } from '../types'
import type { Responsible } from '@/shared/types/person'
import type { ModuleState } from '@/shared/types/ui'

type AlertsPageProps = {
  alerts: Alert[]
  canManage: boolean
  currentUserId: string | null
  isRunning: boolean
  technicians: Responsible[]
  status: ModuleState
  onAcknowledge: (alertId: string) => void
  onAssign: (alertId: string, assignedTo: string) => void
  onDismiss: (alertId: string) => void
  onOpenTarget: (alert: Alert) => void
  onResolve: (alertId: string) => void
  onRunChecks: () => void
  onSelfAssign: (alertId: string) => void
}

export function AlertsPage(props: AlertsPageProps) {
  return <AlertCenter {...props} />
}
