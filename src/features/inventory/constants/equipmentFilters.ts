import type { EquipmentFilters } from '@/shared/types/inventory'

export const defaultEquipmentFilters: EquipmentFilters = {
  orderBy: 'createdAt',
  orderDirection: 'desc',
  page: 1,
  perPage: 10,
}
