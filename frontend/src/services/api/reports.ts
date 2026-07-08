import { httpClient } from './client';
import type {
  DateRangeParams,
  ExportFormat,
  LowStockItem,
  ReportGranularity,
  RevenueTrendPoint,
  SalesSummary,
  TopCustomerPoint,
  TopProductPoint,
} from '@/types';

/**
 * Every report endpoint accepts `format=csv|pdf` and returns a file instead of
 * JSON when it's present (see ReportController.export). ADMIN/MANAGER/ANALYST
 * only - the backend enforces this with @PreAuthorize; VIEWER gets 403.
 */

/** GET /api/v1/reports/sales-summary */
export async function getSalesSummary(params: DateRangeParams): Promise<SalesSummary> {
  const { data } = await httpClient.get<SalesSummary>('/reports/sales-summary', { params });
  return data;
}

/** GET /api/v1/reports/revenue-trend */
export async function getRevenueTrend(
  params: DateRangeParams & { granularity: ReportGranularity }
): Promise<RevenueTrendPoint[]> {
  const { data } = await httpClient.get<RevenueTrendPoint[]>('/reports/revenue-trend', { params });
  return data;
}

/** GET /api/v1/reports/top-products */
export async function getTopProducts(
  params: DateRangeParams & { limit?: number; sortBy?: 'quantity' | 'revenue' }
): Promise<TopProductPoint[]> {
  const { data } = await httpClient.get<TopProductPoint[]>('/reports/top-products', { params });
  return data;
}

/** GET /api/v1/reports/top-customers */
export async function getTopCustomers(
  params: DateRangeParams & { limit?: number }
): Promise<TopCustomerPoint[]> {
  const { data } = await httpClient.get<TopCustomerPoint[]>('/reports/top-customers', { params });
  return data;
}

/** GET /api/v1/reports/low-stock */
export async function getLowStockItems(): Promise<LowStockItem[]> {
  const { data } = await httpClient.get<LowStockItem[]>('/reports/low-stock');
  return data;
}

type ExportableReport = 'revenue-trend' | 'top-products' | 'top-customers' | 'low-stock';

/**
 * Downloads a report as CSV or PDF and saves it via the browser's normal file
 * download mechanism. `low-stock` ignores the date range params (the backend
 * endpoint takes none); callers pass an empty object for it.
 */
export async function exportReport(
  report: ExportableReport,
  format: ExportFormat,
  params: Record<string, string | number | undefined>
): Promise<void> {
  const response = await httpClient.get(`/reports/${report}`, {
    params: { ...params, format },
    responseType: 'blob',
  });

  const disposition = response.headers['content-disposition'] as string | undefined;
  const filenameMatch = disposition?.match(/filename="?([^"]+)"?/);
  const filename = filenameMatch?.[1] ?? `${report}.${format}`;

  const url = URL.createObjectURL(response.data as Blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
