import type { DashboardSummary } from '../types/inventory'

type MetricGridProps = {
  dashboard: DashboardSummary
}

export function MetricGrid({ dashboard }: MetricGridProps) {
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
    <section className="grid gap-3 py-6 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map(([label, value]) => (
        <article key={label} className="rounded-lg border border-slate-800 bg-slate-900 p-4">
          <p className="text-sm text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
        </article>
      ))}
    </section>
  )
}
