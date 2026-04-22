// pages/UserManagementPage.tsx
// Admin-only page (enforced by RequireRole in router — this page never
// renders for non-admins, so no permission check needed here)
const UserManagementPage = () => (
  <div>
    <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
    <p className="mt-1 text-sm text-gray-500">Admin-only: manage users and roles.</p>
    {/* Plug in your users feature here */}
  </div>
)
export default UserManagementPage
