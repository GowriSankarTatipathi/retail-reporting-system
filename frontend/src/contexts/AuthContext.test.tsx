import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from './AuthContext';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/services/api';
import { getAccessToken, getRefreshToken, clearTokens } from '@/services/api/tokenStorage';
import type * as ApiModule from '@/services/api';
import type { AuthResponse } from '@/types';

vi.mock('@/services/api', async () => {
  const actual = await vi.importActual<typeof ApiModule>('@/services/api');
  return {
    ...actual,
    authApi: {
      ...actual.authApi,
      refresh: vi.fn(),
      login: vi.fn(),
    },
  };
});

function makeAuthResponse(overrides: Partial<AuthResponse> = {}): AuthResponse {
  return {
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
    ...overrides,
  };
}

/** Renders the pieces of AuthContext's state that tests need to assert on. */
function AuthProbe() {
  const { status, user, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="user">{user?.fullName ?? 'none'}</span>
      <button onClick={() => login({ email: 'jane@example.com', password: 'Password123' })}>
        login
      </button>
      <button onClick={logout}>logout</button>
    </div>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    clearTokens();
    vi.clearAllMocks();
  });

  it('starts unauthenticated when there is no stored refresh token', async () => {
    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated'));
    expect(authApi.refresh).not.toHaveBeenCalled();
  });

  it('silently restores a session when a refresh token is already stored', async () => {
    localStorage.setItem('rrs.refreshToken', 'stored-refresh-token');
    vi.mocked(authApi.refresh).mockResolvedValue(makeAuthResponse());

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('authenticated'));
    expect(screen.getByTestId('user')).toHaveTextContent('Jane Doe');
    expect(authApi.refresh).toHaveBeenCalledWith({ refreshToken: 'stored-refresh-token' });
  });

  it('falls back to unauthenticated when the stored refresh token is rejected', async () => {
    localStorage.setItem('rrs.refreshToken', 'stale-refresh-token');
    vi.mocked(authApi.refresh).mockRejectedValue(new Error('401'));

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated'));
    expect(getRefreshToken()).toBeNull();
  });

  it('login() stores tokens and flips status to authenticated', async () => {
    const user = userEvent.setup();
    vi.mocked(authApi.login).mockResolvedValue(makeAuthResponse());

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated'));

    await user.click(screen.getByText('login'));

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('authenticated'));
    expect(getAccessToken()).toBe('access-token');
    expect(getRefreshToken()).toBe('refresh-token');
  });

  it('logout() clears tokens and flips status back to unauthenticated', async () => {
    const user = userEvent.setup();
    vi.mocked(authApi.login).mockResolvedValue(makeAuthResponse());

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated'));
    await user.click(screen.getByText('login'));
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('authenticated'));

    await user.click(screen.getByText('logout'));

    expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated');
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });
});
