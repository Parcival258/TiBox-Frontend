import type { Equipment } from '../../types/equipmentCore'
import { formatDate } from '@/shared/utils/dateFormat'
import { equipmentStatusLabel, ownershipTypeLabel } from '@/shared/utils/enumLabels'
import { Info, Section } from './LifeSheetFields'
import { formatStorageCapacity, valueOrEmpty } from './lifeSheetFormatters'

type LifeSheetEquipmentDetailsProps = {
  equipment: Equipment
}

export function LifeSheetEquipmentDetails({ equipment }: LifeSheetEquipmentDetailsProps) {
  return (
    <>
      <Section title="Identificacion">
        <Info label="Serial" value={equipment.serial} />
        <Info label="Placa de inventario" value={valueOrEmpty(equipment.assetTag)} />
        <Info label="Estado" value={equipmentStatusLabel(equipment.status)} />
        <Info label="Propiedad" value={ownershipTypeLabel(equipment.ownershipType)} />
      </Section>

      <Section title="Red y hardware">
        <Info label="IP(s)" value={valueOrEmpty(equipment.ipAddresses)} />
        <Info label="MAC" value={valueOrEmpty(equipment.macAddress)} />
        <Info label="Procesador" value={valueOrEmpty(equipment.processor)} />
        <Info label="Almacenamiento" value={valueOrEmpty(equipment.storageType)} />
        <Info label="Capacidad" value={formatStorageCapacity(equipment.storageCapacityGb)} />
      </Section>

      <Section title="Ubicacion y responsables">
        <Info label="Sede" value={valueOrEmpty(equipment.headquarter?.name)} />
        <Info
          label="Ubicacion"
          value={
            [equipment.location?.floor, equipment.location?.area, equipment.location?.office]
              .filter(Boolean)
              .join(' / ') || 'Sin dato'
          }
        />
        <Info label="Responsable" value={valueOrEmpty(equipment.currentResponsible?.name)} />
        <Info label="Responsable 2" value={valueOrEmpty(equipment.secondaryResponsible?.name)} />
      </Section>

      <Section title="Garantia y arriendo">
        <Info label="Compra" value={formatDate(equipment.purchaseDate)} />
        <Info label="Garantia" value={formatDate(equipment.warrantyUntil)} />
        <Info label="Proveedor" value={valueOrEmpty(equipment.leaseProvider)} />
        <Info label="Contrato" value={valueOrEmpty(equipment.leaseContractNumber)} />
        <Info label="Fin arriendo" value={formatDate(equipment.leaseUntil)} />
      </Section>
    </>
  )
}
