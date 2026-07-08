import axios, { type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';
import { env } from '@/config/env';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from './tokenStorage';
import { toApiError } from './apiError';
import type { AuthResponse } from '@/types';

/** Requests matching these paths must never trigger the refresh-and-retry flow. */
const AUTH_ENDPOINTS_WITHOUT_REFRESH = ['/auth/login', '/auth/register', '/auth/refresh'];

/**
 * Invoked when a refresh attempt itself fails (refresh token expired/invalid) -
 * the session cannot be recovered and the user must log in again. Registered
 * by AuthProvider at app startup so this module doesn't need to import React.
 */
let onSessionExpired: (() => void) | null = null;
export function registerSessionExpiredHandler(handler: () => void): void {
  onSessionExpired = handler;
}

export const httpClient = axios.create({
  baseURL: `${env.apiBaseUrl}/api/v1`,
  timeout: 15_000,
});

/** A bare instance with no interceptors, used only for the refresh call itself. */
const refreshClient = axios.create({
  baseURL: `${env.apiBaseUrl}/api/v1`,
  timeout: 15_000,
});

httpClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

// Coalesces concurrent 401s into a single refresh call instead of firing one
// refresh request per failed request.
let refreshInFlight: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await refreshClient.post<AuthResponse>('/auth/refresh', { refreshToken });
  setAccessToken(response.data.accessToken);
  setRefreshToken(response.data.refreshToken);
  return response.data.accessToken;
}

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as
      (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;

    const isRefreshExempt =
      !originalRequest?.url ||
      AUTH_ENDPOINTS_WITHOUT_REFRESH.some((path) => originalRequest.url?.includes(path));

    const shouldAttemptRefresh =
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retried &&
      !isRefreshExempt;

    if (!shouldAttemptRefresh) {
      return Promise.reject(toApiError(error));
    }

    originalRequest._retried = true;

    try {
      refreshInFlight ??= refreshAccessToken().finally(() => {
        refreshInFlight = null;
      });
      const newAccessToken = await refreshInFlight;

      const retriedConfig: AxiosRequestConfig = {
        ...originalRequest,
        headers: {
          ...originalRequest.headers,
          Authorization: `Bearer ${newAccessToken}`,
        },
      };
      return await httpClient.request(retriedConfig);
    } catch {
      clearTokens();
      onSessionExpired?.();
      return Promise.reject(toApiError(error));
    }
  }
);
