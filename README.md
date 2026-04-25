## Developer Guide to the Project
How to Add Modules, Register Routes, Enforce Roles, Handle Data Fetching, and Navigate the Codebase.

### Tech Stack
- Frontend Framework: React 19 + React DOM
- Language: TypeScript
- Build Tool: Vite 8
- Routing: React Router v7
- Data Fetching & Caching: TanStack Query v5
- HTTP Client: Axios
- State Management: Zustand
- Forms & Validation: React Hook Form + Zod
- Styling: Tailwind CSS + PostCSS + Autoprefixer
- Utility Libraries: clsx + tailwind-merge
- Code Quality: ESLint + TypeScript ESLint

#

<details>
<summary><strong>How to Add a New Module</strong></summary>


This project uses a plug-and-play module system. Adding a new feature involves
**one structural step** and a few files. Nothing in the core shell (router,
sidebar, layout) ever needs to change.

---
### TLDR
Adding your next feature in 4 steps
1. mkdir src/features/analytics/{components,hooks,api,store}
2. write src/features/analytics/module.ts
3. write src/pages/AnalyticsPage.tsx
4. add analyticsModule to MODULES[] in src/lib/moduleRegistry.ts

---

## The 5-step checklist (detailed)

### 1. Create the feature folder

```
src/features/my-feature/
  components/    ← UI only, no business logic
  hooks/         ← logic only, no JSX
  api/           ← TanStack Query queryOptions + raw fetch functions
  store/         ← Zustand slice (only if this feature has local client state)
  types.ts       ← types scoped to this feature
  module.ts      ← plug-and-play descriptor (routes, nav, init)
  index.ts       ← public barrel — only export what pages/other modules need
```

### 2. Write `module.ts`

This is the only file the core system reads. It declares everything the shell
needs to know about your feature.

```ts
// src/features/my-feature/module.ts
import type { ModuleConfig } from '@lib/moduleRegistry'

export const myFeatureModule: ModuleConfig = {
  id: 'my-feature',

  // Optional — omit if this feature has no sidebar link
  navItem: {
    label: 'My Feature',
    path: '/my-feature',
    icon: '★',
    order: 5,           // controls sidebar position
  },

  routes: [
    {
      path: '/my-feature',
      lazy: () => import('@pages/MyFeaturePage'),
      // roles convention:
      //   null      → public (no login required)
      //   undefined → any authenticated user
      //   ['admin'] → restricted to listed roles
      roles: ['admin', 'manager'],
    },
    // Multiple routes are fine — settings module does this
    {
      path: '/my-feature/:id',
      lazy: () => import('@pages/MyFeatureDetailPage'),
      roles: ['admin', 'manager'],
    },
  ],

  // Optional — runs once on app boot after auth hydrates.
  // Good for: prefetching data, connecting sockets, loading feature flags.
  initialize: async ({ userRole }) => {
    if (userRole === 'admin') {
      // e.g. await queryClient.prefetchQuery(myFeatureQueryOptions())
    }
  },
}
```

### 3. Create the page component(s)

```tsx
// src/pages/MyFeaturePage.tsx
// Keep pages thin — they just compose feature components.
import { Suspense } from 'react'
import { MyFeatureTable } from '@features/my-feature'

const MyFeaturePage = () => (
  <div>
    <h1 className="text-2xl font-bold text-gray-900">My Feature</h1>
    <Suspense fallback={<div>Loading...</div>}>
      <MyFeatureTable />
    </Suspense>
  </div>
)

export default MyFeaturePage
```

### 4. Register in the module registry

Open **`src/lib/moduleRegistry.ts`** and add two lines:

```ts
// Add the import at the top
import { myFeatureModule } from '@features/my-feature/module'

// Add to the MODULES array
export const MODULES: ModuleConfig[] = [
  authModule,
  dashboardModule,
  dataTableModule,
  settingsModule,
  myFeatureModule,   // ← add here
]
```

That's it. **The router and sidebar update automatically.**

### 5. Export from the feature index

```ts
// src/features/my-feature/index.ts
// Only export what pages and other consumers need.
// Internal helpers stay private.
export { MyFeatureTable } from './components/MyFeatureTable'
export { useMyFeatureData } from './hooks/useMyFeatureData'
```

---

## What you never need to change when adding a module

| File | Why it never changes |
|---|---|
| `src/router/index.tsx` | Reads routes from registry automatically |
| `src/shared/components/Sidebar.tsx` | Reads navItems from registry automatically |
| `src/App.tsx` | Runs `initializeModules()` which picks up new init hooks |
| Any existing feature | Modules are isolated — they can't import each other |

