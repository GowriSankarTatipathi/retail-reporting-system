import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SnackbarProvider } from 'notistack';
import { describe, expect, it, vi } from 'vitest';
import CustomersPage from './CustomersPage';
import { customersApi } from '@/services/api';
import type * as ApiModule from '@/services/api';
import type { Customer, User } from '@/types';

vi.mock('@/services/api', async () => {
  const actual = await vi.importActual<typeof ApiModule>('@/services/api');
  return { ...actual, customersApi: { ...actual.customersApi, searchCustomers: vi.fn() } };
});

const mockUseAuth = vi.fn();
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

const sampleCustomer: Customer = {
  id: 1,
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
  phone: null,
  address: null,
  city: null,
  state: null,
  zipCode: null,
  createdAt: '2026-01-01T00:00:00',
};

function renderAsRole(role: User['role']) {
  mockUseAuth.mockReturnValue({
    user: { id: 1, email: 'a@b.com', fullName: 'A B', role, enabled: true, createdAt: '' },
  });
  vi.mocked(customersApi.searchCustomers).mockResolvedValue({
    content: [sampleCustomer],
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
        <CustomersPage />
      </SnackbarProvider>
    </QueryClientProvider>
  );
}

describe('CustomersPage', () => {
  it('shows order history but hides edit/delete for a VIEWER', async () => {
    renderAsRole('VIEWER');
    expect(await screen.findByText('Jane Doe')).toBeInTheDocument();

    expect(screen.queryByRole('button', { name: /new customer/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /order history/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^edit$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
  });

  it('shows edit for MANAGER but not delete (ADMIN only)', async () => {
    renderAsRole('MANAGER');
    expect(await screen.findByText('Jane Doe')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /new customer/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^edit$/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
  });

  it('shows delete for ADMIN', async () => {
    renderAsRole('ADMIN');
    expect(await screen.findByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });
});
