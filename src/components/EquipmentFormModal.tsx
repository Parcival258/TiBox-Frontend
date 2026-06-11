import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { useEscapeKey } from '../hooks/useEscapeKey'
import { DateInput } from './DateInput'
import type { Equipment, EquipmentCatalogs, EquipmentPayload } from '../types/inventory'

type EquipmentFormModalProps = {
  catalogs: EquipmentCatalogs | null
  equipment: Equipment | null
  isOpen: boolean
  mode: 'create' | 'edit'
  onClose: () => void
  onSubmit: (payload: EquipmentPayload) => Promise<void>
}

type FormState = {
  assetTag: string
  brand: string
  currentResponsibleId: string
  headquarterId: string
  internalCode: string
  ipAddresses: string
  leaseContractNumber: string
  leaseProvider: string
  leaseUntil: string
  locationId: string
  macAddress: string
  model: string
  notes: string
  ownershipType: 'owned' | 'leased'
  processor: string
  purchaseDate: string
  secondaryResponsibleId: string
  serial: string
  status: string
  storageCapacityGb: string
  storageType: string
  type: string
  warrantyUntil: string
}

const emptyForm: FormState = {
  assetTag: '',
  brand: '',
  currentResponsibleId: '',
  headquarterId: '',
  internalCode: '',
  ipAddresses: '',
  leaseContractNumber: '',
  leaseProvider: '',
  leaseUntil: '',
  locationId: '',
  macAddress: '',
  model: '',
  notes: '',
  ownershipType: 'owned',
  processor: '',
  purchaseDate: '',
  secondaryResponsibleId: '',
  serial: '',
  status: 'active',
  storageCapacityGb: '',
  storageType: '',
  type: '',
  warrantyUntil: '',
}

function dateValue(value: string | null | undefined) {
  return value ? value.slice(0, 10) : ''
}

function toForm(equipment: Equipment | null): FormState {
  if (!equipment) {
    return emptyForm
  }

  return {
    assetTag: equipment.assetTag ?? '',
    brand: equipment.brand ?? '',
    currentResponsibleId: '',
    headquarterId: '',
    internalCode: equipment.internalCode,
    ipAddresses: equipment.ipAddresses ?? '',
    leaseContractNumber: equipment.leaseContractNumber ?? '',
    leaseProvider: equipment.leaseProvider ?? '',
    leaseUntil: dateValue(equipment.leaseUntil),
    locationId: '',
    macAddress: equipment.macAddress ?? '',
    model: equipment.model ?? '',
    notes: equipment.notes ?? '',
    ownershipType: equipment.ownershipType,
    processor: equipment.processor ?? '',
    purchaseDate: dateValue(equipment.purchaseDate),
    secondaryResponsibleId: '',
    serial: equipment.serial,
    status: equipment.status,
    storageCapacityGb:
      equipment.storageCapacityGb === null || equipment.storageCapacityGb === undefined
        ? ''
        : String(equipment.storageCapacityGb),
    storageType: equipment.storageType ?? '',
    type: equipment.type,
    warrantyUntil: dateValue(equipment.warrantyUntil),
  }
}

function optional(value: string) {
  return value.trim() || undefined
}

