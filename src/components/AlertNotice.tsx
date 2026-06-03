import type { ActiveView } from '../types/ui'

type AlertNoticeProps = {
  activeView: ActiveView
  count: number
  myCount: number
  onOpen: () => void
  unassignedFailureCount: number
}

export function AlertNotice({
  activeView,
  count,
  myCount,
  onOpen,
  unassignedFailureCount,
}: AlertNoticeProps) {
  const detail =
    unassignedFailureCount > 0
      ? `${unassignedFailureCount} falla${unassignedFailureCount === 1 ? '' : 's'} sin asignar`
      : myCount > 0
        ? `${myCount} alerta${myCount === 1 ? '' : 's'} asignada${myCount === 1 ? '' : 's'} a ti`
        : `${count} alerta${count === 1 ? '' : 's'} pendiente${count === 1 ? '' : 's'}`

  return (
    <section className="mb-5 mt-4 flex flex-col gap-3 rounded-lg border border-amber-700 bg-amber-950/35 px-4 py-3 text-sm text-amber-100 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-semibold">Alertas pendientes</p>
        <p className="mt-1 text-amber-100/80">{detail}</p>
      </div>
      {activeView !== 'alerts' && (
        <button
          className="rounded-md border border-amber-500 px-3 py-2 text-sm font-medium text-amber-100 transition hover:border-amber-300 hover:text-white"
          type="button"
          onClick={onOpen}
        >
          Revisar alertas
        </button>
      )}
    </section>
  )
}
