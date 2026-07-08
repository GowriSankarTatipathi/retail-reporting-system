import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SnackbarProvider } from 'notistack';
import { describe, expect, it, vi } from 'vitest';
import ProductsPage from './ProductsPage';
import { categoriesApi, productsApi } from '@/services/api';
import type * as ApiModule from '@/services/api';
import type { Product, User } from '@/types';

vi.mock('@/services/api', async () => {
  const actual = await vi.importActual<typeof ApiModule>('@/services/api');
  return {
    ...actual,
    productsApi: { ...actual.productsApi, searchProducts: vi.fn() },
    categoriesApi: { ...actual.categoriesApi, listCategories: vi.fn() },
  };
});

const mockUseAuth = vi.fn();
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

const sampleProduct: Product = {
  id: 1,
  sku: 'SKU-1',
  name: 'Wireless Mouse',
  description: null,
  categoryId: 1,
  categoryName: 'Electronics',
  price: 29.99,
  costPrice: 15,
  active: true,
  quantityOnHand: 50,
  reorderLevel: 10,
  lowStock: false,
  createdAt: '2026-01-01T00:00:00',
  updatedAt: '2026-01-01T00:00:00',
};

function renderAsRole(role: User['role']) {
  mockUseAuth.mockReturnValue({
    user: { id: 1, email: 'a@b.com', fullName: 'A B', role, enabled: true, createdAt: '' },
  });
  vi.mocked(categoriesApi.listCategories).mockResolvedValue([
    { id: 1, name: 'Electronics', description: null },
  ]);
  vi.mocked(productsApi.searchProducts).mockResolvedValue({
    content: [sampleProduct],
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
        <ProductsPage />
      </SnackbarProvider>
    </QueryClientProvider>
  );
}

describe('ProductsPage', () => {
  it('hides "New product" and row actions for a VIEWER', async () => {
    renderAsRole('VIEWER');
    expect(await screen.findByText('Wireless Mouse')).toBeInTheDocument();

    expect(screen.queryByRole('button', { name: /new product/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /adjust stock/i })).not.toBeInTheDocument();
  });

  it('shows "New product", edit, and adjust-stock actions for MANAGER', async () => {
    renderAsRole('MANAGER');
    expect(await screen.findByText('Wireless Mouse')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /new product/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /adjust stock/i })).toBeInTheDocument();
  });
});
