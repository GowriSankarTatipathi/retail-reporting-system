import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SnackbarProvider } from 'notistack';
import { describe, expect, it, vi } from 'vitest';
import ReportsPage from './ReportsPage';
import { reportsApi } from '@/services/api';
import type * as ApiModule from '@/services/api';

vi.mock('@/services/api', async () => {
  const actual = await vi.importActual<typeof ApiModule>('@/services/api');
  return {
    ...actual,
    reportsApi: {
      ...actual.reportsApi,
      getSalesSummary: vi.fn(),
      getRevenueTrend: vi.fn(),
      getTopProducts: vi.fn(),
      getTopCustomers: vi.fn(),
      getLowStockItems: vi.fn(),
    },
  };
});

function renderPage() {
  vi.mocked(reportsApi.getSalesSummary).mockResolvedValue({
    totalRevenue: 12500,
    totalOrders: 42,
    averageOrderValue: 297.62,
  });
  vi.mocked(reportsApi.getRevenueTrend).mockResolvedValue([
    { period: '2026-06-01', revenue: 4200, orderCount: 15 },
  ]);
  vi.mocked(reportsApi.getTopProducts).mockResolvedValue([
    { productId: 1, sku: 'SKU-1', productName: 'Wireless Mouse', quantitySold: 50, revenue: 1250 },
  ]);
  vi.mocked(reportsApi.getTopCustomers).mockResolvedValue([
    {
      customerId: 1,
      customerName: 'Jane Doe',
      email: 'jane@example.com',
      totalSpent: 899.5,
      orderCount: 4,
    },
  ]);
  vi.mocked(reportsApi.getLowStockItems).mockResolvedValue([
    {
      productId: 2,
      sku: 'SKU-2',
      productName: 'USB Cable',
      categoryName: 'Accessories',
      quantityOnHand: 3,
      reorderLevel: 10,
      warehouseLocation: 'A1',
    },
  ]);

  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <SnackbarProvider>
        <ReportsPage />
      </SnackbarProvider>
    </QueryClientProvider>
  );
}

describe('ReportsPage', () => {
  it('renders sales summary, top products/customers, and low stock with export controls', async () => {
    renderPage();

    expect(await screen.findByText('Wireless Mouse')).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('USB Cable')).toBeInTheDocument();

    // Every report panel gets its own CSV/PDF export buttons.
    expect(screen.getAllByRole('button', { name: 'CSV' })).toHaveLength(4);
    expect(screen.getAllByRole('button', { name: 'PDF' })).toHaveLength(4);
  });
});
