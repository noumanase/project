// features/data-table/types.ts
// All types scoped to the data-table feature.
// Shared/global types come from @shared/types — don't redefine them here.

export interface TableFilters {
  search: string
  role: string
  page: number
  perPage: number
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

export interface TableRow {
  id: string
  [key: string]: unknown
}
