import type { ReactNode } from 'react'
import { AppLoader } from './Loaders'
import { equipmentAttachmentDownloadUrl } from '../services/inventory'
import type {
  EquipmentAttachment,
  EquipmentLifeSheet,
  TechnicalHistoryItem,
} from '../types/inventory'
import {
  equipmentStatusLabel,
  failureStatusLabel,
  maintenanceStatusLabel,
  maintenanceTypeLabel,
  ownershipTypeLabel,
  priorityLabel,
} from '../utils/enumLabels'

type EquipmentLifeSheetProps = {
  lifeSheet: EquipmentLifeSheet | null
  onDeleteAttachment?: (attachmentId: string) => Promise<void>
  status: 'idle' | 'loading' | 'ready' | 'error'
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

function valueOrEmpty(value: string | null | undefined) {
  return value || 'Sin dato'
}

function formatStorageCapacity(value: number | null | undefined) {
  return value === null || value === undefined ? 'Sin dato' : `${value} GB`
}

function formatBytes(value: number | null | undefined) {
  if (!value) {
    return 'Tamano no disponible'
  }

  if (value < 1024 * 1024) {
    return `${Math.round(value / 1024)} KB`
  }

  return `${(value / 1024 / 1024).toFixed(1)} MB`
}

export function EquipmentLifeSheet({
  lifeSheet,
  onDeleteAttachment,
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

  return (
    <aside className="space-y-4 rounded-lg border border-slate-800 bg-slate-900 p-5">
      <div>
        <p className="text-xs uppercase tracking-wide text-cyan-300">Hoja de vida</p>
        <h2 className="mt-1 text-xl font-semibold text-white">{equipment.internalCode}</h2>
        <p className="text-sm text-slate-400">{title}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <Metric label="Mantenimientos" value={summary.totalMaintenanceRecords} />
        <Metric label="Fallas abiertas" value={summary.openFailureReports} />
        <Metric label="Asignaciones" value={summary.totalAssignments} />
        <Metric label="Adjuntos" value={summary.totalAttachments} />
      </div>

      <Section title="Identificacion">
        <Info label="Serial" value={equipment.serial} />
        <Info label="Activo" value={valueOrEmpty(equipment.assetTag)} />
        <Info label="Estado" value={equipmentStatusLabel(equipment.status)} />
        <Info label="Propiedad" value={ownershipTypeLabel(equipment.ownershipType)} />
      </Section>

      <Section title="Red y hardware">
        <Info label="IP(s)" value={valueOrEmpty(equipment.ipAddresses)} />
        <Info label="MAC" value={valueOrEmpty(equipment.macAddress)} />
        <Info label="Procesador" value={valueOrEmpty(equipment.processor)} />
        <Info label="Almacenamiento" value={valueOrEmpty(equipment.storageType)} />
        <Info label="Capacidad" value={formatStorageCapacity(equipment.storageCapacityGb)} />
      </Section>

      <Section title="Ubicacion y responsables">
        <Info label="Sede" value={valueOrEmpty(equipment.headquarter?.name)} />
        <Info
          label="Ubicacion"
          value={
            [equipment.location?.area, equipment.location?.office].filter(Boolean).join(' / ') ||
            'Sin dato'
          }
        />
        <Info label="Responsable" value={valueOrEmpty(equipment.currentResponsible?.name)} />
        <Info label="Responsable 2" value={valueOrEmpty(equipment.secondaryResponsible?.name)} />
      </Section>

      <Section title="Garantia y arriendo">
        <Info label="Compra" value={formatDate(equipment.purchaseDate)} />
        <Info label="Garantia" value={formatDate(equipment.warrantyUntil)} />
        <Info label="Proveedor" value={valueOrEmpty(equipment.leaseProvider)} />
        <Info label="Contrato" value={valueOrEmpty(equipment.leaseContractNumber)} />
        <Info label="Fin arriendo" value={formatDate(equipment.leaseUntil)} />
      </Section>

      <Timeline
        title="Historial tecnico"
        emptyText="Sin historial tecnico registrado."
        items={lifeSheet.technicalHistory.slice(0, 8).map((item) => ({
          id: item.id,
          title: `${technicalHistoryTypeLabel(item)} / ${technicalHistoryStatusLabel(item)}`,
          date: formatDate(item.date),
          detail: item.detail || item.title,
        }))}
      />

      <Timeline
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

      <Timeline
        title="Fallas"
        emptyText="Sin fallas registradas."
        items={lifeSheet.failureReports.map((report) => ({
          id: report.id,
          title: `${report.title} / ${failureStatusLabel(report.status)}`,
          date: formatDate(report.createdAt),
          detail: `${report.description} Prioridad ${priorityLabel(report.priority)}.`,
        }))}
      />

      <AttachmentList
        attachments={lifeSheet.attachments}
        equipmentId={equipment.id}
        onDeleteAttachment={onDeleteAttachment}
      />

      <Timeline
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
    </aside>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-slate-800 bg-slate-950 px-3 py-2">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  )
}

function Section({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="border-t border-slate-800 pt-4">
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <div className="mt-3 space-y-2">{children}</div>
    </section>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="max-w-[60%] text-right text-slate-200">{value}</span>
    </div>
  )
}

function technicalHistoryTypeLabel(item: TechnicalHistoryItem) {
  const labels: Record<TechnicalHistoryItem['type'], string> = {
    equipment_assignment: 'Asignacion',
    failure_report: 'Falla',
    maintenance_record: 'Mantenimiento',
    maintenance_schedule: 'Programacion',
  }

  return labels[item.type]
}

function technicalHistoryStatusLabel(item: TechnicalHistoryItem) {
  if (item.type === 'failure_report') {
    return failureStatusLabel(item.status)
  }

  if (item.type === 'equipment_assignment') {
    return item.status === 'returned' ? 'Devuelto' : 'Activo'
  }

  return maintenanceStatusLabel(item.status)
}

function Timeline({
  emptyText,
  items,
  title,
}: {
  emptyText: string
  items: Array<{ id: string; title: string; date: string; detail: string }>
  title: string
}) {
  return (
    <section className="border-t border-slate-800 pt-4">
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">{emptyText}</p>
      ) : (
        <div className="mt-3 space-y-3">
          {items.slice(0, 5).map((item) => (
            <div key={item.id} className="rounded-md border border-slate-800 bg-slate-950 p-3">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-slate-100">{item.title}</p>
                <span className="shrink-0 text-xs text-slate-500">{item.date}</span>
              </div>
              <p className="mt-2 text-sm text-slate-400">{item.detail}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function AttachmentList({
  attachments,
  equipmentId,
  onDeleteAttachment,
}: {
  attachments: EquipmentAttachment[]
  equipmentId: string
  onDeleteAttachment?: (attachmentId: string) => Promise<void>
}) {
  return (
    <section className="border-t border-slate-800 pt-4">
      <h3 className="text-sm font-semibold text-white">Adjuntos</h3>
      {attachments.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">Sin adjuntos registrados.</p>
      ) : (
        <div className="mt-3 space-y-3">
          {attachments.slice(0, 5).map((attachment) => (
            <div key={attachment.id} className="rounded-md border border-slate-800 bg-slate-950 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-100">{attachment.fileName}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatBytes(attachment.sizeBytes)} / {formatDate(attachment.createdAt)}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <a
                    className="rounded-md border border-cyan-800 px-2.5 py-1 text-xs font-medium text-cyan-200 transition hover:border-cyan-500 hover:text-white"
                    href={equipmentAttachmentDownloadUrl(equipmentId, attachment.id)}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Ver
                  </a>
                  {onDeleteAttachment && (
                    <button
                      className="rounded-md border border-red-800 px-2.5 py-1 text-xs font-medium text-red-200 transition hover:border-red-500 hover:text-white"
                      type="button"
                      onClick={() => {
                        const shouldDelete = window.confirm('Retirar este adjunto?')

                        if (shouldDelete) {
                          onDeleteAttachment(attachment.id)
                        }
                      }}
                    >
                      Retirar
                    </button>
                  )}
                </div>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Subido por {attachment.uploader?.name ?? 'Usuario no disponible'}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
