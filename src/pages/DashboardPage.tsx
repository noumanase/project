// pages/DashboardPage.tsx
import { useAuthStore } from '@shared/stores'

const DashboardPage = () => {
  const user = useAuthStore((s) => s.user)

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-1 text-gray-500">
        Welcome back, {user?.name}. You are signed in as{' '}
        <span className="font-medium capitalize">{user?.role}</span>.
      </p>
      {/* Add your dashboard widgets here */}
    </div>
  )
}

export default DashboardPage
