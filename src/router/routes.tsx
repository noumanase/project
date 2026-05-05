// ─────────────────────────────────────────────────────────────────────────────
// router/routes.tsx
//
// Dynamic router route definitions assembled from the module registry.
// Keeping route JSX here allows index.tsx to stay as a pure router factory.
// ─────────────────────────────────────────────────────────────────────────────

import { Navigate } from "react-router-dom";
import { RequireAuth } from "./guards/RequireAuth";
import { RequireRole } from "./guards/RequireRole";
import { getAllModuleRoutes } from "@lib/moduleRegistry";
import { AppLayout } from "@shared/components/AppLayout";
import type { Role } from "@shared/types";
import { lazy, Suspense } from "react";
import { RouteErrorBoundary } from "@shared/components";

const ForbiddenPage = lazy(() => import("@pages/ForbiddenPage"));
const NotFoundPage = lazy(() => import("@pages/NotFoundPage"));

const PageLoader = () => (
  <div className="flex items-center justify-center h-full py-20">
    <div className="w-8 h-8 border-4 rounded-full animate-spin border-brand-500 border-t-transparent" />
  </div>
);

const withSuspense = (LazyComponent: React.ComponentType) => (
  <Suspense fallback={<PageLoader />}>
    <LazyComponent />
  </Suspense>
);

const allRoutes = getAllModuleRoutes();

const hasRestrictedRoles = (
  route: (typeof allRoutes)[number],
): route is (typeof allRoutes)[number] & { roles: Role[] } =>
  Array.isArray(route.roles) && route.roles.length > 0;

// Public routes - anyone can access (including non-logged-in users)
const publicRoutes = allRoutes
  .filter((r) => r.roles === null)
  .map((r) => ({
    path: r.path,
    element: withSuspense(lazy(r.lazy)),
  }));

// Private routes - any authenticated user can access (no role restrictions)
const privateRoutes = allRoutes
  .filter((r) => r.roles === undefined)
  .map((r) => ({
    path: r.path,
    element: withSuspense(lazy(r.lazy)),
  }));

// Role-based routes - only specific roles can access
const restrictedRoutes = allRoutes.filter(hasRestrictedRoles);

const roleGroupMap = new Map<
  string,
  { roles: Role[]; paths: typeof restrictedRoutes }
>();
for (const route of restrictedRoutes) {
  const key = [...route.roles].sort().join(",");
  if (!roleGroupMap.has(key)) {
    roleGroupMap.set(key, { roles: route.roles, paths: [] });
  }
  const group = roleGroupMap.get(key);
  if (group) {
    group.paths.push(route);
  }
}

const roleGroupRoutes = [...roleGroupMap.values()].map(({ roles, paths }) => ({
  element: <RequireRole roles={roles} />,
  children: paths.map((r) => ({
    path: r.path,
    element: withSuspense(lazy(r.lazy)),
  })),
}));

export const appRoutes = [
  {
    errorElement: <RouteErrorBoundary />, // Catches errors in any child route and displays a fallback UI
    children: [
      { path: "/", element: <Navigate to="/dashboard" replace /> },
      ...publicRoutes,
      {
        element: <RequireAuth />,
        children: [
          {
            element: <AppLayout />,
            children: [...privateRoutes, ...roleGroupRoutes],
          },
        ],
      },
      { path: "/403", element: withSuspense(ForbiddenPage) },
      { path: "*", element: withSuspense(NotFoundPage) },
    ],
  },
];
