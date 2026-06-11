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
type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => void
}
type IconName =
  | 'alerts'
  | 'building'
  | 'settings'
  | 'calendar'
  | 'cases'
  | 'inventory'
  | 'loans'
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
              onClick={() => changeView('inventory')}
            />
            <NavButton
              active={activeView === 'loans'}
              icon="loans"
              isCollapsed={isCollapsed}
              label="Prestamos"
              onClick={() => changeView('loans')}
            />
            {canViewMaintenance && (
              <NavButton
                active={activeView === 'maintenance'}
                icon="calendar"
                isCollapsed={isCollapsed}
                label="Cronograma"
                onClick={() => changeView('maintenance')}
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
                onClick={() => changeView('cases')}
              />
              <NavButton
                active={activeView === 'alerts'}
                badge={alertAttentionCount}
                icon="alerts"
                isCollapsed={isCollapsed}
                label="Alertas"
                onClick={() => changeView('alerts')}
              />
            </NavGroup>
          )}

          <NavGroup isCollapsed={isCollapsed} title="Administracion">
              {canManageUsers && (
                <NavButton
                  active={activeView === 'users'}
                  icon="users"
                  isCollapsed={isCollapsed}
                  label="Usuarios"
                  onClick={() => changeView('users')}
                />
              )}
              {canViewSettings && (
                <NavButton
                  active={activeView === 'headquarters'}
                  icon="building"
                  isCollapsed={isCollapsed}
                  label="Sedes y Tipos"
                  onClick={() => changeView('headquarters')}
                />
              )}
              <NavButton
                active={activeView === 'settings'}
                icon="settings"
                isCollapsed={isCollapsed}
                label="Configuracion"
                onClick={() => changeView('settings')}
              />
          </NavGroup>
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
      className={[
        'cir-rail__item',
        active ? 'cir-rail__item--active' : '',
        `cir-rail__item--${icon}`,
      ].filter(Boolean).join(' ')}
      title={isCollapsed ? label : undefined}
      type="button"
      onClick={onClick}
    >
      <span className="cir-rail__active-indicator" aria-hidden="true" />
      <span className="cir-rail__icon" aria-hidden="true">
        <Icon name={icon} />
        {badge ? (
          <span className="cir-rail__badge">{badge > 9 ? '9+' : badge}</span>
        ) : null}
      </span>
      <span className={isCollapsed ? 'sr-only' : 'cir-rail__label'}>{label}</span>
      {badge ? <span className="sr-only">, {badge} pendientes</span> : null}
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

  if (name === 'loans') {
    return (
      <svg {...commonProps}>
        <path d="M8 7h8" />
        <path d="M8 11h8" />
        <path d="M8 15h5" />
        <rect height="16" rx="2" width="14" x="5" y="4" />
        <path d="m15 17 2 2 4-4" />
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

  if (name === 'settings') {
    return (
      <svg {...commonProps} strokeWidth={1.5} viewBox="0 0 20 20">
        <circle cx="10" cy="10" r="2.5" />
        <path d="m8.39079 2.80235c.53842-1.51424 2.67991-1.51424 3.21831-.00001.3392.95358 1.4284 1.40477 2.3425.97027 1.4514-.68995 2.9657.82427 2.2758 2.27575-.4345.91407.0166 2.00334.9702 2.34248 1.5143.53842 1.5143 2.67996 0 3.21836-.9536.3391-1.4047 1.4284-.9702 2.3425.6899 1.4514-.8244 2.9656-2.2758 2.2757-.9141-.4345-2.0033.0167-2.3425.9703-.5384 1.5142-2.67989 1.5142-3.21831 0-.33914-.9536-1.4284-1.4048-2.34247-.9703-1.45148.6899-2.96571-.8243-2.27575-2.2757.43449-.9141-.01669-2.0034-.97028-2.3425-1.51422-.5384-1.51422-2.67994.00001-3.21836.95358-.33914 1.40476-1.42841.97027-2.34248-.68996-1.45148.82427-2.9657 2.27575-2.27575.91407.4345 2.00333-.01669 2.34247-.97026z" />
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
