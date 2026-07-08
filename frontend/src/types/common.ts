/**
 * Shared response envelopes. These mirror the backend's DTOs exactly (see
 * dto/response/PageResponse.java and exception/ErrorResponse.java) - do not
 * add or rename fields here without a matching backend change.
 */

/** Mirrors Spring Data's Page, wrapped in PageResponse<T> for a stable contract. */
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

/** Uniform error payload returned by every non-2xx response (see ErrorResponse.java). */
export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  fieldErrors: Record<string, string[]> | null;
}

/** Spring Data Sort direction, as accepted by the `sort` query param (e.g. `price,desc`). */
export type SortDirection = 'asc' | 'desc';

export interface PageQuery {
  page?: number;
  size?: number;
  /** Field name to sort by; combined with sortDirection into `sort=field,direction`. */
  sort?: string;
  sortDirection?: SortDirection;
}
