import type { DashboardSummary } from '@/app/types/dashboard'
import type { DashboardStatsSize } from '@/shared/types/ui'

type MetricGridProps = {
  dashboard: DashboardSummary
  size: DashboardStatsSize
}

const sizeStyles: Record<
  DashboardStatsSize,
  { grid: string; card: string; label: string; value: string }
> = {
  compact: {
    card: 'p-3 sm:p-3',
    grid: 'grid-cols-2 gap-2 py-3 sm:py-4',
    label: 'text-xs',
    value: 'mt-1 text-2xl',
  },
  large: {
    card: 'p-3 sm:p-5',
    grid: 'grid-cols-2 gap-2 py-3 sm:gap-4 sm:py-7',
    label: 'text-xs sm:text-base',
    value: 'mt-1 text-2xl sm:mt-3 sm:text-4xl',
  },
  medium: {
    card: 'p-3 sm:p-4',
    grid: 'grid-cols-2 gap-2 py-3 sm:gap-3 sm:py-6',
    label: 'text-xs sm:text-sm',
    value: 'mt-1 text-2xl sm:mt-2 sm:text-3xl',
  },
}

export function MetricGrid({ dashboard, size }: MetricGridProps) {
  const styles = sizeStyles[size]
  const metrics = [
    ['Total equipos', dashboard.equipment.total],
    ['Activos', dashboard.equipment.active],
    ['En mantenimiento', dashboard.equipment.inMaintenance],
    ['Dañados', dashboard.equipment.damaged],
    ['Mant. próximos', dashboard.maintenance.upcoming],
    ['Mant. vencidos', dashboard.maintenance.overdue],
    ['Arriendos por vencer', dashboard.expirations.leases],
    ['Garantías por vencer', dashboard.expirations.warranties],
  ] as const

  return (
    <section className={`grid sm:grid-cols-2 lg:grid-cols-4 ${styles.grid}`}>
      {metrics.map(([label, value]) => (
        <article
          key={label}
          className={`rounded-lg border border-slate-800 bg-slate-900 ${styles.card}`}
        >
          <p className={`${styles.label} min-h-8 text-slate-400 sm:min-h-0`}>{label}</p>
          <p className={`${styles.value} font-semibold leading-none text-white`}>{value}</p>
        </article>
      ))}
    </section>
  )
}
