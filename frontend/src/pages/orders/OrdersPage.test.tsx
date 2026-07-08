import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SnackbarProvider } from 'notistack';
import { describe, expect, it, vi } from 'vitest';
import OrdersPage from './OrdersPage';
import { ordersApi } from '@/services/api';
import type * as ApiModule from '@/services/api';
import type { Order, User } from '@/types';

vi.mock('@/services/api', async () => {
  const actual = await vi.importActual<typeof ApiModule>('@/services/api');
  return {
    ...actual,
    ordersApi: { ...actual.ordersApi, searchOrders: vi.fn() },
    customersApi: { ...actual.customersApi, searchCustomers: vi.fn() },
    productsApi: { ...actual.productsApi, searchProducts: vi.fn() },
  };
});

const mockUseAuth = vi.fn();
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

const sampleOrder: Order = {
  id: 101,
  customerId: 1,
  customerName: 'Jane Doe',
  status: 'PENDING',
  totalAmount: 59.98,
  orderDate: '2026-07-01T10:00:00',
  items: [],
  createdAt: '2026-07-01T10:00:00',
  updatedAt: '2026-07-01T10:00:00',
};

function renderAsRole(role: User['role']) {
  mockUseAuth.mockReturnValue({
    user: { id: 1, email: 'a@b.com', fullName: 'A B', role, enabled: true, createdAt: '' },
  });
  vi.mocked(ordersApi.searchOrders).mockResolvedValue({
    content: [sampleOrder],
    page: 0,
    size: 20,
    totalElements: 1,
    totalPages: 1,
    last: true,
  });

  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <SnackbarProvider>
        <OrdersPage />
      </SnackbarProvider>
    </QueryClientProvider>
  );
}

describe('OrdersPage', () => {
  it('hides "New order" for a VIEWER but still shows the order list', async () => {
    renderAsRole('VIEWER');
    expect(await screen.findByText('Jane Doe')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /new order/i })).not.toBeInTheDocument();
  });

  it('shows "New order" for MANAGER (create is ADMIN/MANAGER per OrderServiceImpl)', async () => {
    renderAsRole('MANAGER');
    expect(await screen.findByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /new order/i })).toBeInTheDocument();
  });
});
