// ─────────────────────────────────────────────────────────────────────────────
// features/auth/hooks/useLogin.ts
//
// Handles the login action using React 19's useActionState.
// This replaces the old pattern of:
//   const [loading, setLoading] = useState(false)
//   const [error, setError]     = useState(null)
//   try { ... } catch { ... } finally { ... }
//
// useActionState gives us isPending, state (result/error), and the action
// function — all in one, with zero manual state juggling.
// ─────────────────────────────────────────────────────────────────────────────

import { useActionState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authApi } from "../api/authApi";
import { useAuthStore } from "@shared/stores";
import type { LoginCredentials, ApiError } from "@shared/types";

interface LoginActionState {
  error: string | null;
}

export function useLogin() {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const location = useLocation();

  // Where to redirect after login — defaults to /dashboard
  const locationState = location.state as {
    from?: { pathname: string };
  } | null;
  const from = locationState?.from?.pathname ?? "/dashboard";

  const loginAction = async (
    _prevState: LoginActionState,
    formData: FormData,
  ): Promise<LoginActionState> => {
    const credentials: LoginCredentials = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    try {
      // const response = await authApi.login(credentials);
      // Persist user + token in Zustand (survives page refresh via persist middleware)
      // login(response.user, response.tokens.accessToken);
      login(
        {
          email: "temp@example.com",
          name: "Temp User",
          id: "temp-id",
          role: "admin",
        },
        "fake-jwt-token",
      );
      // Navigate to the page they originally tried to access
      await navigate(from, { replace: true });
      return { error: null };
    } catch (err) {
      const apiError = err as ApiError;
      return { error: apiError.message };
    }
  };

  const [state, action, isPending] = useActionState(loginAction, {
    error: null,
  });

  return { state, action, isPending };
}
