import type { ReactNode } from 'react'
import { useEscapeKey } from '@/shared/hooks/useEscapeKey'

type FloatingFormPanelProps = {
  children: ReactNode
  onClose: () => void
  title: string
}

export function FloatingFormPanel({ children, onClose, title }: FloatingFormPanelProps) {
  useEscapeKey(true, onClose)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6 backdrop-blur-sm">
      <section className="max-h-[calc(100vh-3rem)] w-full max-w-3xl overflow-y-auto rounded-lg border border-slate-800 bg-slate-900 shadow-2xl shadow-slate-950/40">
        <header className="flex items-center justify-between gap-4 border-b border-slate-800 px-5 py-4">
          <h3 className="text-base font-semibold text-white">{title}</h3>
          <button
            aria-label="Cerrar formulario"
            className="grid size-9 place-items-center rounded-md border border-slate-700 text-slate-300 transition hover:border-slate-500 hover:text-white"
            type="button"
            onClick={onClose}
          >
            <svg
              fill="none"
              height="18"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="18"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </header>
        <div className="p-5">{children}</div>
      </section>
    </div>
  )
}
