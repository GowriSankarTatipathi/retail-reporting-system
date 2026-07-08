import type { PageQuery } from '@/types';

/**
 * Builds the query params Spring Data's `Pageable` expects: `page`, `size`,
 * and `sort=field,direction` (see e.g. ProductController.search's
 * `@PageableDefault` binding). Omits keys entirely when unset so the
 * controller's own defaults apply.
 */
export function toPageableParams(query: PageQuery): Record<string, string | number> {
  const params: Record<string, string | number> = {};
  if (query.page !== undefined) params.page = query.page;
  if (query.size !== undefined) params.size = query.size;
  if (query.sort) params.sort = `${query.sort},${query.sortDirection ?? 'asc'}`;
  return params;
}
