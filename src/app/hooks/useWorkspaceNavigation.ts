import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router'
import type { ActiveView } from '@/shared/types/ui'
import { VIEW_PATHS, viewFromPath } from '../routes'

export function useWorkspaceNavigation() {
  const location = useLocation()
  const navigate = useNavigate()
  const activeView = viewFromPath(location.pathname) ?? 'inventory'
  const setActiveView = useCallback(
    (view: ActiveView) => navigate(VIEW_PATHS[view]),
    [navigate],
  )

  return { activeView, setActiveView }
}
