import { useState } from 'react'
import { VIEW_PATHS } from '../routes'
import { AppNavigationButton, AppNavigationGroup } from './AppNavigationItems'
import { NavigationIcon } from './navigationIcons'
import './AppNavigation.css'

type AppNavigationProps = {
  alertAttentionCount: number
  canViewAlerts: boolean
  canViewMaintenance: boolean
  canViewSettings: boolean
  canManageUsers: boolean
  canManageSystemLogs: boolean
  myCaseCount: number
  chatUnreadCount: number
  userName: string
  onLogout: () => void
}

type SidebarState = 'expanded' | 'collapsed'
export function AppNavigation({
  alertAttentionCount,
  canViewAlerts,
  canViewMaintenance,
  canViewSettings,
  canManageUsers,
  canManageSystemLogs,
  chatUnreadCount,
  myCaseCount,
  userName,
  onLogout,
}: AppNavigationProps) {
  const [sidebarState, setSidebarState] = useState<SidebarState>(() =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches
      ? 'collapsed'
      : 'expanded'
  )
  const isCollapsed = sidebarState === 'collapsed'

  return (
    <aside className={isCollapsed ? 'app-sidebar app-sidebar--collapsed' : 'app-sidebar'}>
      <div className={isCollapsed ? 'cir-rail cir-rail--collapsed' : 'cir-rail'}>
        <div className="cir-rail__head">
          <div className={isCollapsed ? 'cir-rail__title cir-rail__title--collapsed' : 'cir-rail__title'}>
            <p>TIBOX</p>
          </div>
          <button
            aria-expanded={!isCollapsed}
            aria-label={isCollapsed ? 'Abrir menu principal' : 'Cerrar menu principal'}
            className="cir-rail__b cir-rail__b--toggle"
            title={isCollapsed ? 'Abrir menu principal' : 'Cerrar menu principal'}
            type="button"
            onClick={() => setSidebarState(isCollapsed ? 'expanded' : 'collapsed')}
          >
            <NavigationIcon name={isCollapsed ? 'panelOpen' : 'panelClose'} />
          </button>
        </div>

        <nav className="cir-rail__nav" aria-label="Navegacion principal">
          <AppNavigationGroup isCollapsed={isCollapsed} title="Operacion">
            <AppNavigationButton
              icon="inventory"
              isCollapsed={isCollapsed}
              label="Inventario"
              to={VIEW_PATHS.inventory}
            />
            <AppNavigationButton
              icon="loans"
              isCollapsed={isCollapsed}
              label="Prestamos"
              to={VIEW_PATHS.loans}
            />
            {canViewMaintenance && (
              <AppNavigationButton
                icon="calendar"
                isCollapsed={isCollapsed}
                label="Mantenimientos"
                to={VIEW_PATHS.maintenance}
              />
            )}
          </AppNavigationGroup>

          {canViewAlerts && (
            <AppNavigationGroup isCollapsed={isCollapsed} title="Soporte">
              <AppNavigationButton
                badge={myCaseCount}
                icon="cases"
                isCollapsed={isCollapsed}
                label="Mis casos"
                to={VIEW_PATHS.cases}
              />
              <AppNavigationButton
                badge={alertAttentionCount}
                icon="alerts"
                isCollapsed={isCollapsed}
                label="Alertas"
                to={VIEW_PATHS.alerts}
              />
            </AppNavigationGroup>
          )}

          <AppNavigationGroup isCollapsed={isCollapsed} title="Comunicacion">
            <AppNavigationButton
              badge={chatUnreadCount}
              icon="chat"
              isCollapsed={isCollapsed}
              label="Chat"
              to={VIEW_PATHS.chat}
            />
          </AppNavigationGroup>

          <AppNavigationGroup isCollapsed={isCollapsed} title="Administracion">
              {canManageUsers && (
                <AppNavigationButton
                  icon="users"
                  isCollapsed={isCollapsed}
                  label="Usuarios"
                  to={VIEW_PATHS.users}
                />
              )}
              {canManageSystemLogs && (
                <AppNavigationButton
                  icon="logs"
                  isCollapsed={isCollapsed}
                  label="Logs del sistema"
                  to={VIEW_PATHS.systemLogs}
                />
              )}
              {canViewSettings && (
                <AppNavigationButton
                  icon="building"
                  isCollapsed={isCollapsed}
                  label="Sedes y Tipos"
                  to={VIEW_PATHS.headquarters}
                />
              )}
              <AppNavigationButton
                icon="settings"
                isCollapsed={isCollapsed}
                label="Configuracion"
                to={VIEW_PATHS.settings}
              />
          </AppNavigationGroup>
        </nav>

        <div className="cir-rail__footer">
          <div className="cir-rail__user" title={isCollapsed ? userName : undefined}>
            <span className="cir-rail__avatar" aria-hidden="true">
              <NavigationIcon name="user" />
            </span>
            <span className={isCollapsed ? 'sr-only' : 'cir-rail__user-name'}>{userName}</span>
          </div>
          <button
            className="cir-rail__logout"
            title={isCollapsed ? 'Cerrar sesion' : undefined}
            type="button"
            onClick={onLogout}
          >
            <NavigationIcon name="logout" />
            <span className={isCollapsed ? 'sr-only' : undefined}>Cerrar sesion</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
