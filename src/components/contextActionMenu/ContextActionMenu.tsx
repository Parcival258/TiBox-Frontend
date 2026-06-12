import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useEscapeKey } from '../../hooks/useEscapeKey'
import './ContextActionMenu.css'

export type ContextMenuAction = {
  disabled?: boolean
  icon?: ContextMenuIcon
  label: string
  onSelect: () => void
  separatorBefore?: boolean
  tone?: 'default' | 'danger' | 'muted' | 'success'
}

export type ContextMenuState = {
  actions: ContextMenuAction[]
  x: number
  y: number
} | null

type ContextMenuIcon =
  | 'calendar'
  | 'check'
  | 'edit'
  | 'eye'
  | 'play'
  | 'settings'
  | 'trash'
  | 'userPlus'

type ContextActionMenuProps = {
  menu: ContextMenuState
  onClose: () => void
}

export function ContextActionMenu({ menu, onClose }: ContextActionMenuProps) {
  useEscapeKey(Boolean(menu), onClose)

  useEffect(() => {
    if (!menu) {
      return undefined
    }

    function closeOnPointerDown() {
      onClose()
    }

    window.addEventListener('pointerdown', closeOnPointerDown)

    return () => window.removeEventListener('pointerdown', closeOnPointerDown)
  }, [menu, onClose])

  if (!menu) {
    return null
  }

  const safeX = Math.min(menu.x, window.innerWidth - 220)
  const safeY = Math.min(menu.y, window.innerHeight - Math.min(320, 48 + menu.actions.length * 42))

  return createPortal(
    <div
      className="context-action-menu"
      role="menu"
      style={{ left: Math.max(12, safeX), top: Math.max(12, safeY) }}
      onContextMenu={(event) => event.preventDefault()}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <ul className="context-action-menu__list">
        {menu.actions.map((action) => (
          <MenuItem action={action} key={action.label} onClose={onClose} />
        ))}
      </ul>
    </div>,
    document.body
  )
}

function MenuItem({
  action,
  onClose,
}: {
  action: ContextMenuAction
  onClose: () => void
}) {
  return (
    <>
      {action.separatorBefore && <li className="context-action-menu__separator" role="separator" />}
      <li>
        <button
          className={`context-action-menu__button context-action-menu__button--${action.tone ?? 'default'}`}
          disabled={action.disabled}
          role="menuitem"
          type="button"
          onClick={() => {
            action.onSelect()
            onClose()
          }}
        >
          <Icon name={action.icon ?? 'settings'} />
          <span>{action.label}</span>
        </button>
      </li>
    </>
  )
}

function Icon({ name }: { name: ContextMenuIcon }) {
  const commonProps = {
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    strokeWidth: 2,
    viewBox: '0 0 24 24',
    xmlns: 'http://www.w3.org/2000/svg',
  }

  const icons: Record<ContextMenuIcon, ReactNode> = {
    calendar: (
      <svg {...commonProps}>
        <path d="M8 2v4" />
        <path d="M16 2v4" />
        <rect height="18" rx="2" width="18" x="3" y="4" />
        <path d="M3 10h18" />
      </svg>
    ),
    check: (
      <svg {...commonProps}>
        <path d="M20 6 9 17l-5-5" />
      </svg>
    ),
    edit: (
      <svg {...commonProps}>
        <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
        <path d="m15 5 4 4" />
      </svg>
    ),
    eye: (
      <svg {...commonProps}>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    play: (
      <svg {...commonProps}>
        <path d="m8 5 11 7-11 7z" />
      </svg>
    ),
    settings: (
      <svg {...commonProps}>
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    trash: (
      <svg {...commonProps}>
        <path d="M3 6h18" />
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        <line x1="10" x2="10" y1="11" y2="17" />
        <line x1="14" x2="14" y1="11" y2="17" />
      </svg>
    ),
    userPlus: (
      <svg {...commonProps}>
        <path d="M2 21a8 8 0 0 1 13.292-6" />
        <circle cx="10" cy="8" r="5" />
        <path d="M19 16v6" />
        <path d="M22 19h-6" />
      </svg>
    ),
  }

  return icons[name]
}
