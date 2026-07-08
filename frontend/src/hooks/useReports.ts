import { useMutation, useQuery } from '@tanstack/react-query';
import { queryKeys, reportsApi } from '@/services/api';
import type { DateRangeParams, ExportFormat, ReportGranularity } from '@/types';

export function useSalesSummary(params: DateRangeParams, enabled = true) {
  return useQuery({
    queryKey: queryKeys.reports.salesSummary(params),
    queryFn: () => reportsApi.getSalesSummary(params),
    enabled,
  });
}

export function useRevenueTrend(
  params: DateRangeParams & { granularity: ReportGranularity },
  enabled = true
) {
  return useQuery({
    queryKey: queryKeys.reports.revenueTrend(params),
    queryFn: () => reportsApi.getRevenueTrend(params),
    enabled,
  });
}

export function useTopProducts(
  params: DateRangeParams & { limit: number; sortBy: 'quantity' | 'revenue' },
  enabled = true
) {
  return useQuery({
    queryKey: queryKeys.reports.topProducts(params),
    queryFn: () => reportsApi.getTopProducts(params),
    enabled,
  });
}

export function useTopCustomers(params: DateRangeParams & { limit: number }, enabled = true) {
  return useQuery({
    queryKey: queryKeys.reports.topCustomers(params),
    queryFn: () => reportsApi.getTopCustomers(params),
    enabled,
  });
}

export function useLowStockItems() {
  return useQuery({
    queryKey: queryKeys.reports.lowStock,
    queryFn: reportsApi.getLowStockItems,
  });
}

export function useExportReport() {
  return useMutation({
    mutationFn: ({
      report,
      format,
      params,
    }: {
      report: 'revenue-trend' | 'top-products' | 'top-customers' | 'low-stock';
      format: ExportFormat;
      params: Record<string, string | number | undefined>;
    }) => reportsApi.exportReport(report, format, params),
  });
}
