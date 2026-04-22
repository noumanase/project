// ─────────────────────────────────────────────────────────────────────────────
// shared/hooks/usePermission.ts
//
// The single hook that drives ALL permission checks in the app.
// Used by: router guards, UI components, sidebar filters.
//
// Usage:
//   const canDelete = usePermission(['admin'])
//   const canEdit   = usePermission(['admin', 'manager'])
//
// Returns false if no user is logged in (safe default — deny, not allow).
// ─────────────────────────────────────────────────────────────────────────────

import { useAuthStore } from "@shared/stores";
import type { Role } from "@shared/types";

export function usePermission(allowedRoles: Role[]): boolean {
  // Fine-grained selector — only re-renders if user object changes
  const user = useAuthStore((s) => s.user);
  if (!user) return false;
  return allowedRoles.includes(user.role);
}
