// shared/components/AppLayout.tsx
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { useUIStore } from '@shared/stores'

export const AppLayout = () => {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center border-b bg-white px-4">
          <button
            onClick={toggleSidebar}
            className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
