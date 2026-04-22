// shared/types/index.ts
// Public API for all shared types.
// Import from '@shared/types', never from deep paths.
export type { Role, User, AuthTokens, LoginCredentials, LoginResponse } from './auth'
export type { ApiResponse, PaginatedResponse, ApiError, PaginationParams } from './api'