export function EquipmentFormModal({
  catalogs,
  equipment,
  isOpen,
  mode,
  onClose,
  onSubmit,
}: EquipmentFormModalProps) {
  const [form, setForm] = useState<FormState>(emptyForm)
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'error'>('idle')

  useEscapeKey(isOpen, onClose)

  useEffect(() => {
    if (isOpen) {
      setForm(toForm(equipment))
      setSubmitState('idle')
    }
  }, [equipment, isOpen])

  const locationOptions = useMemo(() => {
    const locations = catalogs?.locations ?? []

    return locations
      .filter((location) => !form.headquarterId || location.headquarterId === form.headquarterId)
      .map((location) => ({
        label: [location.area, location.office, location.floor].filter(Boolean).join(' / '),
        value: location.id,
      }))
  }, [catalogs?.locations, form.headquarterId])

  if (!isOpen) {
    return null
  }

  function setField<Key extends keyof FormState>(key: Key, value: FormState[Key]) {
    setForm((current) => ({
      ...current,
      [key]: value,
      ...(key === 'headquarterId' ? { locationId: '' } : {}),
    }))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitState('submitting')

    const payload: EquipmentPayload = {
      internalCode: form.internalCode.trim(),
      serial: form.serial.trim(),
      type: form.type.trim(),
      assetTag: optional(form.assetTag),
      brand: optional(form.brand),
      currentResponsibleId: optional(form.currentResponsibleId),
      headquarterId: optional(form.headquarterId),
      ipAddresses: optional(form.ipAddresses),
      leaseContractNumber: optional(form.leaseContractNumber),
      leaseProvider: optional(form.leaseProvider),
      leaseUntil: optional(form.leaseUntil),
      locationId: optional(form.locationId),
      macAddress: optional(form.macAddress),
      model: optional(form.model),
      notes: optional(form.notes),
      ownershipType: form.ownershipType,
      processor: optional(form.processor),
      purchaseDate: optional(form.purchaseDate),
      secondaryResponsibleId: optional(form.secondaryResponsibleId),
      status: form.status,
      storageCapacityGb: form.storageCapacityGb ? Number(form.storageCapacityGb) : undefined,
      storageType: optional(form.storageType),
      warrantyUntil: optional(form.warrantyUntil),
    }

    try {
      await onSubmit(payload)
      onClose()
    } catch {
      setSubmitState('error')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/80 px-4 py-8">
      <form
        className="w-full max-w-5xl rounded-lg border border-slate-800 bg-slate-900 shadow-2xl"
        onSubmit={handleSubmit}
      >
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-cyan-300">Equipo</p>
            <h2 className="text-xl font-semibold text-white">
              {mode === 'create' ? 'Nuevo equipo' : 'Editar equipo'}
            </h2>
          </div>
          <button
            className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
            type="button"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>

        <div className="grid gap-5 p-5 lg:grid-cols-3">
          <FieldGroup title="Identificacion">
            <Input label="Codigo" required value={form.internalCode} onChange={(value) => setField('internalCode', value)} />
            <Input label="Serial" required value={form.serial} onChange={(value) => setField('serial', value)} />
            <Input label="Placa de inventario" value={form.assetTag} onChange={(value) => setField('assetTag', value)} />
            <Select
              label="Tipo"
              required
              value={form.type}
              onChange={(value) => setField('type', value)}
              options={Array.from(new Set([...(catalogs?.types ?? []), form.type].filter(Boolean))).map((type) => ({
                label: type,
                value: type,
              }))}
            />
            <Input label="Marca" value={form.brand} onChange={(value) => setField('brand', value)} />
            <Input label="Modelo" value={form.model} onChange={(value) => setField('model', value)} />
          </FieldGroup>

          <FieldGroup title="Red y hardware">
            <Input label="IP(s)" value={form.ipAddresses} onChange={(value) => setField('ipAddresses', value)} />
            <Input label="MAC" value={form.macAddress} onChange={(value) => setField('macAddress', value)} />
            <Input label="Procesador" value={form.processor} onChange={(value) => setField('processor', value)} />
            <Input label="Tipo almacenamiento" value={form.storageType} onChange={(value) => setField('storageType', value)} />
            <Input
              label="Capacidad GB"
              type="number"
              value={form.storageCapacityGb}
              onChange={(value) => setField('storageCapacityGb', value)}
            />
          </FieldGroup>

          <FieldGroup title="Estado y ubicacion">
            <Select
              label="Estado"
              value={form.status}
              onChange={(value) => setField('status', value)}
              options={statusOptions}
            />
            <Select
              label="Propiedad"
              value={form.ownershipType}
              onChange={(value) => setField('ownershipType', value as 'owned' | 'leased')}
              options={[
                { label: 'Propio', value: 'owned' },
                { label: 'Arrendado', value: 'leased' },
              ]}
            />
            <Select
              label="Sede"
              value={form.headquarterId}
              onChange={(value) => setField('headquarterId', value)}
              options={(catalogs?.headquarters ?? []).map((headquarter) => ({
                label: headquarter.name,
                value: headquarter.id,
              }))}
            />
            <Select
              label="Ubicacion"
              value={form.locationId}
              onChange={(value) => setField('locationId', value)}
              options={locationOptions}
            />
            <Select
              label="Responsable"
              value={form.currentResponsibleId}
              onChange={(value) => setField('currentResponsibleId', value)}
              options={(catalogs?.responsibles ?? []).map((responsible) => ({
                label: responsible.name,
                value: responsible.id,
              }))}
            />
            <Select
              label="Responsable 2"
              value={form.secondaryResponsibleId}
              onChange={(value) => setField('secondaryResponsibleId', value)}
              options={(catalogs?.responsibles ?? []).map((responsible) => ({
                label: responsible.name,
                value: responsible.id,
              }))}
            />
          </FieldGroup>

          <FieldGroup title="Garantia y arriendo">
            <Input label="Fecha compra" type="date" value={form.purchaseDate} onChange={(value) => setField('purchaseDate', value)} />
            <Input label="Garantia hasta" type="date" value={form.warrantyUntil} onChange={(value) => setField('warrantyUntil', value)} />
            <Input label="Proveedor leasing" value={form.leaseProvider} onChange={(value) => setField('leaseProvider', value)} />
            <Input
              label="Contrato leasing"
              value={form.leaseContractNumber}
              onChange={(value) => setField('leaseContractNumber', value)}
            />
            <Input label="Fin arriendo" type="date" value={form.leaseUntil} onChange={(value) => setField('leaseUntil', value)} />
          </FieldGroup>

          <div className="lg:col-span-2">
            <FieldGroup title="Notas">
              <Textarea label="Notas" value={form.notes} onChange={(value) => setField('notes', value)} />
            </FieldGroup>
          </div>
        </div>

        {submitState === 'error' && (
          <p className="mx-5 rounded-md border border-red-900 bg-red-950/30 px-3 py-2 text-sm text-red-200">
            No fue posible guardar el equipo. Revisa campos obligatorios o valores repetidos.
          </p>
        )}

        <div className="flex justify-end gap-3 border-t border-slate-800 px-5 py-4">
          <button
            className="rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
            type="button"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="rounded-md border border-cyan-700 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:border-cyan-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            disabled={submitState === 'submitting'}
            type="submit"
          >
            {submitState === 'submitting' ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  )
}

const statusOptions = [
  { label: 'Activo', value: 'active' },
  { label: 'Inactivo', value: 'inactive' },
  { label: 'En mantenimiento', value: 'in_maintenance' },
  { label: 'Danado', value: 'damaged' },
  { label: 'Retirado', value: 'retired' },
  { label: 'Perdido', value: 'lost' },
]

function FieldGroup({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      {children}
    </section>
  )
}

function Input({
  label,
  onChange,
  required,
  type = 'text',
  value,
}: {
  label: string
  onChange: (value: string) => void
  required?: boolean
  type?: string
  value: string
}) {
  if (type === 'date') {
    return <DateInput label={label} required={required} value={value} onChange={onChange} />
  }

  return (
    <label className="block text-sm">
      <span className="text-slate-500">{label}</span>
      <input
        className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 outline-none transition focus:border-cyan-500"
        required={required}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

function Select({
  label,
  onChange,
  options,
  required,
  value,
}: {
  label: string
  onChange: (value: string) => void
  options: Array<{ label: string; value: string }>
  required?: boolean
  value: string
}) {
  return (
    <label className="block text-sm">
      <span className="text-slate-500">{label}</span>
      <select
        className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 outline-none transition focus:border-cyan-500"
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Sin seleccionar</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function Textarea({
  label,
  onChange,
  value,
}: {
  label: string
  onChange: (value: string) => void
  value: string
}) {
  return (
    <label className="block text-sm">
      <span className="text-slate-500">{label}</span>
      <textarea
        className="mt-1 min-h-32 w-full resize-y rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 outline-none transition focus:border-cyan-500"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}
