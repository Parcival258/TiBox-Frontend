import { AlertNotice } from '@/features/alerts'
import { AppNavigation } from './components/AppNavigation'
import { DashboardHeader, MetricGrid, SuccessNotice } from '@/shared/ui'
import { useWorkspaceController } from './hooks/useWorkspaceController'
import { useSuccessNotice } from '@/shared/hooks/useSuccessNotice'
import { useUserPreferences } from '@/shared/hooks/useUserPreferences'
import type { User } from '@/shared/types/inventory'
import type { AuthState } from '@/shared/types/ui'
import { AppOverlays } from './AppOverlays'
import { AppView } from './AppView'
import { useConfirmAction } from './hooks/useConfirmAction'
import './App.css'

type AuthenticatedAppProps = {
  authStatus: AuthState
  onLogout: () => Promise<unknown>
  user: User | null
}

export function AuthenticatedApp({ authStatus, onLogout, user }: AuthenticatedAppProps) {
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
    return onLogout().finally(actions.resetWorkspace)
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="app-shell flex min-h-screen w-full flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row xl:px-8">
        <AppNavigation
          activeView={state.activeView}
          alertAttentionCount={metrics.alertAttentionCount}
          canManageUsers={permissions.canManageUsers}
          canViewAlerts={permissions.canViewAlerts}
          canViewMaintenance={permissions.canViewMaintenance}
          canViewSettings={permissions.canViewSettings}
          myCaseCount={metrics.myCaseCount}
          userName={user?.name ?? 'Usuario'}
          onChangeView={actions.setActiveView}
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
          />
          <MetricGrid dashboard={state.dashboard} />
          {permissions.canViewAlerts &&
            metrics.alertAttentionCount > 0 &&
            state.activeView !== 'alerts' && (
              <AlertNotice
                activeView={state.activeView}
                count={metrics.alertAttentionCount}
                myCount={metrics.myAlertCount}
                unassignedFailureCount={metrics.unassignedFailureCount}
                onOpen={() => actions.setActiveView('alerts')}
              />
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
