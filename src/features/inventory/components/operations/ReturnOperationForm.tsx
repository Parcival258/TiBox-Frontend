import type { FormEvent } from 'react'
import { OperationSection, SubmitButton, Textarea } from './OperationFields'

type ReturnOperationFormProps = {
  disabled: boolean
  isSubmitting: boolean
  onReturnNotesChange: (value: string) => void
  onSubmit: (event: FormEvent) => void
  returnNotes: string
}

export function ReturnOperationForm({
  disabled,
  isSubmitting,
  onReturnNotesChange,
  onSubmit,
  returnNotes,
}: ReturnOperationFormProps) {
  return (
    <OperationSection title="Devolver equipo">
      <form className="space-y-3" onSubmit={onSubmit}>
        <Textarea label="Nota de devolucion" value={returnNotes} onChange={onReturnNotesChange} />
        <SubmitButton disabled={disabled || isSubmitting}>Registrar devolucion</SubmitButton>
      </form>
    </OperationSection>
  )
}
