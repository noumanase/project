// ─────────────────────────────────────────────────────────────────────────────
// shared/types/api.ts
//
// Standard shapes for all API responses.
// Your backend should conform to these — agree on this with your backend team
// on day one and never deviate.
// ─────────────────────────────────────────────────────────────────────────────

// Single resource response
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// Paginated list response
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

// Standard error shape from backend
export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
  errors?: Record<string, string[]>; // field-level validation errors
}

// Query params for paginated requests
export interface PaginationParams {
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
}
