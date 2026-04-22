// ─────────────────────────────────────────────────────────────────────────────
// router/guards/RequireAuth.tsx
//
// Gate 1: Is the user logged in at all?
// If not → redirect to /login, preserving the intended destination so we can
// redirect back after login (standard UX pattern).
// ─────────────────────────────────────────────────────────────────────────────

import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@shared/stores'

export const RequireAuth = () => {
  const user = useAuthStore((s) => s.user)
  const location = useLocation()

  if (!user) {
    // Pass current location as state so LoginPage can redirect back after login
    // e.g. user tried /settings/users → logged in → lands on /settings/users
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // User is authenticated — render the child routes
  return <Outlet />
}
