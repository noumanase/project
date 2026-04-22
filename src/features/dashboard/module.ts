// features/dashboard/module.ts
import type { ModuleConfig } from "@lib/moduleRegistry";

export const dashboardModule: ModuleConfig = {
  id: "dashboard",
  navItem: {
    label: "Dashboard",
    path: "/dashboard",
    icon: "▦",
    order: 1,
  },
  routes: [
    {
      path: "/dashboard",
      lazy: () => import("@pages/DashboardPage"),
      // roles omitted = any authenticated user
    },
  ],
};
