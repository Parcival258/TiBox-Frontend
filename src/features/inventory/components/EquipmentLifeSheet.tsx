import { AppLoader } from '@/shared/ui/Loaders'
import type { EquipmentLifeSheet } from '../types/equipmentLifeSheet'
import {
  failureStatusLabel,
  maintenanceStatusLabel,
  maintenanceTypeLabel,
  priorityLabel,
} from '@/shared/utils/enumLabels'
import { formatDate } from '@/shared/utils/dateFormat'
import { Metric } from './lifeSheet/LifeSheetFields'
import { LifeSheetAttachments } from './lifeSheet/LifeSheetAttachments'
import { LifeSheetEquipmentDetails } from './lifeSheet/LifeSheetEquipmentDetails'
import { LifeSheetOpenFailures } from './lifeSheet/LifeSheetOpenFailures'
import { LifeSheetTimeline } from './lifeSheet/LifeSheetTimeline'
import {
  technicalHistoryStatusLabel,
  technicalHistoryTypeLabel,
} from './lifeSheet/lifeSheetFormatters'

type EquipmentLifeSheetProps = {
  canResolveFailures?: boolean
  lifeSheet: EquipmentLifeSheet | null
  onDeleteAttachment?: (attachmentId: string) => Promise<void>
  onResolveFailure?: (failureReportId: string) => Promise<void>
  status: 'idle' | 'loading' | 'ready' | 'error'
}

export function EquipmentLifeSheet({
  canResolveFailures,
  lifeSheet,
  onDeleteAttachment,
  onResolveFailure,
  status,
}: EquipmentLifeSheetProps) {
  if (status === 'idle') {
    return (
      <aside className="rounded-lg border border-slate-800 bg-slate-900 p-5 text-sm text-slate-400">
        Selecciona un equipo para ver su hoja de vida.
      </aside>
    )
  }

  if (status === 'loading') {
    return (
      <aside className="rounded-lg border border-slate-800 bg-slate-900 p-5 text-sm text-slate-400">
        <AppLoader label="Cargando hoja de vida..." />
      </aside>
    )
  }

  if (status === 'error' || !lifeSheet) {
    return (
      <aside className="rounded-lg border border-red-900 bg-red-950/30 p-5 text-sm text-red-200">
        No fue posible cargar la hoja de vida del equipo.
      </aside>
    )
  }

  const { equipment, summary } = lifeSheet
  const title = [equipment.brand, equipment.model].filter(Boolean).join(' ') || equipment.type
  const openFailureReports = lifeSheet.failureReports.filter((report) =>
    ['open', 'in_review'].includes(report.status)
  )

  return (
    <aside className="space-y-4 rounded-lg border border-slate-800 bg-slate-900 p-3 sm:p-5">
      <div>
        <p className="text-xs uppercase tracking-wide text-cyan-300">Hoja de vida</p>
        <h2 className="mt-1 text-xl font-semibold text-white">{equipment.internalCode}</h2>
        <p className="text-sm text-slate-400">{title}</p>
      </div>

      {summary.openFailureReports > 0 && (
        <div className="rounded-md border border-amber-800 bg-amber-950/40 px-3 py-2 text-sm text-amber-100">
          Este equipo tiene {summary.openFailureReports} falla
          {summary.openFailureReports === 1 ? '' : 's'} abierta
          {summary.openFailureReports === 1 ? '' : 's'}.
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 text-sm min-[380px]:grid-cols-2">
        <Metric label="Mantenimientos" value={summary.totalMaintenanceRecords} />
        <Metric label="Fallas abiertas" value={summary.openFailureReports} />
        <Metric label="Asignaciones" value={summary.totalAssignments} />
        <Metric label="Prestamos" value={summary.totalLoans} />
        <Metric label="Adjuntos" value={summary.totalAttachments} />
      </div>

      <LifeSheetOpenFailures
        canResolve={Boolean(canResolveFailures && onResolveFailure)}
        failures={openFailureReports}
        onResolveFailure={onResolveFailure}
      />

      <LifeSheetEquipmentDetails equipment={equipment} />

      <LifeSheetTimeline
        title="Historial tecnico"
        emptyText="Sin historial tecnico registrado."
        items={lifeSheet.technicalHistory.slice(0, 8).map((item) => ({
          id: item.id,
          title: `${technicalHistoryTypeLabel(item)} / ${technicalHistoryStatusLabel(item)}`,
          date: formatDate(item.date),
          detail: item.detail || item.title,
        }))}
      />

      <LifeSheetTimeline
        title="Mantenimientos"
        emptyText="Sin mantenimientos registrados."
        items={lifeSheet.maintenanceRecords.map((record) => ({
          id: record.id,
          title: `${maintenanceTypeLabel(record.maintenanceType)} / ${maintenanceStatusLabel(
            record.status
          )}`,
          date: formatDate(record.performedAt ?? record.scheduledDate),
          detail:
            record.actionsTaken ||
            record.description ||
            record.diagnosis ||
            `Prioridad ${priorityLabel(record.priority)}`,
        }))}
      />

      <LifeSheetTimeline
        title="Fallas"
        emptyText="Sin fallas registradas."
        items={lifeSheet.failureReports.map((report) => ({
          id: report.id,
          title: `${report.title} / ${failureStatusLabel(report.status)}`,
          date: formatDate(report.createdAt),
          detail: `${report.description} Prioridad ${priorityLabel(report.priority)}.`,
        }))}
      />

      <LifeSheetAttachments
        attachments={lifeSheet.attachments}
        equipmentId={equipment.id}
        onDeleteAttachment={onDeleteAttachment}
      />

      <LifeSheetTimeline
        title="Asignaciones"
        emptyText="Sin asignaciones registradas."
        items={lifeSheet.assignments.map((assignment) => ({
          id: assignment.id,
          title: assignment.user?.name ?? 'Usuario no disponible',
          date: formatDate(assignment.assignedAt),
          detail: assignment.returnedAt
            ? `Devuelto: ${formatDate(assignment.returnedAt)}`
            : 'Asignacion activa',
        }))}
      />

      <LifeSheetTimeline
        title="Prestamos"
        emptyText="Sin prestamos registrados."
        items={lifeSheet.loans.map((loan) => ({
          id: loan.id,
          title: `${loan.borrowerLabel} / ${loan.statusLabel}`,
          date: formatDate(loan.loanedAt),
          detail: loan.returnedAt
            ? `Devuelto: ${formatDate(loan.returnedAt)}`
            : `Devolucion estimada: ${formatDate(loan.estimatedReturnAt)}`,
        }))}
      />
    </aside>
  )
}
