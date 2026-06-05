import type { ActiveView } from '../types/ui'

type AppNavigationProps = {
  activeView: ActiveView
  alertAttentionCount: number
  canViewAlerts: boolean
  canViewMaintenance: boolean
  canViewSettings: boolean
  myCaseCount: number
  onChangeView: (view: ActiveView) => void
}

export function AppNavigation({
  activeView,
  alertAttentionCount,
  canViewAlerts,
  canViewMaintenance,
  canViewSettings,
  myCaseCount,
  onChangeView,
}: AppNavigationProps) {
  return (
    <nav className="mb-6 flex flex-wrap gap-2">
      <TabButton
        active={activeView === 'inventory'}
        label="Inventario"
        onClick={() => onChangeView('inventory')}
      />
      {canViewMaintenance && (
        <TabButton
          active={activeView === 'maintenance'}
          label="Cronograma"
          onClick={() => onChangeView('maintenance')}
        />
      )}
      {canViewSettings && (
        <TabButton
          active={activeView === 'settings'}
          label="Sedes"
          onClick={() => onChangeView('settings')}
        />
      )}
      {canViewAlerts && (
        <TabButton
          active={activeView === 'cases'}
          badge={myCaseCount}
          label="Mis casos"
          onClick={() => onChangeView('cases')}
        />
      )}
      {canViewAlerts && (
        <TabButton
          active={activeView === 'alerts'}
          badge={alertAttentionCount}
          label="Alertas"
          onClick={() => onChangeView('alerts')}
        />
      )}
    </nav>
  )
}

function TabButton({
  active,
  badge,
  label,
  onClick,
}: {
  active: boolean
  badge?: number
  label: string
  onClick: () => void
}) {
  return (
    <button
      className={
        active
          ? 'rounded-md border border-cyan-600 bg-cyan-950/50 px-4 py-2 text-sm font-medium text-white'
          : 'rounded-md border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:text-white'
      }
      type="button"
      onClick={onClick}
    >
      <span>{label}</span>
      {badge ? (
        <span className="ml-2 rounded-full border border-amber-500/60 bg-amber-500 px-2 py-0.5 text-xs font-semibold text-slate-950">
          {badge}
        </span>
      ) : null}
    </button>
  )
}
