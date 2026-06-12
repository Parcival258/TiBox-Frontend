import { MyCasesPanel } from '../components/MyCasesPanel'
import type { Alert } from '@/shared/types/inventory'
import type { ModuleState } from '@/shared/types/ui'

type MyCasesPageProps = {
  alerts: Alert[]
  currentUserId: string | null
  status: ModuleState
  onAddNote: (alertId: string, note: string) => void
  onDismiss: (alertId: string) => void
  onResolveCase: (alert: Alert) => void
}

export function MyCasesPage(props: MyCasesPageProps) {
  return <MyCasesPanel {...props} />
}
