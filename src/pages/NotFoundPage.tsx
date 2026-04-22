// pages/NotFoundPage.tsx
import { Link } from 'react-router-dom'
const NotFoundPage = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
    <h1 className="text-6xl font-bold text-gray-300">404</h1>
    <p className="text-xl font-semibold text-gray-700">Page Not Found</p>
    <Link to="/dashboard" className="text-brand-500 hover:underline">
      Back to Dashboard
    </Link>
  </div>
)
export default NotFoundPage
