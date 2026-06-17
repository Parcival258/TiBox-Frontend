import type { FormEvent } from 'react'
import type { EquipmentCatalogs } from '../../types/equipmentCatalogs'
import { Input, OperationSection, SearchableSelect, Select, SubmitButton, Textarea } from './OperationFields'
import { priorityOptions, responsibleSearchText } from './operationOptions'

type MaintenanceOperationFormProps = {
  catalogs: EquipmentCatalogs | null
  disabled: boolean
  isSubmitting: boolean
  maintenanceActions: string
  maintenanceCost: string
  maintenanceDescription: string
  maintenanceDiagnosis: string
  maintenancePriority: string
  maintenanceTechnicianId: string
  maintenanceType: 'preventive' | 'corrective'
  nextMaintenanceAt: string
  onMaintenanceActionsChange: (value: string) => void
  onMaintenanceCostChange: (value: string) => void
  onMaintenanceDescriptionChange: (value: string) => void
  onMaintenanceDiagnosisChange: (value: string) => void
  onMaintenancePriorityChange: (value: string) => void
  onMaintenanceTechnicianIdChange: (value: string) => void
  onMaintenanceTypeChange: (value: 'preventive' | 'corrective') => void
  onNextMaintenanceAtChange: (value: string) => void
  onSubmit: (event: FormEvent) => void
}

export function MaintenanceOperationForm({
  catalogs,
  disabled,
  isSubmitting,
  maintenanceActions,
  maintenanceCost,
  maintenanceDescription,
  maintenanceDiagnosis,
  maintenancePriority,
  maintenanceTechnicianId,
  maintenanceType,
  nextMaintenanceAt,
  onMaintenanceActionsChange,
  onMaintenanceCostChange,
  onMaintenanceDescriptionChange,
  onMaintenanceDiagnosisChange,
  onMaintenancePriorityChange,
  onMaintenanceTechnicianIdChange,
  onMaintenanceTypeChange,
  onNextMaintenanceAtChange,
  onSubmit,
}: MaintenanceOperationFormProps) {
  return (
    <OperationSection title="Registrar mantenimiento">
      <form className="space-y-3" onSubmit={onSubmit}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Select
            label="Tipo"
            value={maintenanceType}
            onChange={(value) => onMaintenanceTypeChange(value as 'preventive' | 'corrective')}
            options={[
              { label: 'Preventivo', value: 'preventive' },
              { label: 'Correctivo', value: 'corrective' },
            ]}
          />
          <Select
            label="Prioridad"
            value={maintenancePriority}
            onChange={onMaintenancePriorityChange}
            options={priorityOptions}
          />
        </div>
        <SearchableSelect
          disabled={disabled || isSubmitting}
          label="Tecnico"
          placeholder="Buscar tecnico"
          value={maintenanceTechnicianId}
          onChange={onMaintenanceTechnicianIdChange}
          options={(catalogs?.responsibles ?? []).map((responsible) => ({
            label: responsible.name,
            searchText: responsibleSearchText(responsible),
            value: responsible.id,
          }))}
        />
        <Textarea
          label="Descripcion"
          value={maintenanceDescription}
          onChange={onMaintenanceDescriptionChange}
        />
        <Textarea
          label="Diagnostico"
          value={maintenanceDiagnosis}
          onChange={onMaintenanceDiagnosisChange}
        />
        <Textarea
          label="Acciones realizadas"
          value={maintenanceActions}
          onChange={onMaintenanceActionsChange}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Costo" type="number" value={maintenanceCost} onChange={onMaintenanceCostChange} />
          <Input
            label="Proximo mantenimiento"
            type="date"
            value={nextMaintenanceAt}
            onChange={onNextMaintenanceAtChange}
          />
        </div>
        <SubmitButton disabled={disabled || isSubmitting}>Guardar mantenimiento</SubmitButton>
      </form>
    </OperationSection>
  )
}
