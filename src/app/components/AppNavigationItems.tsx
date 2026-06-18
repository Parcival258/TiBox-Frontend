import type { ReactNode } from 'react'
import { NavigationIcon, type NavigationIconName } from './navigationIcons'

type NavGroupProps = {
  children: ReactNode
  isCollapsed: boolean
  title: string
}

type NavButtonProps = {
  active: boolean
  badge?: number
  icon: NavigationIconName
  isCollapsed: boolean
  label: string
  onClick: () => void
}

export function AppNavigationGroup({ children, isCollapsed, title }: NavGroupProps) {
  return (
    <section className="cir-rail__group">
      <p className={isCollapsed ? 'sr-only' : 'cir-rail__group-title'}>{title}</p>
      <div className="cir-rail__group-items">{children}</div>
    </section>
  )
}

export function AppNavigationButton({
  active,
  badge,
  icon,
  isCollapsed,
  label,
  onClick,
}: NavButtonProps) {
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
        <NavigationIcon name={icon} />
        {badge ? (
          <span className="cir-rail__badge">{badge > 9 ? '9+' : badge}</span>
        ) : null}
      </span>
      <span className={isCollapsed ? 'sr-only' : 'cir-rail__label'}>{label}</span>
      {badge ? <span className="sr-only">, {badge} pendientes</span> : null}
    </button>
  )
}
