import { useMemo, useState } from 'react'
import type { ModuleState } from '@/shared/types/ui'
import { AppLoader } from '@/shared/ui/Loaders'
import { formatDate } from '@/shared/utils/dateFormat'
import type { EquipmentLoan, EquipmentLoanStatus } from '../types'
import { equipmentLabel, loanStatusStyles } from '../utils/loanDisplay'
import { LoanMetric } from './LoanMetric'

type LoanListView = 'requests' | 'current' | 'history' | 'all'

const currentStatuses = new Set<EquipmentLoanStatus>(['active', 'overdue'])
const historyStatuses = new Set<EquipmentLoanStatus>(['returned', 'rejected', 'cancelled'])

type LoanListPanelProps = {
  canCreate: boolean
  canReturn: boolean
  isSubmitting: boolean
  loans: EquipmentLoan[]
  status: ModuleState
  onApprove: (loan: EquipmentLoan) => void
  onReject: (loan: EquipmentLoan) => void
  onReturn: (loan: EquipmentLoan) => void
}

export function LoanListPanel({
  canCreate,
  canReturn,
  isSubmitting,
  loans,
  status,
  onApprove,
  onReject,
  onReturn,
}: LoanListPanelProps) {
  const activeLoans = loans.filter((loan) => loan.status === 'active' || loan.status === 'overdue')
  const overdueCount = activeLoans.filter((loan) => loan.status === 'overdue').length
  const requestedCount = loans.filter((loan) => loan.status === 'requested').length
  const historyCount = loans.filter((loan) => historyStatuses.has(loan.status)).length
  const [selectedView, setSelectedView] = useState<LoanListView>(() => {
    if (requestedCount > 0) return 'requests'
    if (activeLoans.length > 0) return 'current'
    if (historyCount > 0) return 'history'
    return 'all'
  })

  const viewOptions = useMemo(
    () => [
      { count: requestedCount, label: 'Solicitudes', value: 'requests' as const },
      { count: activeLoans.length, label: 'En curso', value: 'current' as const },
      { count: historyCount, label: 'Historial', value: 'history' as const },
      { count: loans.length, label: 'Todos', value: 'all' as const },
    ],
    [activeLoans.length, historyCount, loans.length, requestedCount]
  )

  const filteredLoans = useMemo(() => {
    if (selectedView === 'requests') {
      return sortLoansForView(
        loans.filter((loan) => loan.status === 'requested'),
        selectedView
      )
    }

    if (selectedView === 'current') {
      return sortLoansForView(
        loans.filter((loan) => currentStatuses.has(loan.status)),
        selectedView
      )
    }

    if (selectedView === 'history') {
      return sortLoansForView(
        loans.filter((loan) => historyStatuses.has(loan.status)),
        selectedView
      )
    }

    return sortLoansForView(loans, selectedView)
  }, [loans, selectedView])

  const emptyLabel =
    viewOptions.find((option) => option.value === selectedView)?.label ?? 'esta vista'
  const showHistoryContext = selectedView === 'history'

  return (
    <div className="min-w-0 rounded-lg border border-slate-800 bg-slate-900">
      <div className="flex flex-col gap-4 border-b border-slate-800 px-4 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-medium text-white">Prestamos de equipos</h2>
            <p className="mt-1 text-sm text-slate-400">
              {activeLoans.length} en curso / {overdueCount} vencidos
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center text-sm min-[480px]:grid-cols-4">
            <LoanMetric label="Solicitudes" value={requestedCount} />
            <LoanMetric label="En curso" value={activeLoans.length} />
            <LoanMetric label="Vencidos" value={overdueCount} />
            <LoanMetric label="Cerrados" value={historyCount} />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {viewOptions.map((option) => {
            const isSelected = selectedView === option.value

            return (
              <button
                className={`inline-flex shrink-0 items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition ${
                  isSelected
                    ? 'border-cyan-700 bg-cyan-950/40 text-cyan-100'
                    : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-cyan-700 hover:text-white'
                }`}
                key={option.value}
                type="button"
                onClick={() => setSelectedView(option.value)}
              >
                <span>{option.label}</span>
                <span className="rounded bg-slate-900 px-1.5 py-0.5 text-xs text-slate-300">
                  {option.count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {status === 'loading' ? (
        <div className="flex min-h-72 items-center justify-center px-4 py-12">
          <AppLoader label="Cargando préstamos..." />
        </div>
      ) : status === 'error' ? (
        <div className="px-4 py-12 text-center text-sm text-red-200">
          No fue posible cargar los prestamos.
        </div>
      ) : loans.length === 0 ? (
        <div className="px-4 py-12 text-center text-sm text-slate-400">
          No hay prestamos registrados.
        </div>
      ) : filteredLoans.length === 0 ? (
        <div className="px-4 py-12 text-center text-sm text-slate-400">
          No hay prestamos en {emptyLabel.toLowerCase()}.
        </div>
      ) : (
        <>
          <div className="grid gap-3 p-3 md:hidden">
            {filteredLoans.map((loan) => (
              <article
                className="rounded-lg border border-slate-800 bg-slate-950/70 p-3"
                key={loan.id}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <span
                    className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${
                      loanStatusStyles[loan.status] ??
                      'border-slate-700 bg-slate-950 text-slate-300'
                    }`}
                  >
                    {loan.statusLabel}
                  </span>
                  <span className="text-xs text-slate-500">{loanCloseSummary(loan)}</span>
                </div>
                <div className="mt-3 min-w-0">
                  <p className="break-words text-sm font-semibold text-white">
                    {loan.equipment ? equipmentLabel(loan.equipment) : 'Sin asignar'}
                  </p>
                  <p className="mt-1 break-words text-sm text-slate-300">{loan.borrowerLabel}</p>
                  <p className="mt-2 break-words text-sm text-slate-400">{loan.requestedItem}</p>
                  {loan.rejectionReason && (
                    <p className="mt-1 break-words text-xs text-rose-300">
                      {loan.rejectionReason}
                    </p>
                  )}
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <dt className="text-slate-500">Prestamo</dt>
                    <dd className="mt-0.5 text-slate-300">{formatDate(loan.loanedAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Modo</dt>
                    <dd className="mt-0.5 text-slate-300">{loan.requestMode ?? 'Sin modo'}</dd>
                  </div>
                </dl>
                <div className="mt-3 flex flex-wrap gap-2">
                  {canCreate && loan.status === 'requested' ? (
                    <>
                      <button
                        className="rounded-md border border-emerald-700 px-3 py-1.5 text-sm font-medium text-emerald-100 transition hover:border-emerald-400"
                        disabled={isSubmitting}
                        type="button"
                        onClick={() => onApprove(loan)}
                      >
                        Asignar equipo
                      </button>
                      <button
                        className="rounded-md border border-rose-800 px-3 py-1.5 text-sm font-medium text-rose-200 transition hover:border-rose-500"
                        type="button"
                        onClick={() => onReject(loan)}
                      >
                        Rechazar
                      </button>
                    </>
                  ) : canReturn &&
                    (loan.status === 'active' || loan.status === 'overdue') &&
                    !loan.returnedAt ? (
                    <button
                      className="rounded-md border border-emerald-700 px-3 py-1.5 text-sm font-medium text-emerald-100 transition hover:border-emerald-400 hover:text-white"
                      type="button"
                      onClick={() => onReturn(loan)}
                    >
                      Recibir
                    </button>
                  ) : (
                    <span className="text-sm text-slate-500">Sin accion</span>
                  )}
                </div>
                {historyStatuses.has(loan.status) && (
                  <div className="mt-3 rounded-md border border-slate-800 bg-slate-900/70 px-3 py-2 text-xs text-slate-300">
                    <p className="font-medium text-slate-200">{loanCloseTitle(loan)}</p>
                    <p className="mt-1 text-slate-400">{loanCloseDetail(loan)}</p>
                  </div>
                )}
              </article>
            ))}
          </div>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="bg-slate-950 text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Equipo</th>
                  <th className="px-4 py-3 font-medium">Solicitante</th>
                  <th className="px-4 py-3 font-medium">Solicitud</th>
                  <th className="px-4 py-3 font-medium">Prestamo</th>
                  <th className="px-4 py-3 font-medium">Devolucion estimada</th>
                  <th className="px-4 py-3 font-medium">Modo</th>
                  <th className="px-4 py-3 font-medium">
                    {showHistoryContext ? 'Cierre' : 'Accion'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLoans.map((loan) => (
                  <tr key={loan.id} className="border-t border-slate-800 align-top">
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${
                          loanStatusStyles[loan.status] ??
                          'border-slate-700 bg-slate-950 text-slate-300'
                        }`}
                      >
                        {loan.statusLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white">
                      {loan.equipment ? (
                        equipmentLabel(loan.equipment)
                      ) : (
                        <span className="text-amber-300">Sin asignar</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{loan.borrowerLabel}</td>
                    <td className="px-4 py-3 text-slate-300">
                      <div>{loan.requestedItem}</div>
                      {loan.rejectionReason && (
                        <div className="mt-1 text-xs text-rose-300">{loan.rejectionReason}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{formatDate(loan.loanedAt)}</td>
                    <td className="px-4 py-3 text-slate-300">
                      {formatDate(loan.estimatedReturnAt)}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{loan.requestMode ?? 'Sin modo'}</td>
                    <td className="px-4 py-3">
                      {showHistoryContext || historyStatuses.has(loan.status) ? (
                        <div className="max-w-56 text-sm">
                          <p className="font-medium text-slate-200">{loanCloseTitle(loan)}</p>
                          <p className="mt-1 text-xs text-slate-400">{loanCloseDetail(loan)}</p>
                        </div>
                      ) : canCreate && loan.status === 'requested' ? (
                        <div className="flex gap-2">
                          <button
                            className="rounded-md border border-emerald-700 px-3 py-1.5 text-sm font-medium text-emerald-100 transition hover:border-emerald-400"
                            disabled={isSubmitting}
                            type="button"
                            onClick={() => onApprove(loan)}
                          >
                            Asignar equipo
                          </button>
                          <button
                            className="rounded-md border border-rose-800 px-3 py-1.5 text-sm font-medium text-rose-200 transition hover:border-rose-500"
                            type="button"
                            onClick={() => onReject(loan)}
                          >
                            Rechazar
                          </button>
                        </div>
                      ) : canReturn &&
                        (loan.status === 'active' || loan.status === 'overdue') &&
                        !loan.returnedAt ? (
                        <button
                          className="rounded-md border border-emerald-700 px-3 py-1.5 text-sm font-medium text-emerald-100 transition hover:border-emerald-400 hover:text-white"
                          type="button"
                          onClick={() => onReturn(loan)}
                        >
                          Recibir
                        </button>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

function sortLoansForView(loans: EquipmentLoan[], view: LoanListView) {
  const sortedLoans = [...loans]

  if (view === 'requests') {
    return sortedLoans.sort(
      (first, second) => dateValue(second.requestedAt) - dateValue(first.requestedAt)
    )
  }

  if (view === 'current') {
    return sortedLoans.sort((first, second) => {
      if (first.status !== second.status) {
        return first.status === 'overdue' ? -1 : 1
      }

      return dateValue(first.estimatedReturnAt) - dateValue(second.estimatedReturnAt)
    })
  }

  if (view === 'history') {
    return sortedLoans.sort((first, second) => loanClosedAt(second) - loanClosedAt(first))
  }

  return sortedLoans
}

function loanClosedAt(loan: EquipmentLoan) {
  return dateValue(loan.returnedAt ?? loan.loanedAt ?? loan.requestedAt)
}

function dateValue(value: string | null | undefined) {
  if (!value) return 0

  const time = new Date(value).getTime()
  return Number.isNaN(time) ? 0 : time
}

function loanCloseSummary(loan: EquipmentLoan) {
  if (loan.returnedAt) {
    return `Cerro ${formatDate(loan.returnedAt)}`
  }

  if (loan.status === 'rejected') {
    return 'Rechazado'
  }

  if (loan.status === 'cancelled') {
    return 'Cancelado'
  }

  return `Estimada ${formatDate(loan.estimatedReturnAt)}`
}

function loanCloseTitle(loan: EquipmentLoan) {
  if (loan.returnedAt) {
    return `Devuelto el ${formatDate(loan.returnedAt)}`
  }

  if (loan.status === 'rejected') {
    return 'Solicitud rechazada'
  }

  if (loan.status === 'cancelled') {
    return 'Solicitud cancelada'
  }

  return 'Registro cerrado'
}

function loanCloseDetail(loan: EquipmentLoan) {
  if (loan.rejectionReason) {
    return loan.rejectionReason
  }

  if (loan.returnedAt) {
    return `Prestado el ${formatDate(loan.loanedAt)}. Devolucion estimada: ${formatDate(loan.estimatedReturnAt)}.`
  }

  return `Solicitud creada el ${formatDate(loan.requestedAt)}.`
}
