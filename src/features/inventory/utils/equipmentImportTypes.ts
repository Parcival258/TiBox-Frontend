import type { EquipmentPayload } from '../types/equipmentCore'

export type EquipmentImportResult = {
  created: number
  errors: string[]
  total: number
}

export type EquipmentImportRow = {
  payload: EquipmentPayload
  rowNumber: number
}

export const equipmentImportTemplateHeaders = [
  'codigo',
  'serial',
  'tipo',
  'placa_inventario',
  'marca',
  'modelo',
  'estado',
  'propiedad',
  'sede',
  'piso',
  'area',
  'oficina',
  'responsable',
  'responsable_secundario',
  'ip',
  'mac',
  'procesador',
  'almacenamiento_tipo',
  'almacenamiento_gb',
  'fecha_compra',
  'garantia_hasta',
  'proveedor_arriendo',
  'contrato_arriendo',
  'fin_arriendo',
  'notas',
]
