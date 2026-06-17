import type { FormEvent } from 'react'
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
  return (
    <OperationSection title="Adjuntar archivo">
      <form className="space-y-3" onSubmit={onSubmit}>
        <input
          className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-300 file:mr-3 file:rounded-md file:border-0 file:bg-cyan-900 file:px-3 file:py-1.5 file:text-cyan-100"
          type="file"
          onChange={(event) => onAttachmentChange(event.target.files?.[0] ?? null)}
        />
        <SubmitButton disabled={disabled || !attachment || isSubmitting}>Subir adjunto</SubmitButton>
      </form>
    </OperationSection>
  )
}
