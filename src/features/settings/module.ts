// features/settings/module.ts
import type { ModuleConfig } from "@lib/moduleRegistry";

export const settingsModule: ModuleConfig = {
  id: "settings",
  navItem: {
    label: "Settings",
    path: "/settings",
    icon: "⚙",
    order: 10, // high order = bottom of sidebar
  },
  routes: [
    {
      path: "/settings",
      lazy: () => import("@pages/SettingsPage"),
      roles: ["admin", "manager"],
    },
    {
      path: "/settings/users",
      lazy: () => import("@pages/UserManagementPage"),
      roles: ["admin"], // admin only
    },
    {
      path: "/profile",
      lazy: () => import("@pages/ProfilePage"),
      // roles omitted = any authenticated user
    },
  ],
};
