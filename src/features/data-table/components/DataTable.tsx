// features/data-table/components/DataTable.tsx
//
// Main table component. Uses:
//   - useTableData() for rows + pagination
//   - usePermission() for role-gated action buttons
//   - useTableStore for sort/page actions
//
// Wrapped in Suspense by its parent page — this component always has data.

import { useTableData } from '../hooks/useTableData'
import { useTableStore } from '../store/useTableStore'
import { usePermission } from '@shared/hooks'
import { cn } from '@shared/lib'

const toDisplayText = (value: unknown): string => {
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return ''
}

export const DataTable = () => {
  const { rows, meta, isFetching, isPlaceholderData } = useTableData()
  const setPage   = useTableStore((s) => s.setPage)
  const page      = useTableStore((s) => s.page)
  const setSortBy = useTableStore((s) => s.setSortBy)
  const sortBy    = useTableStore((s) => s.sortBy)
  const sortOrder = useTableStore((s) => s.sortOrder)

  // RBAC — hide actions the current user can't perform
  const canEdit   = usePermission(['admin', 'manager'])
  const canDelete = usePermission(['admin'])

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortBy(column, sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column, 'asc')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Subtle loading indicator for background refetches */}
      {isFetching && !isPlaceholderData && (
        <div className="h-0.5 w-full animate-pulse rounded bg-brand-500" />
      )}

      <div className={cn('overflow-x-auto rounded-lg border', isPlaceholderData && 'opacity-60')}>
        <table className="w-full text-sm">
          <thead className="text-xs font-semibold tracking-wider text-left text-gray-500 uppercase bg-gray-50">
            <tr>
              {/* Sortable column header */}
              <SortableHeader column="name" label="Name" current={sortBy} order={sortOrder} onSort={handleSort} />
              <SortableHeader column="email" label="Email" current={sortBy} order={sortOrder} onSort={handleSort} />
              <SortableHeader column="role" label="Role" current={sortBy} order={sortOrder} onSort={handleSort} />
              {/* Only render actions column if user can do at least one action */}
              {(canEdit || canDelete) && (
                <th className="px-4 py-3">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row) => (
              <tr key={row.id} className="transition-colors hover:bg-gray-50">
                <td className="px-4 py-3">{toDisplayText(row.name)}</td>
                <td className="px-4 py-3 text-gray-500">{toDisplayText(row.email)}</td>
                <td className="px-4 py-3">
                  <RoleBadge role={toDisplayText(row.role)} />
                </td>
                {(canEdit || canDelete) && (
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {canEdit && (
                        <button className="text-xs font-medium text-brand-500 hover:text-brand-600">
                          Edit
                        </button>
                      )}
                      {canDelete && (
                        <button className="text-xs font-medium text-red-500 hover:text-red-600">
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          Showing {(page - 1) * meta.perPage + 1}–{Math.min(page * meta.perPage, meta.total)} of {meta.total}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setPage(page - 1); }}
            disabled={page <= 1}
            className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-50"
          >
            Previous
          </button>
          <span>{page} / {meta.totalPages}</span>
          <button
            onClick={() => { setPage(page + 1); }}
            disabled={page >= meta.totalPages}
            className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface SortableHeaderProps {
  column: string
  label: string
  current: string
  order: 'asc' | 'desc'
  onSort: (col: string) => void
}

const SortableHeader = ({ column, label, current, order, onSort }: SortableHeaderProps) => {
  const isActive = current === column
  return (
    <th
      className="px-4 py-3 cursor-pointer select-none hover:text-gray-700"
      onClick={() => { onSort(column); }}
    >
      <span className="flex items-center gap-1">
        {label}
        {isActive ? (order === 'asc' ? ' ↑' : ' ↓') : ' ↕'}
      </span>
    </th>
  )
}

const roleBadgeStyles: Record<string, string> = {
  admin:   'bg-purple-100 text-purple-700',
  manager: 'bg-blue-100 text-blue-700',
  viewer:  'bg-gray-100 text-gray-600',
}

const RoleBadge = ({ role }: { role: string }) => (
  <span className={cn(
    'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize',
    roleBadgeStyles[role] ?? 'bg-gray-100 text-gray-600',
  )}>
    {role}
  </span>
)
