import { AxiosError, AxiosHeaders } from 'axios';
import { describe, expect, it } from 'vitest';
import { ApiError, toApiError } from './apiError';
import type { ApiErrorResponse } from '@/types';

function makeAxiosError(status: number, body: ApiErrorResponse): AxiosError<ApiErrorResponse> {
  const error = new AxiosError('Request failed', String(status), undefined, undefined, {
    status,
    statusText: '',
    headers: new AxiosHeaders(),
    config: { headers: new AxiosHeaders() },
    data: body,
  });
  return error;
}

describe('toApiError', () => {
  it('passes an existing ApiError through unchanged', () => {
    const original = new ApiError('already normalized', { status: 400 });
    expect(toApiError(original)).toBe(original);
  });

  it('extracts message, status, and fieldErrors from a backend ErrorResponse body', () => {
    const body: ApiErrorResponse = {
      timestamp: '2026-07-07T10:00:00',
      status: 400,
      error: 'Validation Failed',
      message: 'Validation failed for one or more fields',
      path: '/api/v1/products',
      fieldErrors: { price: ['Price must not be negative'] },
    };

    const result = toApiError(makeAxiosError(400, body));

    expect(result.message).toBe('Validation failed for one or more fields');
    expect(result.status).toBe(400);
    expect(result.fieldErrors).toEqual({ price: ['Price must not be negative'] });
    expect(result.isNetworkError).toBe(false);
  });

  it('produces a network-error ApiError when there is no response at all', () => {
    const error = new AxiosError('Network Error', 'ERR_NETWORK', undefined, undefined, undefined);
    const result = toApiError(error);

    expect(result.isNetworkError).toBe(true);
    expect(result.status).toBeNull();
  });

  it('falls back to a generic message for a non-Axios, non-Error value', () => {
    const result = toApiError('not an error object');
    expect(result).toBeInstanceOf(ApiError);
    expect(result.message).toBe('An unexpected error occurred.');
  });
});
