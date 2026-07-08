import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SnackbarProvider } from 'notistack';
import { describe, expect, it, vi } from 'vitest';
import CategoriesPage from './CategoriesPage';
import { categoriesApi } from '@/services/api';
import type * as ApiModule from '@/services/api';
import type { User } from '@/types';

vi.mock('@/services/api', async () => {
  const actual = await vi.importActual<typeof ApiModule>('@/services/api');
  return { ...actual, categoriesApi: { ...actual.categoriesApi, listCategories: vi.fn() } };
});

const mockUseAuth = vi.fn();
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

function renderAsRole(role: User['role']) {
  mockUseAuth.mockReturnValue({
    user: { id: 1, email: 'a@b.com', fullName: 'A B', role, enabled: true, createdAt: '' },
  });
  vi.mocked(categoriesApi.listCategories).mockResolvedValue([
    { id: 1, name: 'Electronics', description: 'Devices and gadgets' },
  ]);

  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <SnackbarProvider>
        <CategoriesPage />
      </SnackbarProvider>
    </QueryClientProvider>
  );
}

describe('CategoriesPage', () => {
  it('hides "New category" and edit/delete actions for a VIEWER', async () => {
    renderAsRole('VIEWER');
    expect(await screen.findByText('Electronics')).toBeInTheDocument();

    expect(screen.queryByRole('button', { name: /new category/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
  });

  it('shows "New category" and edit for MANAGER, but not delete (ADMIN only)', async () => {
    renderAsRole('MANAGER');
    expect(await screen.findByText('Electronics')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /new category/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
  });

  it('shows delete for ADMIN', async () => {
    renderAsRole('ADMIN');
    expect(await screen.findByText('Electronics')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });
});
