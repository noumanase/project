# Complete Routing Guide - Your Codebase

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
