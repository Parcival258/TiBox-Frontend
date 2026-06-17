import type { FormEvent } from 'react'
import { Input, OperationSection, Select, SubmitButton, Textarea } from './OperationFields'
import { priorityOptions } from './operationOptions'

type FailureOperationFormProps = {
  disabled: boolean
  failureDescription: string
  failurePriority: string
  failureTitle: string
  isSubmitting: boolean
  onFailureDescriptionChange: (value: string) => void
  onFailurePriorityChange: (value: string) => void
  onFailureTitleChange: (value: string) => void
  onSubmit: (event: FormEvent) => void
}

export function FailureOperationForm({
  disabled,
  failureDescription,
  failurePriority,
  failureTitle,
  isSubmitting,
  onFailureDescriptionChange,
  onFailurePriorityChange,
  onFailureTitleChange,
  onSubmit,
}: FailureOperationFormProps) {
  return (
    <OperationSection title="Reportar falla">
      <form className="space-y-3" onSubmit={onSubmit}>
        <Input label="Titulo" value={failureTitle} onChange={onFailureTitleChange} />
        <Textarea
          label="Descripcion"
          value={failureDescription}
          onChange={onFailureDescriptionChange}
        />
        <Select
          label="Prioridad"
          value={failurePriority}
          onChange={onFailurePriorityChange}
          options={priorityOptions}
        />
        <SubmitButton disabled={disabled || !failureTitle || !failureDescription || isSubmitting}>
          Crear falla
        </SubmitButton>
      </form>
    </OperationSection>
  )
}
