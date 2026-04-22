# How to Add a New Module

This project uses a plug-and-play module system. Adding a new feature involves
**one structural step** and a few files. Nothing in the core shell (router,
sidebar, layout) ever needs to change.

---

## The 5-step checklist

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
