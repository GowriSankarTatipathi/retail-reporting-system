import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import DashboardPage from './DashboardPage';
import { dashboardApi, ordersApi, reportsApi } from '@/services/api';
import type * as ApiModule from '@/services/api';
import type { User } from '@/types';

vi.mock('@/services/api', async () => {
  const actual = await vi.importActual<typeof ApiModule>('@/services/api');
  return {
    ...actual,
    dashboardApi: { getDashboardSummary: vi.fn() },
    ordersApi: { ...actual.ordersApi, searchOrders: vi.fn() },
    reportsApi: {
      ...actual.reportsApi,
      getRevenueTrend: vi.fn(),
      getTopProducts: vi.fn(),
      getTopCustomers: vi.fn(),
      getLowStockItems: vi.fn(),
    },
  };
});

const mockUseAuth = vi.fn();
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

function renderAsRole(role: User['role']) {
  mockUseAuth.mockReturnValue({
    user: { id: 1, email: 'a@b.com', fullName: 'A B', role, enabled: true, createdAt: '' },
  });

  vi.mocked(dashboardApi.getDashboardSummary).mockResolvedValue({
    totalRevenue: 18452.3,
    totalOrders: 42,
    averageOrderValue: 439.34,
    activeCustomers: 9,
    lowStockCount: 3,
    generatedAt: '2026-07-07T10:15:00',
  });
  vi.mocked(ordersApi.searchOrders).mockResolvedValue({
    content: [],
    page: 0,
    size: 5,
    totalElements: 0,
    totalPages: 0,
    last: true,
  });
  vi.mocked(reportsApi.getRevenueTrend).mockResolvedValue([]);
  vi.mocked(reportsApi.getTopProducts).mockResolvedValue([]);
  vi.mocked(reportsApi.getTopCustomers).mockResolvedValue([]);
  vi.mocked(reportsApi.getLowStockItems).mockResolvedValue([]);

  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <DashboardPage />
    </QueryClientProvider>
  );
}

describe('DashboardPage', () => {
  it('shows KPI cards for every authenticated role, including VIEWER', async () => {
    renderAsRole('VIEWER');
    expect(await screen.findByText('Total revenue')).toBeInTheDocument();
    expect(await screen.findByText('$18,452.30')).toBeInTheDocument();
  });

  it('hides report panels (revenue trend, top products/customers, low stock) for VIEWER', async () => {
    renderAsRole('VIEWER');
    await screen.findByText('Total revenue');

    expect(screen.queryByText('Revenue trend (last 6 months)')).not.toBeInTheDocument();
    expect(screen.queryByText('Top products by units sold')).not.toBeInTheDocument();
    expect(reportsApi.getRevenueTrend).not.toHaveBeenCalled();
    expect(reportsApi.getLowStockItems).not.toHaveBeenCalled();
  });

  it('shows report panels for a role with reporting access', async () => {
    renderAsRole('MANAGER');
    await waitFor(() =>
      expect(screen.getByText('Revenue trend (last 6 months)')).toBeInTheDocument()
    );
    expect(screen.getByText('Top products by units sold')).toBeInTheDocument();
    expect(screen.getByText('Low stock alerts')).toBeInTheDocument();
  });
});
