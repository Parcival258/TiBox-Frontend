import { useState } from 'react'
import type { ActiveView } from '@/shared/types/ui'
import { AppNavigationButton, AppNavigationGroup } from './AppNavigationItems'
import { NavigationIcon } from './navigationIcons'
import './AppNavigation.css'

type AppNavigationProps = {
  activeView: ActiveView
  alertAttentionCount: number
  canViewAlerts: boolean
  canViewMaintenance: boolean
  canViewSettings: boolean
  canManageUsers: boolean
  myCaseCount: number
  userName: string
  onChangeView: (view: ActiveView) => void
  onLogout: () => void
}

type SidebarState = 'expanded' | 'collapsed'
type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => void
}
export function AppNavigation({
  activeView,
  alertAttentionCount,
  canViewAlerts,
  canViewMaintenance,
  canViewSettings,
  canManageUsers,
  myCaseCount,
  userName,
  onChangeView,
  onLogout,
}: AppNavigationProps) {
  const [sidebarState, setSidebarState] = useState<SidebarState>('expanded')
  const isCollapsed = sidebarState === 'collapsed'

  function changeView(view: ActiveView) {
    if (view === activeView) {
      return
    }

    const viewTransitionDocument = document as ViewTransitionDocument
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (viewTransitionDocument.startViewTransition && !reduceMotion) {
      viewTransitionDocument.startViewTransition(() => onChangeView(view))
      return
    }

    onChangeView(view)
  }

  return (
    <aside className={isCollapsed ? 'app-sidebar app-sidebar--collapsed' : 'app-sidebar'}>
      <div className={isCollapsed ? 'cir-rail cir-rail--collapsed' : 'cir-rail'}>
        <div className="cir-rail__head">
          <div className={isCollapsed ? 'sr-only' : 'cir-rail__title'}>
            <p>TIBOX</p>
          </div>
          <button
            aria-label={isCollapsed ? 'Expandir menu lateral' : 'Contraer menu lateral'}
            className="cir-rail__b cir-rail__b--toggle"
            title={isCollapsed ? 'Expandir menu lateral' : 'Contraer menu lateral'}
            type="button"
            onClick={() => setSidebarState(isCollapsed ? 'expanded' : 'collapsed')}
          >
            <NavigationIcon name={isCollapsed ? 'panelOpen' : 'panelClose'} />
          </button>
        </div>

        <nav className="cir-rail__nav" aria-label="Navegacion principal">
          <AppNavigationGroup isCollapsed={isCollapsed} title="Operacion">
            <AppNavigationButton
              active={activeView === 'inventory'}
              icon="inventory"
              isCollapsed={isCollapsed}
              label="Inventario"
              onClick={() => changeView('inventory')}
            />
            <AppNavigationButton
              active={activeView === 'loans'}
              icon="loans"
              isCollapsed={isCollapsed}
              label="Prestamos"
              onClick={() => changeView('loans')}
            />
            {canViewMaintenance && (
              <AppNavigationButton
                active={activeView === 'maintenance'}
                icon="calendar"
                isCollapsed={isCollapsed}
                label="Cronograma"
                onClick={() => changeView('maintenance')}
              />
            )}
          </AppNavigationGroup>

          {canViewAlerts && (
            <AppNavigationGroup isCollapsed={isCollapsed} title="Soporte">
              <AppNavigationButton
                active={activeView === 'cases'}
                badge={myCaseCount}
                icon="cases"
                isCollapsed={isCollapsed}
                label="Mis casos"
                onClick={() => changeView('cases')}
              />
              <AppNavigationButton
                active={activeView === 'alerts'}
                badge={alertAttentionCount}
                icon="alerts"
                isCollapsed={isCollapsed}
                label="Alertas"
                onClick={() => changeView('alerts')}
              />
            </AppNavigationGroup>
          )}

          <AppNavigationGroup isCollapsed={isCollapsed} title="Administracion">
              {canManageUsers && (
                <AppNavigationButton
                  active={activeView === 'users'}
                  icon="users"
                  isCollapsed={isCollapsed}
                  label="Usuarios"
                  onClick={() => changeView('users')}
                />
              )}
              {canViewSettings && (
                <AppNavigationButton
                  active={activeView === 'headquarters'}
                  icon="building"
                  isCollapsed={isCollapsed}
                  label="Sedes y Tipos"
                  onClick={() => changeView('headquarters')}
                />
              )}
              <AppNavigationButton
                active={activeView === 'settings'}
                icon="settings"
                isCollapsed={isCollapsed}
                label="Configuracion"
                onClick={() => changeView('settings')}
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
