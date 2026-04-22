// ─────────────────────────────────────────────────────────────────────────────
// src/lib/moduleRegistry.ts
//
// THE PLUG-AND-PLAY SYSTEM
//
// This is the heart of the project's extensibility.
// Adding a new feature/module to the app requires exactly ONE step:
// register it here. Everything else (routes, nav, permissions) is automatic.
//
// A module is a self-contained feature that declares:
//   - Its routes (with RBAC roles)
//   - Its nav item (optional — some modules have no nav entry)
//   - Its initializer (optional — runs once on app boot, e.g. start a socket)
//   - Any metadata the shell needs to know about it
//
// HOW TO ADD A NEW MODULE:
//   1. Create src/features/my-feature/ with its own components/hooks/api/store
//   2. Export a ModuleConfig from features/my-feature/module.ts
//   3. Import and add it to the MODULES array below
//   That's it. Routes and nav appear automatically.
// ─────────────────────────────────────────────────────────────────────────────

import type { Role } from "@shared/types";

// ── Module contract ───────────────────────────────────────────────────────────

export interface NavItem {
  label: string;
  path: string;
  icon: string; // emoji or component key — up to you
  order: number; // controls sort order in sidebar
}

export interface ModuleRoute {
  path: string;
  // lazy: () => Promise<{ default: ComponentType }> — standard React lazy
  lazy: () => Promise<{ default: React.ComponentType }>;
  roles?: Role[] | null; // null = public, undefined = any authenticated user
}

export interface ModuleConfig {
  id: string; // unique, slug-style: 'data-table', 'analytics'
  navItem?: NavItem; // omit for modules with no sidebar entry
  routes: ModuleRoute[];
  // Called once when the app boots (after auth hydration).
  // Use for: starting WebSocket connections, loading feature flags, etc.
  initialize?: (context: ModuleContext) => void | Promise<void>;
}

export interface ModuleContext {
  // Add anything modules might need at init time:
  // e.g. user role, feature flags, store references
  userRole: Role | null;
}

// ── Module imports ─────────────────────────────────────────────────────────────
// This is the ONLY place you touch when adding a new module.
// Import each module's config and add it to the array.

import { authModule } from "@features/auth/module";
import { dashboardModule } from "@features/dashboard/module";
import { dataTableModule } from "@features/data-table/module";
import { settingsModule } from "@features/settings/module";

// ┌─────────────────────────────────────────────────────────────────────────┐
// │  ADD NEW MODULES HERE                                                   │
// │  e.g. import { analyticsModule } from '@features/analytics/module'     │
// └─────────────────────────────────────────────────────────────────────────┘

export const MODULES: ModuleConfig[] = [
  authModule,
  dashboardModule,
  dataTableModule,
  settingsModule,
  // analyticsModule,   ← uncomment when you create features/analytics/module.ts
];

// ── Derived helpers (used by router and sidebar) ──────────────────────────────

/** All nav items sorted by order — used to build the sidebar */
export const getNavItems = (): (NavItem & {
  roles: Role[] | null | undefined;
})[] =>
  MODULES.flatMap((m) => {
    const navItem = m.navItem;
    if (!navItem) return [];

    return [
      {
        ...navItem,
        // Roles for the nav item = roles of the first route with this path
        roles: m.routes.find((r) => r.path === navItem.path)?.roles,
      },
    ];
  }).sort((a, b) => a.order - b.order);

/** All route configs from all modules — consumed by the dynamic router */
export const getAllModuleRoutes = (): ModuleRoute[] =>
  MODULES.flatMap((m) => m.routes);

/** Run all module initializers (called once in App.tsx after auth hydrates) */
export const initializeModules = async (
  context: ModuleContext,
): Promise<void> => {
  const initializers = MODULES.flatMap((m) =>
    m.initialize ? [m.initialize] : [],
  );

  await Promise.all(
    initializers.map((initialize) => Promise.resolve(initialize(context))),
  );
};
