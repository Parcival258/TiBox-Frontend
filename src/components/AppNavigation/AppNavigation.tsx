import { useState, type ReactNode } from 'react'
import type { ActiveView } from '../../types/ui'
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
type IconName =
  | 'alerts'
  | 'building'
  | 'calendar'
  | 'cases'
  | 'inventory'
  | 'logout'
  | 'panelClose'
  | 'panelOpen'
  | 'user'
  | 'users'

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
            <Icon name={isCollapsed ? 'panelOpen' : 'panelClose'} />
          </button>
        </div>

        <nav className="cir-rail__nav" aria-label="Navegacion principal">
          <NavGroup isCollapsed={isCollapsed} title="Operacion">
            <NavButton
              active={activeView === 'inventory'}
              icon="inventory"
              isCollapsed={isCollapsed}
              label="Inventario"
              onClick={() => onChangeView('inventory')}
            />
            {canViewMaintenance && (
              <NavButton
                active={activeView === 'maintenance'}
                icon="calendar"
                isCollapsed={isCollapsed}
                label="Cronograma"
                onClick={() => onChangeView('maintenance')}
              />
            )}
          </NavGroup>

          {canViewAlerts && (
            <NavGroup isCollapsed={isCollapsed} title="Soporte">
              <NavButton
                active={activeView === 'cases'}
                badge={myCaseCount}
                icon="cases"
                isCollapsed={isCollapsed}
                label="Mis casos"
                onClick={() => onChangeView('cases')}
              />
              <NavButton
                active={activeView === 'alerts'}
                badge={alertAttentionCount}
                icon="alerts"
                isCollapsed={isCollapsed}
                label="Alertas"
                onClick={() => onChangeView('alerts')}
              />
            </NavGroup>
          )}

          {(canViewSettings || canManageUsers) && (
            <NavGroup isCollapsed={isCollapsed} title="Administracion">
              {canManageUsers && (
                <NavButton
                  active={activeView === 'users'}
                  icon="users"
                  isCollapsed={isCollapsed}
                  label="Usuarios"
                  onClick={() => onChangeView('users')}
                />
              )}
              {canViewSettings && (
                <NavButton
                  active={activeView === 'settings'}
                  icon="building"
                  isCollapsed={isCollapsed}
                  label="Sedes"
                  onClick={() => onChangeView('settings')}
                />
              )}
            </NavGroup>
          )}
        </nav>

        <div className="cir-rail__footer">
          <div className="cir-rail__user" title={isCollapsed ? userName : undefined}>
            <span className="cir-rail__avatar" aria-hidden="true">
              <Icon name="user" />
            </span>
            <span className={isCollapsed ? 'sr-only' : 'cir-rail__user-name'}>{userName}</span>
          </div>
          <button
            className="cir-rail__logout"
            title={isCollapsed ? 'Cerrar sesion' : undefined}
            type="button"
            onClick={onLogout}
          >
            <Icon name="logout" />
            <span className={isCollapsed ? 'sr-only' : undefined}>Cerrar sesion</span>
          </button>
        </div>
      </div>
    </aside>
  )
}

function NavGroup({
  children,
  isCollapsed,
  title,
}: {
  children: ReactNode
  isCollapsed: boolean
  title: string
}) {
  return (
    <section className="cir-rail__group">
      <p className={isCollapsed ? 'sr-only' : 'cir-rail__group-title'}>{title}</p>
      <div className="cir-rail__group-items">{children}</div>
    </section>
  )
}

function NavButton({
  active,
  badge,
  icon,
  isCollapsed,
  label,
  onClick,
}: {
  active: boolean
  badge?: number
  icon: IconName
  isCollapsed: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      aria-current={active ? 'page' : undefined}
      className={active ? 'cir-rail__item cir-rail__item--active' : 'cir-rail__item'}
      title={isCollapsed ? label : undefined}
      type="button"
      onClick={onClick}
    >
      <span className="cir-rail__icon" aria-hidden="true">
        <Icon name={icon} />
      </span>
      <span className={isCollapsed ? 'sr-only' : 'cir-rail__label'}>{label}</span>
      {badge ? <span className="cir-rail__badge">{badge}</span> : null}
    </button>
  )
}

function Icon({ name }: { name: IconName }) {
  const commonProps = {
    className: 'h-5 w-5',
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    strokeWidth: 1.8,
    viewBox: '0 0 24 24',
    xmlns: 'http://www.w3.org/2000/svg',
  }

  if (name === 'inventory') {
    return (
      <svg {...commonProps}>
        <path d="M4 7.5 12 3l8 4.5-8 4.5z" />
        <path d="M4 7.5v9L12 21l8-4.5v-9" />
        <path d="M12 12v9" />
      </svg>
    )
  }

  if (name === 'calendar') {
    return (
      <svg {...commonProps}>
        <path d="M7 3v3" />
        <path d="M17 3v3" />
        <path d="M4 8h16" />
        <rect height="16" rx="2" width="16" x="4" y="5" />
        <path d="M9 14h3l-1.5 3" />
        <path d="M15 14h.01" />
      </svg>
    )
  }

  if (name === 'cases') {
    return (
      <svg {...commonProps}>
        <path d="M9 4h6l1 3H8z" />
        <rect height="13" rx="2" width="16" x="4" y="7" />
        <path d="M8 12h8" />
        <path d="M8 16h5" />
      </svg>
    )
  }

  if (name === 'alerts') {
    return (
      <svg {...commonProps}>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </svg>
    )
  }

  if (name === 'building') {
    return (
      <svg {...commonProps}>
        <rect height="18" rx="2" width="12" x="6" y="3" />
        <path d="M9 7h1" />
        <path d="M14 7h1" />
        <path d="M9 11h1" />
        <path d="M14 11h1" />
        <path d="M9 15h1" />
        <path d="M14 15h1" />
        <path d="M10 21v-3h4v3" />
      </svg>
    )
  }

  if (name === 'users') {
    return (
      <svg {...commonProps}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    )
  }

  if (name === 'panelClose') {
    return (
      <svg {...commonProps}>
        <rect height="16" rx="2" width="18" x="3" y="4" />
        <path d="M9 4v16" />
        <path d="m16 10-2 2 2 2" />
      </svg>
    )
  }

  if (name === 'panelOpen') {
    return (
      <svg {...commonProps}>
        <rect height="16" rx="2" width="18" x="3" y="4" />
        <path d="M9 4v16" />
        <path d="m14 10 2 2-2 2" />
      </svg>
    )
  }

  if (name === 'logout') {
    return (
      <svg {...commonProps}>
        <path d="M10 17l5-5-5-5" />
        <path d="M15 12H3" />
        <path d="M14 4h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-5" />
      </svg>
    )
  }

  return (
    <svg {...commonProps}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}
