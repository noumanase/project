// ─────────────────────────────────────────────────────────────────────────────
// features/data-table/hooks/useTableData.ts
//
// Combines filter state (Zustand) with server data fetching (TanStack Query).
// Components call this one hook — they don't touch the store or query directly.
//
// Pattern: debounce the search input so we don't fire a request on every
// keystroke, but react instantly to page/sort/role changes.
// ─────────────────────────────────────────────────────────────────────────────

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTableStore } from "../store/useTableStore";
import { tableRowsQueryOptions } from "../api/tableApi";
import { useDebounce } from "@shared/hooks";

export function useTableData() {
  const filters = useTableStore((s) => ({
    search: s.search,
    role: s.role,
    page: s.page,
    perPage: s.perPage,
    sortBy: s.sortBy,
    sortOrder: s.sortOrder,
  }));

  // Debounce only the search — all other filter changes should be immediate
  const debouncedSearch = useDebounce(filters.search, 400);

  const debouncedFilters = { ...filters, search: debouncedSearch };

  // useSuspenseQuery (v5) — data is NEVER undefined at the type level.
  // The parent component must wrap this in a <Suspense> boundary.
  const { data, isFetching } = useSuspenseQuery(
    tableRowsQueryOptions(debouncedFilters),
  );

  return {
    rows: data.data,
    meta: data.meta,
    // isFetching = background refetch in progress (useful for showing a subtle spinner)
    // Suspense query result does not expose isPlaceholderData in this version.
    // Keep API stable for components that already consume this field.
    isFetching,
    isPlaceholderData: false,
  };
}
