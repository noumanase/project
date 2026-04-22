// features/data-table/components/FilterBar.tsx
//
// Filter controls for the table. Writes to useTableStore.
// Does NOT call any API — that's handled by useTableData via the store.

import { useTableStore } from '../store/useTableStore'
import { cn } from '@shared/lib'

export const FilterBar = () => {
  const search    = useTableStore((s) => s.search)
  const role      = useTableStore((s) => s.role)
  const setSearch = useTableStore((s) => s.setSearch)
  const setRole   = useTableStore((s) => s.setRole)
  const reset     = useTableStore((s) => s.resetFilters)

  const hasActiveFilters = search !== '' || role !== ''

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search — debounced in useTableData, so we update on every keystroke */}
      <input
        type="search"
        value={search}
        onChange={(e) => { setSearch(e.target.value); }}
        placeholder="Search…"
        className={cn(
          'w-64 rounded-md border px-3 py-1.5 text-sm',
          'focus:outline-none focus:ring-2 focus:ring-brand-500',
        )}
      />

      {/* Role filter */}
      <select
        value={role}
        onChange={(e) => { setRole(e.target.value); }}
        className={cn(
          'rounded-md border px-3 py-1.5 text-sm',
          'focus:outline-none focus:ring-2 focus:ring-brand-500',
        )}
      >
        <option value="">All roles</option>
        <option value="admin">Admin</option>
        <option value="manager">Manager</option>
        <option value="viewer">Viewer</option>
      </select>

      {/* Reset — only shown when filters are active */}
      {hasActiveFilters && (
        <button
          onClick={reset}
          className="text-sm text-gray-500 underline hover:text-gray-700"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}
