import { useEscapeKey } from '../hooks/useEscapeKey'

type ConfirmDialogProps = {
  confirmLabel?: string
  isOpen: boolean
  message: string
  onCancel: () => void
  onConfirm: () => void
  title: string
}

export function ConfirmDialog({
  confirmLabel = 'Confirmar',
  isOpen,
  message,
  onCancel,
  onConfirm,
  title,
}: ConfirmDialogProps) {
  useEscapeKey(isOpen, onCancel)

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-6">
      <div className="w-full max-w-xs rounded-2xl border border-blue-100 bg-white p-4 shadow-2xl shadow-slate-950/20">
        <div className="flex items-center gap-4">
          <span className="flex shrink-0 items-center justify-center rounded-full bg-red-500 p-2 text-white">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path
                clipRule="evenodd"
                d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z"
                fillRule="evenodd"
              />
            </svg>
          </span>
          <p className="font-semibold text-slate-600">{title}</p>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-600">{message}</p>
        <div className="mt-6 space-y-2">
          <button
            className="block w-full rounded-lg bg-red-500 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-red-600"
            type="button"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
          <button
            className="block w-full rounded-lg bg-slate-50 px-5 py-3 text-center text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
            type="button"
            onClick={onCancel}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
