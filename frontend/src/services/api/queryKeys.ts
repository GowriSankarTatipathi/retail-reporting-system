import type {
  CustomerSearchParams,
  DateRangeParams,
  OrderSearchParams,
  PageQuery,
  ProductSearchParams,
} from '@/types';

/**
 * Centralized TanStack Query key factory. Keeping every key definition in one
 * place avoids the classic "typo'd a query key and cache invalidation silently
 * stopped working" bug, and makes it obvious at a glance what invalidates what.
 */
export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  categories: {
    all: ['categories'] as const,
    detail: (id: number) => ['categories', id] as const,
  },
  products: {
    all: ['products'] as const,
    list: (params: ProductSearchParams & PageQuery) => ['products', 'list', params] as const,
    detail: (id: number) => ['products', id] as const,
    inventory: (id: number) => ['products', id, 'inventory'] as const,
  },
  customers: {
    all: ['customers'] as const,
    list: (params: CustomerSearchParams & PageQuery) => ['customers', 'list', params] as const,
    detail: (id: number) => ['customers', id] as const,
  },
  orders: {
    all: ['orders'] as const,
    list: (params: OrderSearchParams & PageQuery) => ['orders', 'list', params] as const,
    detail: (id: number) => ['orders', id] as const,
  },
  dashboard: {
    summary: (lookbackDays: number) => ['dashboard', 'summary', lookbackDays] as const,
  },
  reports: {
    salesSummary: (params: DateRangeParams) => ['reports', 'sales-summary', params] as const,
    revenueTrend: (params: DateRangeParams & { granularity: string }) =>
      ['reports', 'revenue-trend', params] as const,
    topProducts: (params: DateRangeParams & { limit: number; sortBy: string }) =>
      ['reports', 'top-products', params] as const,
    topCustomers: (params: DateRangeParams & { limit: number }) =>
      ['reports', 'top-customers', params] as const,
    lowStock: ['reports', 'low-stock'] as const,
  },
  users: {
    all: ['users'] as const,
    list: (params: PageQuery) => ['users', 'list', params] as const,
  },
} as const;
