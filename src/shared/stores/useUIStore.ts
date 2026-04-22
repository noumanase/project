// ─────────────────────────────────────────────────────────────────────────────
// shared/stores/useUIStore.ts
//
// Owns: purely client-side UI state that has no server equivalent.
// Nothing here is ever fetched from or sent to the backend.
//
// Examples: sidebar open/closed, active modal, theme preference.
// ─────────────────────────────────────────────────────────────────────────────

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

type Theme = 'light' | 'dark' | 'system'

interface UIState {
  // ── State ──────────────────────────────────────────────────────────────────
  isSidebarOpen: boolean
  activeModal: string | null    // modal identifier, e.g. 'confirm-delete-user'
  theme: Theme

  // ── Actions ────────────────────────────────────────────────────────────────
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  openModal: (id: string) => void
  closeModal: () => void
  setTheme: (theme: Theme) => void
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set) => ({
        isSidebarOpen: true,
        activeModal: null,
        theme: 'system',

        toggleSidebar: () =>
          set((s) => ({ isSidebarOpen: !s.isSidebarOpen }), false, 'ui/toggleSidebar'),

        setSidebarOpen: (open) =>
          set({ isSidebarOpen: open }, false, 'ui/setSidebarOpen'),

        openModal: (id) =>
          set({ activeModal: id }, false, 'ui/openModal'),

        closeModal: () =>
          set({ activeModal: null }, false, 'ui/closeModal'),

        setTheme: (theme) =>
          set({ theme }, false, 'ui/setTheme'),
      }),
      {
        name: 'ui',
        // Only persist theme — sidebar state and modals reset on refresh
        partialize: (state) => ({ theme: state.theme }),
      },
    ),
    { name: 'UIStore' },
  ),
)
