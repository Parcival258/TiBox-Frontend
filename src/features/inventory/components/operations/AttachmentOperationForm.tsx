import { useId, type FormEvent } from 'react'
import { OperationSection, SubmitButton } from './OperationFields'

type AttachmentOperationFormProps = {
  attachment: File | null
  disabled: boolean
  isSubmitting: boolean
  onAttachmentChange: (file: File | null) => void
  onSubmit: (event: FormEvent) => void
}

export function AttachmentOperationForm({
  attachment,
  disabled,
  isSubmitting,
  onAttachmentChange,
  onSubmit,
}: AttachmentOperationFormProps) {
  const inputId = useId()

  return (
    <OperationSection title="Adjuntar archivo">
      <form className="space-y-3" onSubmit={onSubmit}>
        <div className="flex flex-wrap items-center gap-3 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm">
          <input
            className="sr-only"
            disabled={disabled || isSubmitting}
            id={inputId}
            key={attachment?.name ?? 'empty'}
            type="file"
            onChange={(event) => onAttachmentChange(event.target.files?.[0] ?? null)}
          />
          <label
            className="cursor-pointer rounded-md bg-cyan-900 px-3 py-1.5 font-medium text-cyan-100 transition hover:bg-cyan-800"
            htmlFor={inputId}
          >
            Seleccionar archivo
          </label>
          <span className="min-w-0 flex-1 truncate text-slate-300">
            {attachment?.name ?? 'Ningún archivo seleccionado'}
          </span>
        </div>
        <SubmitButton disabled={disabled || !attachment || isSubmitting}>Subir adjunto</SubmitButton>
      </form>
    </OperationSection>
  )
}