---

## Internal structure conventions for a new feature

### API file pattern

```ts
// features/my-feature/api/myFeatureApi.ts
import { queryOptions } from '@tanstack/react-query'
import { apiClient } from '@shared/api'
import type { MyItem } from '../types'

// 1. Raw fetch function
const fetchMyItems = async (filters: MyFilters) => {
  const { data } = await apiClient.get<PaginatedResponse<MyItem>>('/my-items', {
    params: filters,
  })
  return data
}

// 2. queryOptions — reusable, type-safe query definition
export const myItemsQueryOptions = (filters: MyFilters) =>
  queryOptions({
    queryKey: ['my-items', filters] as const,
    queryFn: () => fetchMyItems(filters),
    staleTime: 60_000,
  })
```

### Hook pattern

```ts
// features/my-feature/hooks/useMyFeatureData.ts
// Logic lives here, not in components.
import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { myItemsQueryOptions } from '../api/myFeatureApi'

export function useMyFeatureData(filters: MyFilters) {
  const queryClient = useQueryClient()
  const { data, isFetching } = useSuspenseQuery(myItemsQueryOptions(filters))

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/my-items/${id}`),
    onSuccess: () => {
      // Invalidate = TanStack Query refetches automatically
      void queryClient.invalidateQueries({ queryKey: ['my-items'] })
    },
  })

  return { items: data.data, meta: data.meta, isFetching, deleteMutation }
}
```

### Store pattern (only if needed)

```ts
// features/my-feature/store/useMyFeatureStore.ts
// Only create a store if this feature has CLIENT state (filters, selections, etc.)
// If all state is server data, skip this file — TanStack Query is enough.
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface MyFeatureState {
  selectedIds: string[]
  toggleSelect: (id: string) => void
  clearSelection: () => void
}

export const useMyFeatureStore = create<MyFeatureState>()(
  devtools(
    (set) => ({
      selectedIds: [],
      toggleSelect: (id) =>
        set((s) => ({
          selectedIds: s.selectedIds.includes(id)
            ? s.selectedIds.filter((x) => x !== id)
            : [...s.selectedIds, id],
        }), false, 'myFeature/toggleSelect'),
      clearSelection: () =>
        set({ selectedIds: [] }, false, 'myFeature/clearSelection'),
    }),
    { name: 'MyFeatureStore' },
  ),
)
```

---

## The golden import rule (enforced by ESLint)

```
features/my-feature  →  can import from  shared/
features/my-feature  →  CANNOT import from  features/anything-else
shared/              →  CANNOT import from  features/
pages/               →  can import from  features/ and shared/
```

If you find yourself wanting to import from another feature, the code belongs
in `shared/` instead. ESLint will catch violations before they reach CI.

---

## Checklist for code review

When reviewing a new module PR, verify:

- [ ] `module.ts` exists and is registered in `moduleRegistry.ts`
- [ ] `index.ts` barrel exists and only exports what's needed
- [ ] No cross-feature imports (ESLint enforces this, but double-check)
- [ ] Server data is in TanStack Query, not Zustand
- [ ] No `useMemo` / `useCallback` / `React.memo` (compiler handles it)
- [ ] Page component uses `<Suspense>` around any `useSuspenseQuery` component
- [ ] New `VITE_*` env vars are documented in `.env.example`

---

</details>

<details>
<summary><strong>Complete Routing Guide</strong></summary>

## Table of Contents

1. Overview & Architecture
2. Folder Structure
3. How Routes Are Registered (Module System)
4. Authentication Guards (RequireAuth)
5. Role-Based Access Control (RequireRole)
6. How to Add New Routes
7. Understanding the Route Hierarchy

---

## 1. OVERVIEW & ARCHITECTURE

### What is Routing?

Routing is how your app decides what page/component to show based on the URL. When a user navigates to `/settings/users`, the router matches that path and renders the appropriate component.

### Your Routing Stack

- **React Router v7** - The routing library
- **Module-based system** - Routes are grouped by feature
- **RBAC (Role-Based Access Control)** - Only certain roles can access certain routes
- **Two-layer guard system** - First check: is user logged in? Second check: does user have the right role?

### The Big Picture

```
User navigates to URL
    ↓
Router checks path
    ↓
1st Guard: RequireAuth (Is user logged in?)
    ↓
2nd Guard: RequireRole (Does user have permission?)
    ↓
