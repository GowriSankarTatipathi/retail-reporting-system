import { httpClient } from './client';
import type { DashboardSummary } from '@/types';

/** GET /api/v1/dashboard/summary - available to every authenticated role, Redis-cached 5 min. */
export async function getDashboardSummary(lookbackDays = 30): Promise<DashboardSummary> {
  const { data } = await httpClient.get<DashboardSummary>('/dashboard/summary', {
    params: { lookbackDays },
  });
  return data;
}
