import type { EquipmentCatalogs } from '../../types/equipmentCatalogs'
import type { LocationSelectorOptions, LocationSelectorState } from '../EquipmentFormModal'
import { FieldGroup, Input, Select, Textarea } from './EquipmentFormFields'
import type { EquipmentFormState } from './equipmentFormState'
import { statusOptions } from './equipmentFormState'

type EquipmentFormSectionsProps = {
  catalogs: EquipmentCatalogs | null
  form: EquipmentFormState
  locationOptions: LocationSelectorOptions
  locationSelector: LocationSelectorState
  onChangeField: <Key extends keyof EquipmentFormState>(
    key: Key,
    value: EquipmentFormState[Key]
  ) => void
  onChangeLocationArea: (value: string) => void
  onChangeLocationFloor: (value: string) => void
}

export function EquipmentFormSections({
  catalogs,
  form,
  locationOptions,
  locationSelector,
  onChangeField,
  onChangeLocationArea,
  onChangeLocationFloor,
}: EquipmentFormSectionsProps) {
  return (
    <div className="grid gap-5 p-5 lg:grid-cols-3">
      <FieldGroup title="Identificacion">
        <Input
          label="Codigo"
          required
          value={form.internalCode}
          onChange={(value) => onChangeField('internalCode', value)}
        />
        <Input
          label="Serial"
          required
          value={form.serial}
          onChange={(value) => onChangeField('serial', value)}
        />
        <Input
          label="Placa de inventario"
          value={form.assetTag}
          onChange={(value) => onChangeField('assetTag', value)}
        />
        <Select
          label="Tipo"
          required
          value={form.type}
          onChange={(value) => onChangeField('type', value)}
          options={Array.from(new Set([...(catalogs?.types ?? []), form.type].filter(Boolean))).map((type) => ({
            label: type,
            value: type,
          }))}
        />
        <Input label="Marca" value={form.brand} onChange={(value) => onChangeField('brand', value)} />
        <Input label="Modelo" value={form.model} onChange={(value) => onChangeField('model', value)} />
      </FieldGroup>

      <FieldGroup title="Red y hardware">
        <Input label="IP(s)" value={form.ipAddresses} onChange={(value) => onChangeField('ipAddresses', value)} />
        <Input label="MAC" value={form.macAddress} onChange={(value) => onChangeField('macAddress', value)} />
        <Input label="Procesador" value={form.processor} onChange={(value) => onChangeField('processor', value)} />
        <Input
          label="Tipo almacenamiento"
          value={form.storageType}
          onChange={(value) => onChangeField('storageType', value)}
        />
        <Input
          label="Capacidad GB"
          type="number"
          value={form.storageCapacityGb}
          onChange={(value) => onChangeField('storageCapacityGb', value)}
        />
      </FieldGroup>

      <FieldGroup title="Estado y ubicacion">
        <Select
          label="Estado"
          value={form.status}
          onChange={(value) => onChangeField('status', value)}
          options={statusOptions}
        />
        <Select
          label="Propiedad"
          value={form.ownershipType}
          onChange={(value) => onChangeField('ownershipType', value as 'owned' | 'leased')}
          options={[
            { label: 'Propio', value: 'owned' },
            { label: 'Arrendado', value: 'leased' },
          ]}
        />
        <Select
          label="Sede"
          value={form.headquarterId}
          onChange={(value) => onChangeField('headquarterId', value)}
          options={(catalogs?.headquarters ?? []).map((headquarter) => ({
            label: headquarter.name,
            value: headquarter.id,
          }))}
        />
        <Select
          disabled={!form.headquarterId}
          label="Piso"
          value={locationSelector.floor}
          onChange={onChangeLocationFloor}
          options={locationOptions.floors}
        />
        <Select
          disabled={!locationSelector.floor}
          label="Area"
          value={locationSelector.area}
          onChange={onChangeLocationArea}
          options={locationOptions.areas}
        />
        <Select
          disabled={!locationSelector.floor || !locationSelector.area}
          label="Oficina"
          value={form.locationId}
          onChange={(value) => onChangeField('locationId', value)}
          options={locationOptions.offices}
        />
        <Select
          label="Responsable"
          value={form.currentResponsibleId}
          onChange={(value) => onChangeField('currentResponsibleId', value)}
          options={(catalogs?.responsibles ?? []).map((responsible) => ({
            label: responsible.name,
            value: responsible.id,
          }))}
        />
        <Select
          label="Responsable 2"
          value={form.secondaryResponsibleId}
          onChange={(value) => onChangeField('secondaryResponsibleId', value)}
          options={(catalogs?.responsibles ?? []).map((responsible) => ({
            label: responsible.name,
            value: responsible.id,
          }))}
        />
      </FieldGroup>

      <FieldGroup title="Garantia y arriendo">
        <Input
          label="Fecha compra"
          type="date"
          value={form.purchaseDate}
          onChange={(value) => onChangeField('purchaseDate', value)}
        />
        <Input
          label="Garantia hasta"
          type="date"
          value={form.warrantyUntil}
          onChange={(value) => onChangeField('warrantyUntil', value)}
        />
        <Input
          label="Proveedor leasing"
          value={form.leaseProvider}
          onChange={(value) => onChangeField('leaseProvider', value)}
        />
        <Input
          label="Contrato leasing"
          value={form.leaseContractNumber}
          onChange={(value) => onChangeField('leaseContractNumber', value)}
        />
        <Input
          label="Fin arriendo"
          type="date"
          value={form.leaseUntil}
          onChange={(value) => onChangeField('leaseUntil', value)}
        />
      </FieldGroup>

      <div className="lg:col-span-2">
        <FieldGroup title="Notas">
          <Textarea label="Notas" value={form.notes} onChange={(value) => onChangeField('notes', value)} />
        </FieldGroup>
      </div>
    </div>
  )
}
