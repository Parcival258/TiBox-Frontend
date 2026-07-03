import { AppNavigation } from './components/AppNavigation'
import { DashboardHeader, MetricGrid, SuccessNotice } from '@/shared/ui'
import { useWorkspaceController } from './hooks/useWorkspaceController'
import { useSuccessNotice } from '@/shared/hooks/useSuccessNotice'
import { useUserPreferences } from '@/shared/hooks/useUserPreferences'
import type { User } from '@/features/users/types'
import type { AuthState } from '@/shared/types/ui'
import { AppOverlays } from './AppOverlays'
import { AppView } from './AppView'
import { useConfirmAction } from './hooks/useConfirmAction'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { VIEW_PATHS, viewFromPath } from './routes'
import './App.css'

type AuthenticatedAppProps = {
  authStatus: AuthState
  onLogout: () => Promise<unknown>
  user: User | null
}

export function AuthenticatedApp({ authStatus, onLogout, user }: AuthenticatedAppProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const confirmation = useConfirmAction()
  const { clearSuccess, showSuccess, successNotice } = useSuccessNotice()
  const { preferences, updatePreferences } = useUserPreferences(user?.id ?? null)
  const workspace = useWorkspaceController({
    authStatus,
    equipmentPageSize: preferences.equipmentPerPage,
    notificationsEnabled: preferences.notificationsEnabled,
    notificationSoundEnabled: preferences.notificationSoundEnabled,
    showSuccess,
    user,
  })
  const { actions, metrics, notifications, permissions, state } = workspace

  function handleLogout() {
    return onLogout().finally(() => {
      actions.resetWorkspace()
      navigate('/', { replace: true })
    })
  }

  function handleOpenNotification(notification: typeof notifications.items[number]) {
    if (notification.action?.type === 'chat' && notification.action.conversationId) {
      actions.setActiveView('chat')
      void workspace.chat.openConversation(notification.action.conversationId)
    }
  }

  const requestedView = viewFromPath(location.pathname)
  const canOpenRequestedView =
    requestedView !== null &&
    (requestedView !== 'loans' || permissions.canViewEquipmentLoans) &&
    (requestedView !== 'maintenance' || permissions.canViewMaintenance) &&
    (requestedView !== 'headquarters' || permissions.canViewSettings) &&
    (requestedView !== 'users' || permissions.canManageUsers) &&
    (requestedView !== 'systemLogs' || permissions.canManageSystemLogs) &&
    (!['alerts', 'cases'].includes(requestedView) || permissions.canViewAlerts)

  if (!canOpenRequestedView) {
    return <Navigate replace to={VIEW_PATHS.inventory} />
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="app-shell flex min-h-screen w-full flex-col gap-3 px-3 py-2 sm:gap-6 sm:px-6 sm:py-6 lg:flex-row xl:px-8">
        <AppNavigation
          key={location.pathname}
          alertAttentionCount={metrics.alertAttentionCount}
          canManageUsers={permissions.canManageUsers}
          canManageSystemLogs={permissions.canManageSystemLogs}
          canViewAlerts={permissions.canViewAlerts}
          canViewMaintenance={permissions.canViewMaintenance}
          canViewSettings={permissions.canViewSettings}
          chatUnreadCount={workspace.chat.unreadCount}
          myCaseCount={metrics.myCaseCount}
          userName={user?.name ?? 'Usuario'}
          onLogout={handleLogout}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardHeader
            notifications={notifications.items}
            notificationsEnabled={preferences.notificationsEnabled}
            status={state.status}
            unreadNotifications={notifications.unreadCount}
            onClearNotifications={notifications.clear}
            onMarkNotificationsRead={notifications.markAllAsRead}
            onOpenNotification={handleOpenNotification}
          />
          {preferences.showDashboardStats && (
            <MetricGrid dashboard={state.dashboard} size={preferences.dashboardStatsSize} />
          )}
          {successNotice && (
            <SuccessNotice
              message={successNotice.message}
              subText={successNotice.subText}
              onClose={clearSuccess}
            />
          )}

          <AppView
            preferences={preferences}
            requestConfirmation={confirmation.request}
            updatePreferences={updatePreferences}
            user={user}
            workspace={workspace}
          />
        </div>

        <AppOverlays confirmation={confirmation} workspace={workspace} />
      </div>
    </main>
  )
}
