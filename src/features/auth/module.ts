// features/auth/module.ts
// Auth module descriptor — registers the login route as a public route.
// roles: null = public (no auth required).

import type { ModuleConfig } from '@lib/moduleRegistry'

export const authModule: ModuleConfig = {
  id: 'auth',
  // No navItem — auth pages don't appear in the sidebar
  routes: [
    {
      path: '/login',
      lazy: () => import('@pages/LoginPage'),
      roles: null, // public
    },
  ],
}
