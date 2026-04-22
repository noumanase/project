// ─────────────────────────────────────────────────────────────────────────────
// router/guards/RequireRole.tsx
//
// Gate 2: Does the logged-in user have the right role for this route?
// Always used INSIDE RequireAuth — never standalone (user is guaranteed to
// exist by the time RequireRole runs).
//
// Usage in router:
//   <Route element={<RequireRole roles={['admin']} />}>
//     <Route path="settings/users" element={<UserManagementPage />} />
//   </Route>
// ─────────────────────────────────────────────────────────────────────────────

import { Navigate, Outlet } from 'react-router-dom'
import { usePermission } from '@shared/hooks'
import type { Role } from '@shared/types'

interface RequireRoleProps {
  roles: Role[]
  // Optional: redirect to a custom path instead of /403
  redirectTo?: string
}

export const RequireRole = ({ roles, redirectTo = '/403' }: RequireRoleProps) => {
  const hasPermission = usePermission(roles)

  if (!hasPermission) {
    return <Navigate to={redirectTo} replace />
  }

  return <Outlet />
}
