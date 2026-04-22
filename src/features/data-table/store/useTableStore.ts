// ─────────────────────────────────────────────────────────────────────────────
// features/data-table/store/useTableStore.ts
//
// Owns: filter values, sort config, pagination for the data table.
// This is CLIENT state — the user's current filter selections.
//
// The RESULTS of these filters are server data — owned by TanStack Query.
// This store's values are passed into the queryKey so TQ refetches
// automatically whenever filters change.
//
// We use Zustand here (not URL params) for this example, but if your table
// filters need to be shareable/bookmarkable, switch to useSearchParams instead.
// ─────────────────────────────────────────────────────────────────────────────

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { TableFilters } from '../types'

interface TableState extends TableFilters {
  // Actions
  setSearch: (search: string) => void
  setRole: (role: string) => void
  setPage: (page: number) => void
  setPerPage: (perPage: number) => void
  setSortBy: (sortBy: string, sortOrder: 'asc' | 'desc') => void
  resetFilters: () => void
}

const defaultFilters: TableFilters = {
  search: '',
  role: '',
  page: 1,
  perPage: 20,
  sortBy: 'name',
  sortOrder: 'asc',
}

export const useTableStore = create<TableState>()(
  devtools(
    (set) => ({
      ...defaultFilters,

      setSearch: (search) =>
        // Reset to page 1 when search changes — standard UX
        { set({ search, page: 1 }, false, 'table/setSearch'); },

      setRole: (role) =>
        { set({ role, page: 1 }, false, 'table/setRole'); },

      setPage: (page) =>
        { set({ page }, false, 'table/setPage'); },

      setPerPage: (perPage) =>
        { set({ perPage, page: 1 }, false, 'table/setPerPage'); },

      setSortBy: (sortBy, sortOrder) =>
        { set({ sortBy, sortOrder, page: 1 }, false, 'table/setSortBy'); },

      resetFilters: () =>
        { set(defaultFilters, false, 'table/resetFilters'); },
    }),
    { name: 'TableStore' },
  ),
)
