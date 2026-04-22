// pages/LoginPage.tsx
import { LoginForm } from '@features/auth'

const LoginPage = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="w-full max-w-sm p-8 bg-white border shadow-sm rounded-xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Sign in</h1>
      <LoginForm />
    </div>
  </div>
)

export default LoginPage
