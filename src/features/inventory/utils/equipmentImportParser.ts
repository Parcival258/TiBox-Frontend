import type { EquipmentCatalogs } from '../types/equipmentCatalogs'
import type { EquipmentPayload } from '../types/equipmentCore'
import { normalizeImportValue, optional, optionalDate } from './equipmentImportFormat'
import { readImportRows } from './equipmentImportFileReaders'
import {
  findImportHeadquarterId,
  findImportLocationId,
  findImportLocationIdByParts,
  findImportResponsibleId,
} from './equipmentImportCatalogLookup'
import {
  mapImportNumber,
  mapImportOwnership,
  mapImportStatus,
} from './equipmentImportMappers'
import type { EquipmentImportRow } from './equipmentImportTypes'

export async function readEquipmentImportFile(file: File, catalogs: EquipmentCatalogs | null) {
  const rows = await readImportRows(file)
  const [headers, ...dataRows] = rows
  const errors: string[] = []

  if (!headers || headers.length === 0) {
    return { errors: ['El archivo no tiene encabezados.'], rows: [] }
  }

  const headerIndex = new Map(headers.map((header, index) => [normalizeImportValue(header), index]))
  const mappedRows = dataRows
    .map((row, index) => ({ row, rowNumber: index + 2 }))
    .filter(({ row }) => row.some((cell) => cell.trim()))
    .map(({ row, rowNumber }) => {
      const payload = rowToPayload(row, headerIndex, catalogs, rowNumber, errors)

      return payload ? { payload, rowNumber } : null
    })
    .filter((row): row is EquipmentImportRow => Boolean(row))

  return {
    errors,
    rows: mappedRows,
  }
}

function rowToPayload(
  row: string[],
  headerIndex: Map<string, number>,
  catalogs: EquipmentCatalogs | null,
  rowNumber: number,
  errors: string[]
) {
  const get = (header: string) => row[headerIndex.get(header) ?? -1]?.trim() ?? ''
  const internalCode = get('codigo')
  const serial = get('serial')
  const type = get('tipo')
  const rowErrors: string[] = []

  if (!internalCode || !serial || !type) {
    errors.push(`Fila ${rowNumber}: codigo, serial y tipo son obligatorios.`)
    return null
  }

  const ownershipType = mapImportOwnership(get('propiedad'), rowNumber, rowErrors)
  const storageCapacityGb = mapImportNumber(get('almacenamiento_gb'), rowNumber, rowErrors)
  const status = mapImportStatus(get('estado'), rowNumber, rowErrors)
  const headquarterId = findImportHeadquarterId(get('sede'), catalogs)
  const locationId =
    findImportLocationIdByParts(
      {
        area: get('area'),
        floor: get('piso'),
        office: get('oficina'),
      },
      headquarterId,
      catalogs
    ) ?? findImportLocationId(get('ubicacion'), headquarterId, catalogs)
  const currentResponsibleId = findImportResponsibleId(get('responsable'), catalogs)
  const secondaryResponsibleId = findImportResponsibleId(get('responsable_secundario'), catalogs)

  if (get('sede') && !headquarterId) {
    rowErrors.push(`Fila ${rowNumber}: sede no encontrada (${get('sede')}).`)
  }

  if ((get('piso') || get('area') || get('oficina') || get('ubicacion')) && !locationId) {
    rowErrors.push(
      `Fila ${rowNumber}: ubicacion no encontrada (${[get('piso'), get('area'), get('oficina')]
        .filter(Boolean)
        .join(' / ') || get('ubicacion')}).`
    )
  }

  if (get('responsable') && !currentResponsibleId) {
    rowErrors.push(`Fila ${rowNumber}: responsable no encontrado (${get('responsable')}).`)
  }

  if (get('responsable_secundario') && !secondaryResponsibleId) {
    rowErrors.push(`Fila ${rowNumber}: responsable secundario no encontrado (${get('responsable_secundario')}).`)
  }

  if (rowErrors.length > 0) {
    errors.push(...rowErrors)
    return null
  }

  const payload: EquipmentPayload = {
    internalCode,
    serial,
    type,
    assetTag: optional(get('placa_inventario')),
    brand: optional(get('marca')),
    currentResponsibleId,
    headquarterId,
    ipAddresses: optional(get('ip')),
    leaseContractNumber: optional(get('contrato_arriendo')),
    leaseProvider: optional(get('proveedor_arriendo')),
    leaseUntil: optionalDate(get('fin_arriendo')),
    locationId,
    macAddress: optional(get('mac')),
    model: optional(get('modelo')),
    notes: optional(get('notas')),
    ownershipType,
    processor: optional(get('procesador')),
    purchaseDate: optionalDate(get('fecha_compra')),
    secondaryResponsibleId,
    status,
    storageCapacityGb,
    storageType: optional(get('almacenamiento_tipo')),
    warrantyUntil: optionalDate(get('garantia_hasta')),
  }

  return payload
}
