// ─────────────────────────────────────────────────────────────────────────────
// features/data-table/api/tableApi.ts
//
// API calls + queryOptions for the data table.
//
// queryOptions (TanStack Query v5) is the idiomatic way to define queries.
// It makes query definitions type-safe and reusable between:
//   - useQuery / useSuspenseQuery in components
//   - queryClient.prefetchQuery in loaders
//   - queryClient.getQueryData for reading cache imperatively
//
// The queryKey ALWAYS includes filters — TanStack Query refetches
// automatically when filters change. Never manually trigger refetches.
// ─────────────────────────────────────────────────────────────────────────────

import { queryOptions } from "@tanstack/react-query";
import { apiClient } from "@shared/api";
import type { PaginatedResponse } from "@shared/types";
import type { TableFilters, TableRow } from "../types";

// Raw API call — just fetches, returns data
const fetchTableRows = async (
  filters: TableFilters,
): Promise<PaginatedResponse<TableRow>> => {
  const { data } = await apiClient.get<PaginatedResponse<TableRow>>(
    "/records",
    {
      params: {
        page: filters.page,
        perPage: filters.perPage,
        search: filters.search || undefined, // omit empty strings
        role: filters.role || undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      },
    },
  );
  return data;
};

// queryOptions — the TanStack Query v5 way to share query definitions
// Import this anywhere you need to work with table data
export const tableRowsQueryOptions = (filters: TableFilters) =>
  queryOptions({
    queryKey: ["table-rows", filters] as const,
    // ↑ filters is part of the key — any filter change = automatic refetch
    queryFn: () => fetchTableRows(filters),
    // Keep previous data visible while new page/filter results load
    // (replaces the old keepPreviousData option from v4)
    placeholderData: (previousData) => previousData,
    staleTime: 30 * 1000, // table data goes stale faster than other resources,
  });
