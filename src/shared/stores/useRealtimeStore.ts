// ─────────────────────────────────────────────────────────────────────────────
// shared/stores/useRealtimeStore.ts
//
// Owns: WebSocket connection lifecycle + live data pushed from the server.
//
// WHY a single shared store (not per-feature):
//   - Only ONE WebSocket connection ever opens — features subscribe to slices
//   - If a feature unmounts, it doesn't kill the socket other features need
//   - All live data flows through one predictable pipeline
//
// HOW features use it:
//   const notifications = useRealtimeStore(s => s.notifications)
//   // They read slices — they never open their own connections
// ─────────────────────────────────────────────────────────────────────────────

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

// Extend this interface as your app adds real-time features
interface RealtimeState {
  // ── Connection ────────────────────────────────────────────────────────────
  status: ConnectionStatus
  socket: WebSocket | null

  // ── Live data slices (add your own as needed) ─────────────────────────────
  notifications: Notification[]
  onlineUserIds: string[]

  // ── Actions ───────────────────────────────────────────────────────────────
  connect: (url: string, token: string) => void
  disconnect: () => void
  addNotification: (n: Notification) => void
  setOnlineUsers: (ids: string[]) => void
}

interface Notification {
  id: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: number
}

export const useRealtimeStore = create<RealtimeState>()(
  devtools(
    (set, get) => ({
      status: 'disconnected',
      socket: null,
      notifications: [],
      onlineUserIds: [],

      connect: (url, token) => {
        // Don't open a second connection if one already exists
        if (get().socket) return

        set({ status: 'connecting' }, false, 'realtime/connecting')

        const ws = new WebSocket(`${url}?token=${token}`)

        ws.onopen = () => {
          set({ status: 'connected', socket: ws }, false, 'realtime/connected')
        }

        ws.onmessage = (event) => {
          // Parse incoming messages and route to the right slice
          const msg = JSON.parse(event.data as string) as {
            type: string
            payload: unknown
          }

          switch (msg.type) {
            case 'notification':
              get().addNotification(msg.payload as Notification)
              break
            case 'online_users':
              get().setOnlineUsers(msg.payload as string[])
              break
            // Add more cases as your backend sends more event types
          }
        }

        ws.onerror = () => {
          set({ status: 'error' }, false, 'realtime/error')
        }

        ws.onclose = () => {
          set({ status: 'disconnected', socket: null }, false, 'realtime/disconnected')
        }
      },

      disconnect: () => {
        get().socket?.close()
        set({ socket: null, status: 'disconnected' }, false, 'realtime/disconnect')
      },

      addNotification: (n) =>
        { set(
          (s) => ({ notifications: [n, ...s.notifications].slice(0, 50) }), // keep last 50
          false,
          'realtime/addNotification',
        ); },

      setOnlineUsers: (ids) =>
        { set({ onlineUserIds: ids }, false, 'realtime/setOnlineUsers'); },
    }),
    { name: 'RealtimeStore' },
  ),
)
