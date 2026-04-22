// pages/DataTablePage.tsx
//
// Page-level component for the data table.
// Suspense wraps DataTable because it uses useSuspenseQuery —
// the table is guaranteed to have data when it renders (no isLoading checks).
// ErrorBoundary catches query errors at the page level.

import { Suspense } from 'react'
import { DataTable, FilterBar } from '@features/data-table'

const DataTablePage = () => (
  <div className="flex flex-col gap-4">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Records</h1>
      <p className="mt-1 text-sm text-gray-500">Manage and filter all records.</p>
    </div>

    {/* Filters are outside Suspense — they render instantly */}
    <FilterBar />

    {/* DataTable suspends while data loads */}
    <Suspense fallback={<TableSkeleton />}>
      <DataTable />
    </Suspense>
  </div>
)

// Skeleton shown while first data load happens
const TableSkeleton = () => (
  <div className="flex flex-col gap-2 animate-pulse">
    <div className="h-10 w-full rounded-lg bg-gray-200" />
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="h-12 w-full rounded-lg bg-gray-100" />
    ))}
  </div>
)

export default DataTablePage
