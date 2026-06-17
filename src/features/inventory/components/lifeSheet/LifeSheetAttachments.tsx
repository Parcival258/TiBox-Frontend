import { equipmentAttachmentDownloadUrl } from '@/features/inventory/services/equipmentAttachmentsService'
import type { EquipmentAttachment } from '../../types/equipmentAttachments'
import { formatDate } from '@/shared/utils/dateFormat'
import { formatBytes } from './lifeSheetFormatters'

type LifeSheetAttachmentsProps = {
  attachments: EquipmentAttachment[]
  equipmentId: string
  onDeleteAttachment?: (attachmentId: string) => Promise<void>
}

export function LifeSheetAttachments({
  attachments,
  equipmentId,
  onDeleteAttachment,
}: LifeSheetAttachmentsProps) {
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
