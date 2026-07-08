import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import { queryClient } from '@/config/queryClient';
import { authApi, dashboardApi, ordersApi } from '@/services/api';
import type * as ApiModule from '@/services/api';
import type { AuthResponse } from '@/types';
import App from './App';

vi.mock('@/services/api', async () => {
  const actual = await vi.importActual<typeof ApiModule>('@/services/api');
  return {
    ...actual,
    authApi: { ...actual.authApi, login: vi.fn() },
    dashboardApi: { ...actual.dashboardApi, getDashboardSummary: vi.fn() },
    ordersApi: { ...actual.ordersApi, searchOrders: vi.fn() },
  };
});

describe('App', () => {
  it('redirects an unauthenticated visitor to the login page', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );

    // AuthProvider's silent session-restore attempt resolves (no refresh
    // token in localStorage -> unauthenticated), ProtectedRoute redirects to
    // /login, which renders inside AuthLayout.
    expect(
      await screen.findByRole('heading', { name: /retail reporting system/i })
    ).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: /sign in/i })).toBeInTheDocument();
  });

  it('signs in with valid credentials and lands on the dashboard', async () => {
    const user = userEvent.setup();

    const authResponse: AuthResponse = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      tokenType: 'Bearer',
      expiresInSeconds: 900,
      user: {
        id: 1,
        email: 'jane@example.com',
        fullName: 'Jane Doe',
        role: 'VIEWER',
        enabled: true,
        createdAt: '2026-01-01T00:00:00',
      },
    };
    vi.mocked(authApi.login).mockResolvedValue(authResponse);
    vi.mocked(dashboardApi.getDashboardSummary).mockResolvedValue({
      totalRevenue: 1000,
      totalOrders: 10,
      averageOrderValue: 100,
      activeCustomers: 5,
      lowStockCount: 0,
      generatedAt: '2026-01-01T00:00:00',
    });
    vi.mocked(ordersApi.searchOrders).mockResolvedValue({
      content: [],
      page: 0,
      size: 5,
      totalElements: 0,
      totalPages: 0,
      last: true,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );

    await screen.findByRole('heading', { name: /sign in/i });
    await user.type(screen.getByLabelText(/email/i), 'jane@example.com');
    await user.type(screen.getByLabelText(/^password/i), 'Password123');
    await user.click(screen.getByRole('button', { name: /^sign in$/i }));

    expect(
      await screen.findByRole('heading', { name: /dashboard/i }, { timeout: 5000 })
    ).toBeInTheDocument();
    expect(authApi.login).toHaveBeenCalledWith({
      email: 'jane@example.com',
      password: 'Password123',
    });
  });
});
