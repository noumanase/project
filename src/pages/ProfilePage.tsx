// pages/ProfilePage.tsx
import { useAuthStore } from '@shared/stores'

const ProfilePage = () => {
  const user = useAuthStore((s) => s.user)
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
      <p className="mt-1 text-sm text-gray-500">{user?.email}</p>
    </div>
  )
}
export default ProfilePage
