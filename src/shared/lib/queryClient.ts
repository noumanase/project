// ─────────────────────────────────────────────────────────────────────────────
// shared/lib/queryClient.ts
//
// Single QueryClient instance for the entire app.
// Configure defaults here so every query/mutation gets sensible behaviour
// without repeating options at each call site.
// ─────────────────────────────────────────────────────────────────────────────

import { QueryClient } from "@tanstack/react-query";

const hasStatusCode = (error: unknown): error is { statusCode: number } => {
  if (!error || typeof error !== "object") return false;
  return (
    "statusCode" in error &&
    typeof (error as { statusCode?: unknown }).statusCode === "number"
  );
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // ── Stale time ────────────────────────────────────────────────────────
      // Data is considered fresh for 60s. During this window, no background
      // refetch happens even if the component remounts or the window refocuses.
      // Override per-query for data that changes more/less frequently.
      staleTime: 60 * 1000,

      // ── Cache time (gcTime) ───────────────────────────────────────────────
      // Unused query data stays in cache for 5 minutes after last subscriber
      // unmounts. Navigating back = instant data while revalidation happens.
      gcTime: 5 * 60 * 1000,

      // ── Retry ─────────────────────────────────────────────────────────────
      // Retry failed requests twice, but never retry 401/403/404 — those are
      // definitive answers, not transient failures.
      retry: (failureCount, error) => {
        const noRetryStatuses = [401, 403, 404];
        if (hasStatusCode(error) && noRetryStatuses.includes(error.statusCode))
          return false;
        return failureCount < 2;
      },

      // ── Refetch on window focus ────────────────────────────────────────────
      // true = revalidates stale data when user tabs back into the app.
      // Great for dashboards where data changes while user is away.
      refetchOnWindowFocus: true,
    },

    mutations: {
      // Mutations don't retry by default — a failed write should not
      // silently repeat (could cause duplicate records, double payments, etc.)
      retry: false,
    },
  },
});
