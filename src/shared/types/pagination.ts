export type PaginationMeta = {
  total: number
  perPage: number
  currentPage: number
  lastPage: number
}

export type PaginatedResponse<T> = {
  meta: PaginationMeta
  data: T[]
}
