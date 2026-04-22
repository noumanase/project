// features/data-table/module.ts
import type { ModuleConfig } from '@lib/moduleRegistry'

export const dataTableModule: ModuleConfig = {
  id: 'data-table',
  navItem: {
    label: 'Records',
    path: '/data-table',
    icon: '▤',
    order: 2,
  },
  routes: [
    {
      path: '/data-table',
      lazy: () => import('@pages/DataTablePage'),
      roles: ['admin', 'manager'],
    },
  ],
  // Example: prefetch the first page of data when the module initializes
  // so the table is instant when the user first navigates to it.
  initialize: async (_context) => {
    // You can prefetch queries, load feature flags, etc. here.
    // The queryClient is available via import if needed:
    // import { queryClient } from '@shared/lib'
    // await queryClient.prefetchQuery(tableRowsQueryOptions(defaultFilters))
  },
}
