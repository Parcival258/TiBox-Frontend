import type { EquipmentFilters } from '../types/equipmentCore'

export const defaultEquipmentFilters: EquipmentFilters = {
  orderBy: 'createdAt',
  orderDirection: 'desc',
  page: 1,
  perPage: 10,
}
