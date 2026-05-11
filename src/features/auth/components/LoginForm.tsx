// features/auth/components/LoginForm.tsx
//
// The login form. Uses:
//   - useLogin() for the action + pending/error state (React 19 useActionState)
//   - Native <form action={...}> — React 19 supports async functions as actions
//   - useFormStatus-style isPending from useActionState (no need for useFormStatus here)

import { cn } from "@shared/lib";
import { useLogin } from "../hooks/useLogin";
import { Button } from "@shared/components/ui/button";

export const LoginForm = () => {
  const { state, action, isPending } = useLogin();

  return (
    <form action={action} className="flex flex-col w-full max-w-sm gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          disabled={isPending}
          className={cn(
            "rounded-md border px-3 py-2 text-sm outline-hidden",
            "focus:ring-2 focus:ring-brand-500",
            "disabled:opacity-50",
          )}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          disabled={isPending}
          className={cn(
            "rounded-md border px-3 py-2 text-sm outline-hidden",
            "focus:ring-2 focus:ring-brand-500",
            "disabled:opacity-50",
          )}
        />
      </div>

      {/* Error message from useActionState — no separate error useState needed */}
      {state.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}

      <Button variant={"default"} type="submit" disabled={isPending}>
        {isPending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
};
