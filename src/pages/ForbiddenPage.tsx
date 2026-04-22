// pages/ForbiddenPage.tsx
import { Link } from 'react-router-dom'
const ForbiddenPage = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
    <h1 className="text-6xl font-bold text-gray-300">403</h1>
    <p className="text-xl font-semibold text-gray-700">Access Denied</p>
    <p className="text-gray-500">You don't have permission to view this page.</p>
    <Link to="/dashboard" className="text-brand-500 hover:underline">
      Back to Dashboard
    </Link>
  </div>
)
export default ForbiddenPage
