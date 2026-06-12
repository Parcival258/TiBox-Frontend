import { useState } from 'react'
import type { ActiveView } from '@/shared/types/ui'

export function useWorkspaceNavigation() {
  const [activeView, setActiveView] = useState<ActiveView>('inventory')
  return { activeView, setActiveView }
}
