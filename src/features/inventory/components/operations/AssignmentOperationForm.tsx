import type { FormEvent } from 'react'
import type { EquipmentCatalogs } from '../../types/equipmentCatalogs'
import { OperationSection, Select, SubmitButton, Textarea } from './OperationFields'

type AssignmentOperationFormProps = {
  assignNotes: string
  assignUserId: string
  catalogs: EquipmentCatalogs | null
  disabled: boolean
  isSubmitting: boolean
  onAssignNotesChange: (value: string) => void
  onAssignUserIdChange: (value: string) => void
  onSubmit: (event: FormEvent) => void
}

export function AssignmentOperationForm({
  assignNotes,
  assignUserId,
  catalogs,
  disabled,
  isSubmitting,
  onAssignNotesChange,
  onAssignUserIdChange,
  onSubmit,
}: AssignmentOperationFormProps) {
  return (
    <OperationSection title="Asignar equipo">
      <form className="space-y-3" onSubmit={onSubmit}>
        <Select
          disabled={disabled || isSubmitting}
          label="Responsable"
          value={assignUserId}
          onChange={onAssignUserIdChange}
          options={(catalogs?.responsibles ?? []).map((responsible) => ({
            label: responsible.name,
            value: responsible.id,
          }))}
        />
        <Textarea label="Nota" value={assignNotes} onChange={onAssignNotesChange} />
        <SubmitButton disabled={disabled || !assignUserId || isSubmitting}>Asignar</SubmitButton>
      </form>
    </OperationSection>
  )
}
