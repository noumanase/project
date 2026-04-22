// ─────────────────────────────────────────────────────────────────────────────
// shared/types/auth.ts
//
// Single source of truth for all auth-related types.
// Import these everywhere — never redefine Role or User locally.
// ─────────────────────────────────────────────────────────────────────────────

// Every possible role in the system.
// Adding a new role here will cause TypeScript to surface every place
// that needs to handle it — that's intentional.
export type Role = 'admin' | 'manager' | 'viewer'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  avatarUrl?: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  user: User
  tokens: AuthTokens
}
