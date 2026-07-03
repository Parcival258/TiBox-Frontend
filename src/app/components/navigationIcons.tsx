export type NavigationIconName =
  | 'alerts'
  | 'building'
  | 'settings'
  | 'calendar'
  | 'cases'
  | 'chat'
  | 'inventory'
  | 'loans'
  | 'logs'
  | 'logout'
  | 'panelClose'
  | 'panelOpen'
  | 'user'
  | 'users'

export function NavigationIcon({ name }: { name: NavigationIconName }) {
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

  if (name === 'chat') {
    return (
      <svg {...commonProps} className="h-6 w-6 cir-rail__chat-svg" strokeWidth={2}>
        <path d="M0 0h24v24H0z" stroke="none" />
        <path d="M8 9h8" />
        <path d="M8 13h6" />
        <path d="M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3h-5l-5 3v-3h-2a3 3 0 0 1-3-3v-8a3 3 0 0 1 3-3h12z" />
      </svg>
    )
  }

  if (name === 'logs') {
    return (
      <svg {...commonProps}>
        <path d="M7 3h7l4 4v14H7z" />
        <path d="M14 3v5h5" />
        <path d="M10 13h6" />
        <path d="M10 17h4" />
        <path d="M4 7v14" />
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
