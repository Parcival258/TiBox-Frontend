import { useState } from 'react'
import type { Alert } from '@/shared/types/inventory'
import { AppLoader } from '@/shared/ui/Loaders'
import { formatDate } from '@/shared/utils/dateFormat'

type MyCasesPanelProps = {
  alerts: Alert[]
  currentUserId: string | null
  onAddNote: (alertId: string, note: string) => void
  onDismiss: (alertId: string) => void
  onResolveCase: (alert: Alert) => void
  status: 'loading' | 'ready' | 'error'
}

export function MyCasesPanel({
  alerts,
  currentUserId,
  onAddNote,
  onDismiss,
  onResolveCase,
  status,
}: MyCasesPanelProps) {
  const [notes, setNotes] = useState<Record<string, string>>({})
  const myCases = currentUserId
    ? alerts.filter((alert) => alert.assignedTo === currentUserId && alert.status !== 'dismissed')
    : []
  const pendingCases = myCases.filter((alert) => alert.status !== 'resolved')
  const resolvedCases = myCases.filter((alert) => alert.status === 'resolved')

  if (status === 'loading') {
    return (
      <section className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-16 text-center text-sm text-slate-400">
        <AppLoader label="Cargando casos..." />
      </section>
    )
  }

  if (status === 'error') {
    return (
      <section className="rounded-lg border border-red-900 bg-red-950/30 px-4 py-12 text-center text-sm text-red-200">
        No fue posible cargar tus casos.
      </section>
    )
  }

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900">
      <div className="border-b border-slate-800 px-4 py-4">
        <h2 className="text-base font-medium text-white">Mis casos</h2>
        <p className="mt-1 text-sm text-slate-400">
          {pendingCases.length} pendiente{pendingCases.length === 1 ? '' : 's'} /{' '}
          {resolvedCases.length} resuelto{resolvedCases.length === 1 ? '' : 's'} por quitar
        </p>
      </div>

      {myCases.length === 0 ? (
        <div className="px-4 py-12 text-center text-sm text-slate-400">
          No tienes casos asignados.
        </div>
      ) : (
        <div className="space-y-5 p-4">
          <CaseGroup
            emptyText="No tienes casos pendientes."
            notes={notes}
            onAddNote={onAddNote}
            onChangeNote={(alertId, note) =>
              setNotes((current) => ({ ...current, [alertId]: note }))
            }
            onClearNote={(alertId) => setNotes((current) => ({ ...current, [alertId]: '' }))}
            onResolveCase={onResolveCase}
            title="Pendientes por cerrar"
            alerts={pendingCases}
          />
          <ResolvedGroup alerts={resolvedCases} onDismiss={onDismiss} />
        </div>
      )}
    </section>
  )
}

function CaseGroup({
  alerts,
  emptyText,
  notes,
  onAddNote,
  onChangeNote,
  onClearNote,
  onResolveCase,
  title,
}: {
  alerts: Alert[]
  emptyText: string
  notes: Record<string, string>
  onAddNote: (alertId: string, note: string) => void
  onChangeNote: (alertId: string, note: string) => void
  onClearNote: (alertId: string) => void
  onResolveCase: (alert: Alert) => void
  title: string
}) {
  return (
    <section>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      {alerts.length === 0 ? (
        <p className="mt-3 rounded-md border border-slate-800 bg-slate-950 px-3 py-3 text-sm text-slate-500">
          {emptyText}
        </p>
      ) : (
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          {alerts.map((alert) => (
            <article key={alert.id} className="rounded-md border border-cyan-800 bg-slate-950 p-3">
              <CaseHeader alert={alert} />
              {latestNote(alert) && (
                <p className="mt-3 rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-300">
                  Ultima nota: {latestNote(alert)}
                </p>
              )}
              <div className="mt-3 space-y-2">
                <textarea
                  className="min-h-20 w-full resize-y rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-cyan-500"
                  placeholder="Nota si aun no puedes cerrar el caso"
                  value={notes[alert.id] ?? ''}
                  onChange={(event) => onChangeNote(alert.id, event.target.value)}
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    className="rounded-md border border-cyan-700 px-3 py-1.5 text-xs font-medium text-cyan-100 transition hover:border-cyan-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!notes[alert.id]?.trim()}
                    type="button"
                    onClick={() => {
                      const note = notes[alert.id]?.trim()

                      if (!note) return

                      onAddNote(alert.id, note)
                      onClearNote(alert.id)
                    }}
                  >
                    Guardar nota
                  </button>
                  <button
                    className="rounded-md border border-emerald-800 px-3 py-1.5 text-xs font-medium text-emerald-200 transition hover:border-emerald-500 hover:text-white"
                    type="button"
                    onClick={() => onResolveCase(alert)}
                  >
                    Cerrar caso
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

function ResolvedGroup({ alerts, onDismiss }: { alerts: Alert[]; onDismiss: (alertId: string) => void }) {
  if (alerts.length === 0) {
    return null
  }

  return (
    <section>
      <h3 className="text-sm font-semibold text-white">Resueltos por quitar</h3>
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        {alerts.map((alert) => (
          <article key={alert.id} className="rounded-md border border-emerald-800 bg-slate-950 p-3">
            <CaseHeader alert={alert} />
            <button
              className="mt-3 rounded-md border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-slate-500 hover:text-white"
              type="button"
              onClick={() => onDismiss(alert.id)}
            >
              Quitar
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}

function CaseHeader({ alert }: { alert: Alert }) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md border border-cyan-800 bg-cyan-950/40 px-2 py-1 text-xs font-medium text-cyan-200">
          {alert.severityLabel}
        </span>
        <span className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-300">
          {alert.statusLabel}
        </span>
      </div>
      <h4 className="mt-3 text-sm font-semibold text-white">{alert.title}</h4>
      <p className="mt-1 text-sm text-slate-400">{alert.message}</p>
      <p className="mt-2 text-xs text-slate-500">
        {[alert.equipment?.internalCode, formatDate(alert.dueAt ?? alert.triggeredAt)]
          .filter(Boolean)
          .join(' / ')}
      </p>
    </>
  )
}

function latestNote(alert: Alert) {
  const notes = alert.metadata?.notes

  if (!notes?.length) {
    return null
  }

  return notes[notes.length - 1]?.note ?? null
}
