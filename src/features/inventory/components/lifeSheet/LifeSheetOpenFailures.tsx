import type { FailureReport } from '../../types/equipmentFailures'
import { formatDate } from '@/shared/utils/dateFormat'
import { failureStatusLabel, priorityLabel } from '@/shared/utils/enumLabels'

type LifeSheetOpenFailuresProps = {
  canResolve: boolean
  failures: FailureReport[]
  onResolveFailure?: (failureReportId: string) => Promise<void>
}

export function LifeSheetOpenFailures({
  canResolve,
  failures,
  onResolveFailure,
}: LifeSheetOpenFailuresProps) {
  if (failures.length === 0) {
    return (
      <section className="rounded-md border border-slate-800 bg-slate-950 px-3 py-3">
        <h3 className="text-sm font-semibold text-white">Fallas abiertas</h3>
        <p className="mt-2 text-sm text-slate-500">No hay fallas pendientes en este equipo.</p>
      </section>
    )
  }

  return (
    <section className="rounded-md border border-amber-800 bg-amber-950/30 px-3 py-3">
      <h3 className="text-sm font-semibold text-amber-100">Fallas abiertas</h3>
      <div className="mt-3 space-y-3">
        {failures.map((failure) => (
          <article key={failure.id} className="rounded-md border border-amber-900/70 bg-slate-950 p-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-white">{failure.title}</p>
                <p className="mt-1 text-xs text-amber-200">
                  {failureStatusLabel(failure.status)} / Prioridad {priorityLabel(failure.priority)}
                </p>
                <p className="mt-2 text-sm text-slate-400">{failure.description}</p>
                <p className="mt-2 text-xs text-slate-500">
                  Reportada el {formatDate(failure.createdAt)}
                </p>
              </div>
              {canResolve && (
                <button
                  className="shrink-0 rounded-md border border-emerald-800 px-3 py-2 text-xs font-medium text-emerald-200 transition hover:border-emerald-500 hover:text-white"
                  type="button"
                  onClick={() => onResolveFailure?.(failure.id)}
                >
                  Resolver falla
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
