import type { Alert, Responsible } from '../types/inventory'
import { AppLoader } from './Loaders'

type AlertCenterProps = {
  alerts: Alert[]
  canManage: boolean
  currentUserId: string | null
  isRunning: boolean
  technicians: Responsible[]
  status: 'loading' | 'ready' | 'error'
  onAcknowledge: (alertId: string) => void
  onAssign: (alertId: string, assignedTo: string) => void
  onResolve: (alertId: string) => void
  onRunChecks: () => void
  onSelfAssign: (alertId: string) => void
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return 'Sin fecha'
  }

  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

export function AlertCenter({
  alerts,
  canManage,
  currentUserId,
  isRunning,
  onAcknowledge,
  onAssign,
  onResolve,
  onRunChecks,
  onSelfAssign,
  technicians,
  status,
}: AlertCenterProps) {
  const openAlerts = alerts.filter((alert) => alert.status !== 'resolved')
  const criticalAlerts = alerts.filter((alert) => alert.severity === 'critical')

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900">
      <div className="flex flex-col gap-3 border-b border-slate-800 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-medium text-white">Alertas y seguimiento</h2>
          <p className="mt-1 text-sm text-slate-400">
            {openAlerts.length} abiertas / {criticalAlerts.length} criticas
          </p>
        </div>
        {canManage && (
          <button
            className="rounded-md border border-cyan-700 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:border-cyan-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            type="button"
            disabled={isRunning}
            onClick={onRunChecks}
          >
            {isRunning ? 'Ejecutando...' : 'Ejecutar seguimiento'}
          </button>
        )}
      </div>

      {status === 'loading' ? (
        <div className="px-4 py-16 text-center text-sm text-slate-400">
          <AppLoader label="Cargando alertas..." />
        </div>
      ) : status === 'error' ? (
        <div className="px-4 py-12 text-center text-sm text-red-200">
          No fue posible cargar las alertas.
        </div>
      ) : alerts.length === 0 ? (
        <div className="px-4 py-12 text-center text-sm text-slate-400">
          No hay alertas registradas.
        </div>
      ) : (
        <div className="divide-y divide-slate-800">
          {alerts.map((alert) => (
            <article key={alert.id} className="grid gap-4 px-4 py-4 lg:grid-cols-[1fr_260px]">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <SeverityBadge severity={alert.severity} label={alert.severityLabel} />
                  <span className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-300">
                    {alert.statusLabel}
                  </span>
                  <span className="text-xs text-slate-500">{formatDate(alert.dueAt ?? alert.triggeredAt)}</span>
                </div>
                <h3 className="mt-3 text-base font-semibold text-white">{alert.title}</h3>
                <p className="mt-1 text-sm text-slate-400">{alert.message}</p>
                <p className="mt-2 text-xs text-slate-500">
                  {[alert.equipment?.internalCode, alert.assignee?.name ?? 'Sin asignar']
                    .filter(Boolean)
                    .join(' / ')}
                </p>
              </div>
              <div className="flex flex-wrap items-start gap-2 lg:justify-end">
                {isFailureAlert(alert) && alert.status !== 'resolved' && alert.assignedTo !== currentUserId && (
                  <ActionButton
                    label={alert.assignedTo ? 'Tomar para mi' : 'Tomar'}
                    onClick={() => onSelfAssign(alert.id)}
                  />
                )}
                {canManage && isFailureAlert(alert) && alert.status !== 'resolved' && (
                  <AssignSelect
                    alertId={alert.id}
                    currentValue={alert.assignedTo ?? ''}
                    technicians={technicians}
                    onAssign={onAssign}
                  />
                )}
                {canManage && (
                  <>
                    <ActionButton
                      label="Reconocer"
                      disabled={alert.status !== 'open'}
                      onClick={() => onAcknowledge(alert.id)}
                    />
                  <ActionButton
                    label="Resolver"
                    tone="success"
                    disabled={alert.status === 'resolved'}
                    onClick={() => onResolve(alert.id)}
                  />
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

function isFailureAlert(alert: Alert) {
  return alert.type === 'damaged_equipment_reported'
}

function SeverityBadge({ label, severity }: { label: string; severity: string }) {
  const tone =
    severity === 'critical'
      ? 'border-red-800 bg-red-950/40 text-red-200'
      : severity === 'high'
        ? 'border-amber-800 bg-amber-950/40 text-amber-200'
        : 'border-cyan-800 bg-cyan-950/40 text-cyan-200'

  return <span className={`rounded-md border px-2 py-1 text-xs font-medium ${tone}`}>{label}</span>
}

function AssignSelect({
  alertId,
  currentValue,
  onAssign,
  technicians,
}: {
  alertId: string
  currentValue: string
  onAssign: (alertId: string, assignedTo: string) => void
  technicians: Responsible[]
}) {
  return (
    <label className="min-w-40 text-xs text-slate-500">
      Asignar
      <select
        className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-slate-200 outline-none transition focus:border-cyan-500"
        value={currentValue}
        onChange={(event) => {
          if (event.target.value) {
            onAssign(alertId, event.target.value)
          }
        }}
      >
        <option value="">Sin asignar</option>
        {technicians.map((technician) => (
          <option key={technician.id} value={technician.id}>
            {technician.name}
          </option>
        ))}
      </select>
    </label>
  )
}

function ActionButton({
  disabled,
  label,
  onClick,
  tone = 'default',
}: {
  disabled?: boolean
  label: string
  onClick: () => void
  tone?: 'default' | 'success'
}) {
  const toneClass =
    tone === 'success'
      ? 'border-emerald-800 text-emerald-200 hover:border-emerald-500'
      : 'border-slate-700 text-slate-300 hover:border-cyan-500'

  return (
    <button
      className={`rounded-md border px-3 py-1.5 text-xs font-medium transition hover:text-white disabled:cursor-not-allowed disabled:opacity-50 ${toneClass}`}
      type="button"
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </button>
  )
}
