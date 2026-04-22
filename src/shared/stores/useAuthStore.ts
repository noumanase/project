// ─────────────────────────────────────────────────────────────────────────────
// shared/stores/useAuthStore.ts
//
// Owns: currently authenticated user, access token, login/logout actions.
//
// Rules:
//   - NEVER store server data here (users list, records, etc.) — that's TanStack Query
//   - persist middleware keeps session alive across page refresh
//   - devtools middleware lets you inspect state in Redux DevTools extension
//
// Usage:
//   const user  = useAuthStore(s => s.user)        ← selector (fine-grained, no extra renders)
//   const login = useAuthStore(s => s.login)
// ─────────────────────────────────────────────────────────────────────────────

import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import type { User } from "@shared/types";

interface AuthState {
  // ── State
  user: User | null;
  token: string | null;

  // ── Actions
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (partial: Partial<User>) => void; // e.g. after profile update
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        user: null,
        token: null,

        // Called after successful login API response
        login: (user, token) => set({ user, token }, false, "auth/login"),

        // Called on logout button or 401 response
        logout: () => set({ user: null, token: null }, false, "auth/logout"),

        // Called after user updates their own profile
        updateUser: (partial) =>
          set(
            (state) => ({
              user: state.user ? { ...state.user, ...partial } : null,
            }),
            false,
            "auth/updateUser",
          ),
      }),
      {
        name: "auth", // localStorage key
        // Only persist user and token — not actions (they're not serialisable)
        partialize: (state) => ({ user: state.user, token: state.token }),
      },
    ),
    { name: "AuthStore" }, // label in Redux DevTools
  ),
);
