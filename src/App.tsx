// ─────────────────────────────────────────────────────────────────────────────
// App.tsx
//
// Root of the application. Responsibilities:
//   1. Provide QueryClient to the entire tree
//   2. Mount the router
//   3. Run module initializers once after auth hydrates
//   4. Mount TanStack Query DevTools (dev only — zero production cost)
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { router } from '@router/index'
import { queryClient } from '@shared/lib'
import { useAuthStore } from '@shared/stores'
import { initializeModules } from '@lib/moduleRegistry'

const App = () => {
  const user = useAuthStore((s) => s.user)

  // Run all module initializers once after the auth store has hydrated.
  // Modules can use this to prefetch data, connect sockets, load flags, etc.
  useEffect(() => {
    void initializeModules({ userRole: user?.role ?? null })
  }, [user?.role])
  // Re-runs if the user's role changes (e.g. admin demoted to viewer mid-session)

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />

      {/* DevTools panel — stripped from production bundle automatically */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App
