import { useQuery } from '@tanstack/react-query';
import { dashboardApi, queryKeys } from '@/services/api';

export function useDashboardSummary(lookbackDays = 30) {
  return useQuery({
    queryKey: queryKeys.dashboard.summary(lookbackDays),
    queryFn: () => dashboardApi.getDashboardSummary(lookbackDays),
    // Matches the backend's own 5-minute Redis cache TTL for this endpoint -
    // no point refetching more often than the server-side cache changes.
    staleTime: 5 * 60 * 1000,
  });
}
