import { isAxiosError } from 'axios';
import type { ApiErrorResponse } from '@/types';

/**
 * Normalized error type thrown by the axios client for every failed request.
 * Wraps the backend's ErrorResponse contract (see exception/ErrorResponse.java)
 * when the server returned one, and degrades gracefully for network failures,
 * timeouts, or unexpected non-JSON error bodies.
 */
export class ApiError extends Error {
  readonly status: number | null;
  readonly fieldErrors: Record<string, string[]> | null;
  readonly isNetworkError: boolean;

  constructor(
    message: string,
    options: {
      status?: number | null;
      fieldErrors?: Record<string, string[]> | null;
      isNetworkError?: boolean;
    } = {}
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = options.status ?? null;
    this.fieldErrors = options.fieldErrors ?? null;
    this.isNetworkError = options.isNetworkError ?? false;
  }
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (isAxiosError<ApiErrorResponse>(error)) {
    if (!error.response) {
      return new ApiError(
        error.code === 'ECONNABORTED'
          ? 'The request timed out. Check your connection and try again.'
          : 'Could not reach the server. Check your connection and try again.',
        { isNetworkError: true }
      );
    }

    const body = error.response.data;
    if (body && typeof body === 'object' && 'message' in body) {
      return new ApiError(body.message, {
        status: error.response.status,
        fieldErrors: body.fieldErrors ?? null,
      });
    }

    return new ApiError(error.message || 'The request failed.', { status: error.response.status });
  }

  if (error instanceof Error) {
    return new ApiError(error.message);
  }

  return new ApiError('An unexpected error occurred.');
}
