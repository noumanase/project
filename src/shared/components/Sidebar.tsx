// shared/components/Sidebar.tsx
// Nav items are pulled from the module registry — no hardcoded list here.
// New modules with a navItem appear automatically.

import { NavLink } from "react-router-dom";
import { useAuthStore, useUIStore } from "@shared/stores";
import { cn } from "@shared/lib";
import { getNavItems } from "@lib/moduleRegistry";

export const Sidebar = () => {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isSidebarOpen = useUIStore((s) => s.isSidebarOpen);

  const navItems = getNavItems().filter(
    (item) => !item.roles || (user && item.roles.includes(user.role)),
  );

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r bg-white transition-all duration-300",
        isSidebarOpen ? "w-56" : "w-16",
      )}
    >
      <div className="flex items-center px-4 font-bold border-b h-14 shrink-0 text-brand-500">
        {isSidebarOpen ? "App" : "🚀"}
      </div>

      <nav className="flex flex-col flex-1 gap-1 p-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-brand-50 font-medium text-brand-600"
                  : "text-gray-600 hover:bg-gray-100",
              )
            }
          >
            <span className="text-base shrink-0">{item.icon}</span>
            {isSidebarOpen && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {user && (
        <div className="p-3 border-t shrink-0">
          {isSidebarOpen && (
            <div className="mb-2 text-xs text-gray-500">
              <div className="font-medium text-gray-700 truncate">
                {user.name}
              </div>
              <div className="capitalize">{user.role}</div>
            </div>
          )}
          <button
            onClick={logout}
            className="w-full px-3 py-2 text-sm text-left text-red-500 rounded-md hover:bg-red-50"
          >
            {isSidebarOpen ? "Sign out" : "→"}
          </button>
        </div>
      )}
    </aside>
  );
};
