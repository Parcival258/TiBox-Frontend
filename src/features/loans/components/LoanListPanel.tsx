import type { ModuleState } from '@/shared/types/ui'
import { AppLoader } from '@/shared/ui/Loaders'
import { formatDate } from '@/shared/utils/dateFormat'
import type { EquipmentLoan } from '../types'
import { equipmentLabel, loanStatusStyles } from '../utils/loanDisplay'
import { LoanMetric } from './LoanMetric'

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

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900">
      <div className="flex flex-col gap-3 border-b border-slate-800 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-medium text-white">Prestamos de equipos</h2>
          <p className="mt-1 text-sm text-slate-400">
            {activeLoans.length} activos / {overdueCount} vencidos
          </p>
        </div>
        <div className="grid grid-cols-4 gap-2 text-center text-sm">
          <LoanMetric label="Solicitudes" value={requestedCount} />
          <LoanMetric label="Activos" value={activeLoans.length} />
          <LoanMetric label="Vencidos" value={overdueCount} />
          <LoanMetric label="Historico" value={loans.length} />
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
      ) : (
        <div className="overflow-x-auto">
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
                <th className="px-4 py-3 font-medium">Accion</th>
              </tr>
            </thead>
            <tbody>
              {loans.map((loan) => (
                <tr key={loan.id} className="border-t border-slate-800">
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${
                        loanStatusStyles[loan.status] ?? 'border-slate-700 bg-slate-950 text-slate-300'
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
                    {canCreate && loan.status === 'requested' ? (
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
                    ) : canReturn && (loan.status === 'active' || loan.status === 'overdue') && !loan.returnedAt ? (
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
      )}
    </div>
  )
}