AppLayout renders (sidebar + header)
    ↓
Component displays
```

---

## 2. FOLDER STRUCTURE

Your routing files are organized here:

```
src/router/
├── index.tsx              ← Creates the router object
├── routes.tsx             ← Defines all route configurations
└── guards/
    ├── RequireAuth.tsx    ← Authentication guard (Gate 1)
    └── RequireRole.tsx    ← Authorization guard (Gate 2)
```

Also important:

```
src/lib/
└── moduleRegistry.ts      ← Where you register new features

src/features/
├── auth/
│   └── module.ts          ← Auth module config
├── dashboard/
│   └── module.ts          ← Dashboard module config
├── settings/
│   └── module.ts          ← Settings module config
└── data-table/
    └── module.ts          ← Data table module config

src/pages/                 ← The actual page components
```

---

## 3. HOW ROUTES ARE REGISTERED (The Module System)

This is the key to understanding your codebase!

### The Module Contract

Each feature (auth, dashboard, settings) exports a `ModuleConfig` that tells the router about it:

```typescript
// Example: features/auth/module.ts
import type { ModuleConfig } from "@lib/moduleRegistry";

export const authModule: ModuleConfig = {
  id: "auth", // Unique identifier
  // No navItem — auth pages don't appear in the sidebar
  routes: [
    {
      path: "/login", // The URL path
      lazy: () => import("@pages/LoginPage"), // Lazy-loaded component
      roles: null, // null = PUBLIC (no auth required)
    },
  ],
};
```

### Module Route Types

```typescript
interface ModuleRoute {
  path: string;
  lazy: () => Promise<{ default: React.ComponentType }>;
  roles?: Role[] | null; // This controls access level
}
```

**Three access levels via `roles` property:**

| roles value | Meaning                         | Example         |
| ----------- | ------------------------------- | --------------- |
| `null`      | PUBLIC - anyone can access      | /login          |
| `undefined` | PROTECTED - olny logged-in user | /dashboard      |
| `['admin']` | RBAC - specific roles only      | /settings/users |

### How Routes Flow Into the Router

```typescript
// 1. All modules are imported in moduleRegistry.ts
export const MODULES: ModuleConfig[] = [
  authModule,
  dashboardModule,
  dataTableModule,
  settingsModule,
];

// 2. Routes are extracted from all modules
export const getAllModuleRoutes = (): ModuleRoute[] =>
  MODULES.flatMap((m) => m.routes);

