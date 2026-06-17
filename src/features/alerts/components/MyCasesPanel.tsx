import { useState } from 'react'
import type { Alert } from '../types'
import { AppLoader } from '@/shared/ui/Loaders'
import { CaseGroup, ResolvedGroup } from './MyCaseGroups'

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
