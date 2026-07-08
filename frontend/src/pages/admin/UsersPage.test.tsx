import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SnackbarProvider } from 'notistack';
import { describe, expect, it, vi } from 'vitest';
import UsersPage from './UsersPage';
import { usersApi } from '@/services/api';
import type * as ApiModule from '@/services/api';
import type { User } from '@/types';

vi.mock('@/services/api', async () => {
  const actual = await vi.importActual<typeof ApiModule>('@/services/api');
  return { ...actual, usersApi: { ...actual.usersApi, listUsers: vi.fn() } };
});

const mockUseAuth = vi.fn();
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

const selfAdmin: User = {
  id: 1,
  email: 'admin@retail.test',
  fullName: 'Admin One',
  role: 'ADMIN',
  enabled: true,
  createdAt: '2026-01-01T00:00:00',
};

const otherUser: User = {
  id: 2,
  email: 'viewer@retail.test',
  fullName: 'Viewer Two',
  role: 'VIEWER',
  enabled: true,
  createdAt: '2026-01-02T00:00:00',
};

function renderPage() {
  mockUseAuth.mockReturnValue({ user: selfAdmin });
  vi.mocked(usersApi.listUsers).mockResolvedValue({
    content: [selfAdmin, otherUser],
    page: 0,
    size: 20,
    totalElements: 2,
    totalPages: 1,
    last: true,
  });

  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <SnackbarProvider>
        <UsersPage />
      </SnackbarProvider>
    </QueryClientProvider>
  );
}

describe('UsersPage', () => {
  it("disables role and enabled controls for the signed-in admin's own row", async () => {
    renderPage();

    expect(await screen.findByText('Admin One')).toBeInTheDocument();
    expect(screen.getByText('Viewer Two')).toBeInTheDocument();

    const roleSelects = screen.getAllByRole('combobox');
    const switches = screen.getAllByRole('switch');

    // Row order matches the mocked response: [selfAdmin, otherUser].
    expect(roleSelects[0]).toHaveAttribute('aria-disabled', 'true');
    expect(switches[0]).toBeDisabled();

    expect(roleSelects[1]).not.toHaveAttribute('aria-disabled', 'true');
    expect(switches[1]).not.toBeDisabled();
  });
});