// 3. Routes are organized by access level in routes.tsx
const allRoutes = getAllModuleRoutes();
const publicRoutes = allRoutes.filter((r) => r.roles === null);
const openAuthRoutes = allRoutes.filter((r) => r.roles === undefined);
const restrictedRoutes = allRoutes.filter((r) => r.roles?.length > 0);
```

---

## 4. AUTHENTICATION GUARDS - RequireAuth (Gate 1)

### What It Does

Checks: **"Is the user logged in?"**

If NO → Redirects to /login (saving the original URL so they can go back)
If YES → Allows access

### The Code

```typescript
// router/guards/RequireAuth.tsx
export const RequireAuth = () => {
  const user = useAuthStore((s) => s.user)
  const location = useLocation()

  if (!user) {
    // Redirect to login, saving where they wanted to go
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // User is authenticated — render child routes
  return <Outlet />
}
```

### How It's Used in the Route Tree

```typescript
export const appRoutes = [
  {
    errorElement: <RouteErrorBoundary />,
    children: [
      { path: "/", element: <Navigate to="/dashboard" replace /> },
      ...publicRoutes,           // ← /login goes here (no guard)
      {
        element: <RequireAuth />, // ← Gate 1: Check if logged in
        children: [
          {
            element: <AppLayout />,
            children: [...openAuthRoutes, ...roleGroupRoutes],  // ← Protected pages
          },
        ],
      },
      { path: "/403", element: <ForbiddenPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]
```

### User Journey Example

```
User: (not logged in) → clicks /dashboard
    ↓
RequireAuth guard runs
    ↓
Guard: "No user? Redirect to /login"
    ↓
User sees login page
    ↓
User logs in → token + user stored in useAuthStore
    ↓
RequireAuth runs again
    ↓
Guard: "User exists! Render child routes"
    ↓
Dashboard displays
```

---

## 5. ROLE-BASED ACCESS CONTROL - RequireRole (Gate 2)

### What It Does

Checks: **"Does the logged-in user have the right role for this route?"**

If NO → Redirects to /403 (Forbidden)
If YES → Allows access

### The Code

```typescript
// router/guards/RequireRole.tsx
export const RequireRole = ({ roles, redirectTo = '/403' }: RequireRoleProps) => {
  const hasPermission = usePermission(roles)

  if (!hasPermission) {
    return <Navigate to={redirectTo} replace />
  }

  return <Outlet />
}
```

### The usePermission Hook

```typescript
// shared/hooks/usePermission.ts
export function usePermission(allowedRoles: Role[]): boolean {
  const user = useAuthStore((s) => s.user);
  if (!user) return false;
  return allowedRoles.includes(user.role);
}
```

**What happens:**

1. Gets the logged-in user from the store
2. Checks if their role is in the allowedRoles array
3. Returns true/false

### Real Example from Your Settings Module

```typescript
// features/settings/module.ts
export const settingsModule: ModuleConfig = {
  id: "settings",
  routes: [
    {
      path: "/settings",
      lazy: () => import("@pages/SettingsPage"),
      roles: ["admin", "manager"], // ← Only admin or manager
    },
    {
      path: "/settings/users",
      lazy: () => import("@pages/UserManagementPage"),
      roles: ["admin"], // ← Admin ONLY
    },
    {
      path: "/profile",
      lazy: () => import("@pages/ProfilePage"),
      // roles omitted = any authenticated user
    },
  ],
};
```

### Route Hierarchy Created for Settings Module

```typescript
<RequireRole roles={['admin', 'manager']}>
  <Route path="/settings" element={<SettingsPage />} />
</RequireRole>

<RequireRole roles={['admin']}>
  <Route path="/settings/users" element={<UserManagementPage />} />
</RequireRole>

// No guard for /profile — authenticated users can access
<Route path="/profile" element={<ProfilePage />} />
```

### Role Types in Your System

```typescript
// shared/types/auth.ts
type Role = "admin" | "manager" | "viewer";
```

- **admin** - Full access to everything
- **manager** - Can manage users/data
- **viewer** - Read-only access

---

## 6. HOW TO ADD A NEW ROUTE

Step by step, adding a new feature is a **3-step process**:

### Step 1: Create the Feature Folder

```
src/features/my-feature/
├── module.ts          ← New file (the config)
├── components/
├── hooks/
├── api/
└── types/
```

### Step 2: Create the Page Component

```typescript
// src/pages/MyFeaturePage.tsx
const MyFeaturePage = () => {
  return <div>My feature content</div>
}

export default MyFeaturePage
```

### Step 3: Create the Module Config

```typescript
// src/features/my-feature/module.ts
import type { ModuleConfig } from "@lib/moduleRegistry";

export const myFeatureModule: ModuleConfig = {
  id: "my-feature",
  navItem: {
    label: "My Feature",
    path: "/my-feature",
    icon: "✨",
    order: 5,
  },
  routes: [
    {
      path: "/my-feature",
      lazy: () => import("@pages/MyFeaturePage"),
      // roles omitted = any authenticated user
    },
  ],
};
```

### Step 4: Register It

```typescript
// src/lib/moduleRegistry.ts

// 1. Import your module
import { myFeatureModule } from "@features/my-feature/module";

// 2. Add to MODULES array
export const MODULES: ModuleConfig[] = [
  authModule,
  dashboardModule,
  dataTableModule,
  settingsModule,
  myFeatureModule, // ← Add here
];
```

### Step 5: Done! 🎉

- Route appears automatically
- Nav item appears in sidebar (if you added navItem)
- Guards work automatically
- No need to touch router files!

### Example: Adding Admin-Only Analytics Page

```typescript
// src/features/analytics/module.ts
import type { ModuleConfig } from "@lib/moduleRegistry";

export const analyticsModule: ModuleConfig = {
  id: "analytics",
  navItem: {
    label: "Analytics",
    path: "/analytics",
    icon: "📊",
    order: 8,
  },
  routes: [
    {
      path: "/analytics",
      lazy: () => import("@pages/AnalyticsPage"),
      roles: ["admin"], // ← Admin only
    },
    {
      path: "/analytics/reports",
      lazy: () => import("@pages/AnalyticsReportsPage"),
      roles: ["admin"], // ← Admin only
    },
  ],
};
```

---

## 7. UNDERSTANDING THE COMPLETE ROUTE HIERARCHY

Here's what the final route tree looks like:

```
ROOT ROUTER
├── Error Boundary
└── children
    ├── Path: "/" → Redirect to "/dashboard"
    │
    ├── PUBLIC ROUTES (no auth needed)
    │   └── Path: "/login"
    │       └── Component: LoginPage
    │
    ├── PROTECTED BY RequireAuth (Gate 1)
    │   └── AppLayout (sidebar + header)
    │       ├── OPEN ROUTES (any authenticated user)
    │       │   ├── Path: "/dashboard"
    │       │   │   └── Component: DashboardPage
    │       │   └── Path: "/profile"
    │       │       └── Component: ProfilePage
    │       │
    │       └── PROTECTED BY RequireRole (Gate 2)
    │           ├── Role Group: ['admin', 'manager']
    │           │   ├── Path: "/settings"
    │           │   │   └── Component: SettingsPage
    │           │   └── More routes...
    │           │
    │           ├── Role Group: ['admin']
    │           │   ├── Path: "/settings/users"
    │           │   │   └── Component: UserManagementPage
    │           │   └── More routes...
    │           │
    │           └── More role groups...
    │
    ├── Path: "/403" → ForbiddenPage
    └── Path: "*" → NotFoundPage
```

### Flow Through the Guards

```
User navigates to /settings/users

1. Router matches path to route config
2. Checks route.roles: ['admin']

3. RequireAuth guard runs:
   - Checks if user exists
   - If NO → redirect to /login
   - If YES → continue to next guard

4. RequireRole guard runs:
   - Checks if user.role is in ['admin']
   - If NO → redirect to /403
   - If YES → render component

5. AppLayout renders (sidebar + header)
6. Component renders inside <Outlet />
```

---

## Key Concepts Summary

| Concept              | Purpose                                 | Example                                      |
| -------------------- | --------------------------------------- | -------------------------------------------- |
| **Module**           | Groups a feature (routes, nav, config)  | authModule, settingsModule                   |
| **ModuleRoute**      | Single route definition                 | { path: '/login', lazy: ..., roles: null }   |
| **RequireAuth**      | Checks if user is logged in             | Gate 1                                       |
| **RequireRole**      | Checks if user has right role           | Gate 2                                       |
| **usePermission**    | Hook to check permissions in components | `const canDelete = usePermission(['admin'])` |
| **roles: null**      | Public route                            | /login                                       |
| **roles: undefined** | Any authenticated user                  | /dashboard                                   |
| **roles: ['admin']** | Specific roles only                     | /settings/users                              |

---

## Real-World Example: User Journey

### Scenario: A viewer tries to access /settings/users (admin only)

```
1. URL changes to /settings/users
2. Router looks up route config
3. Finds: { path: '/settings/users', roles: ['admin'] }

4. RequireAuth runs:
   - Reads: useAuthStore((s) => s.user)
   - Result: { id: '123', role: 'viewer', ... }
   - Check: user exists? YES
   - Action: Continue

5. RequireRole runs:
   - Calls usePermission(['admin'])
   - Reads user.role: 'viewer'
   - Check: 'viewer' in ['admin']? NO
   - Action: Navigate to '/403'

6. User sees: Forbidden Page
```

---

## Files Reference

| File                                | Purpose                           |
| ----------------------------------- | --------------------------------- |
| `src/router/index.tsx`              | Creates the router object         |
| `src/router/routes.tsx`             | Organizes routes into hierarchy   |
| `src/router/guards/RequireAuth.tsx` | Gate 1: Authentication check      |
| `src/router/guards/RequireRole.tsx` | Gate 2: Authorization check       |
| `src/lib/moduleRegistry.ts`         | Central place to register modules |
| `src/shared/stores/useAuthStore.ts` | Holds current user + token        |
| `src/shared/hooks/usePermission.ts` | Permission checking hook          |
| `src/shared/types/auth.ts`          | Type definitions for auth         |
| `src/features/*/module.ts`          | Each feature's route config       |

---

</details>

<details>
<summary><strong>Querying/API handling rules</strong></summary>

- **Am I reading data to display in the UI?**  
  → Yes: `useQuery` / `useSuspenseQuery`

- **Am I changing something on the server that affects cached data?**  
  → Yes: `useMutation` + `invalidateQueries` after

- **Am I performing an action that has no cache relationship?**  
  → Yes: `useActionState` (React 19) or a plain async function



---

</details>

<details>
<summary><strong>Project Folder Structure</strong></summary>

## Overview

This project uses a **modular, plug-and-play architecture**.

- Core integration point: `src/lib/moduleRegistry.ts`
- Features are grouped by domain in `src/features/*`
- Shared cross-cutting utilities live in `src/shared/*`

---

## Directory Tree

```text
project/
├── src/
│   ├── lib/
│   │   └── moduleRegistry.ts
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── api/authApi.ts
│   │   │   ├── components/LoginForm
│   │   │   ├── hooks/useLogin.ts
│   │   │   ├── module.ts
│   │   │   └── index.ts
│   │   ├── dashboard/
│   │   │   └── module.ts
│   │   ├── data-table/
│   │   │   ├── api/tableApi.ts
│   │   │   ├── components/DataTable
│   │   │   ├── components/FilterBar
│   │   │   ├── hooks/useTableData
│   │   │   ├── store/useTableStore
│   │   │   ├── types.ts
│   │   │   ├── module.ts
│   │   │   └── index.ts
│   │   └── settings/
│   │       └── module.ts
│   │
│   ├── shared/
│   │   ├── api/client.ts
│   │   ├── components/
│   │   │   ├── Sidebar.tsx
│   │   │   └── AppLayout.tsx
│   │   ├── hooks/
│   │   │   ├── usePermission.ts
│   │   │   └── useDebounce.ts
│   │   ├── lib/
│   │   │   ├── cn.ts
│   │   │   └── queryClient.ts
│   │   ├── stores/
│   │   │   ├── useAuthStore.ts
│   │   │   ├── useUIStore.ts
│   │   │   └── useRealtimeStore.ts
│   │   └── types/
│   │
│   ├── router/
│   │   ├── guards/RequireAuth.tsx
│   │   ├── guards/RequireRole.tsx
│   │   └── index.tsx
│   │
│   ├── pages/
│   │   ├── LoginPage, DashboardPage, DataTablePage
│   │   ├── SettingsPage, UserManagementPage, ProfilePage
│   │   └── ForbiddenPage, NotFoundPage
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── ADDING_A_MODULE.md
├── .env.example
├── vite.config.ts
├── tsconfig.json
└── eslint.config.ts
```

---

## File/Folder Notes

### `src/lib`
- `moduleRegistry.ts`: **the plug-and-play hub**.

### `src/features/auth`
- `api/authApi.ts`: login, logout, getMe.
- `components/LoginForm`: React 19 `useActionState`.
- `hooks/useLogin.ts`: action + pending + error state.
- `module.ts`: declares `/login` as a public route.
- `index.ts`: public barrel export.

### `src/features/dashboard`
- `module.ts`: declares `/dashboard` route.

### `src/features/data-table`
- `api/tableApi.ts`: queryOptions (TanStack Query v5 pattern).
- `components/DataTable`: RBAC-aware actions, sort, pagination.
- `components/FilterBar`: writes to store only.
- `hooks/useTableData`: debounced filters + `useSuspenseQuery`.
- `store/useTableStore`: Zustand filter/sort/page state.
- `types.ts`: data-table types.
- `module.ts`: declares `/data-table` (admin + manager).
- `index.ts`: feature barrel export.

### `src/features/settings`
- `module.ts`: `/settings`, `/settings/users`, `/profile` routes.

### `src/shared`
- `api/client.ts`: axios + token injection + 401 handler.
- `components/Sidebar.tsx`: dynamic nav from registry.
- `components/AppLayout.tsx`: shell (sidebar + header + `<Outlet>`).
- `hooks/usePermission.ts`: RBAC hook used across app.
- `hooks/useDebounce.ts`: generic debounce hook.
- `lib/cn.ts`: `clsx` + `tailwind-merge` helper.
- `lib/queryClient.ts`: TanStack Query config.
- `stores/useAuthStore.ts`: persisted user + token.
- `stores/useUIStore.ts`: sidebar, modals, theme state.
- `stores/useRealtimeStore.ts`: single WebSocket connection.
- `types/`: Role, User, ApiResponse, etc.

### `src/router`
- `guards/RequireAuth.tsx`: redirects to `/login`, preserves destination.
- `guards/RequireRole.tsx`: redirects to `/403`.
- `index.tsx`: dynamic router from module registry.

### `src/pages`
- Thin route-level components:
	- LoginPage, DashboardPage, DataTablePage
	- SettingsPage, UserManagementPage, ProfilePage
	- ForbiddenPage, NotFoundPage

### Root files
- `ADDING_A_MODULE.md`: team playbook (read first).
- `.env.example`: environment template.
- `vite.config.ts`: React Compiler via rolldown.
- `tsconfig.json`: strict mode + path aliases.
- `eslint.config.ts`: compiler rules + import boundaries.



---

</details>