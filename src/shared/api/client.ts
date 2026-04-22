// ─────────────────────────────────────────────────────────────────────────────
// shared/api/client.ts
//
// Single axios instance for the entire app.
// All features import THIS — never create their own axios instances.
//
// Responsibilities:
//   1. Inject auth token on every request automatically
//   2. Handle 401 → logout user (token expired)
//   3. Standardise error shape so features don't need to parse raw axios errors
// ─────────────────────────────────────────────────────────────────────────────

import axios, { type AxiosError } from "axios";
import type { ApiError } from "@shared/types";

class ApiClientError extends Error implements ApiError {
  code: string;
  statusCode: number;

  constructor(apiError: ApiError) {
    super(apiError.message);
    this.name = "ApiClientError";
    this.code = apiError.code;
    this.statusCode = apiError.statusCode;
  }
}

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

// ── Request interceptor — inject token ───────────────────────────────────────
apiClient.interceptors.request.use((config) => {
  // Read token directly from localStorage (same key as Zustand persist).
  // We read from storage directly here to avoid a circular dependency
  // (client.ts → useAuthStore → client.ts).
  const raw = localStorage.getItem("auth");
  if (raw) {
    const parsed = JSON.parse(raw) as { state?: { token?: string } };
    const token = parsed.state?.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ── Response interceptor — handle 401 & normalise errors ─────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear auth state and redirect to login.
      // We can't import useAuthStore here (circular dep), so we clear storage
      // directly and let React Router handle the redirect via RequireAuth guard.
      localStorage.removeItem("auth");
      window.location.href = "/login";
    }

    // Normalise error so callers always get a consistent ApiError shape.
    const apiError: ApiError = error.response?.data ?? {
      message: error.message,
      code: "NETWORK_ERROR",
      statusCode: error.response?.status ?? 0,
    };

    return Promise.reject(new ApiClientError(apiError));
  },
);
