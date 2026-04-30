// pages/DashboardPage.tsx
import { Todos } from "@features/dashboard";
import { useAuthStore } from "@shared/stores";
import { Suspense } from "react";

const DashboardPage = () => {
  const user = useAuthStore((s) => s.user);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-1 text-gray-500">
        Welcome back, {user?.name}. You are signed in as{" "}
        <span className="font-medium capitalize">{user?.role}</span>.
      </p>
      <Suspense fallback={<div>Loading todos...</div>}>
        <Todos />
      </Suspense>
    </div>
  );
};

export default DashboardPage;
