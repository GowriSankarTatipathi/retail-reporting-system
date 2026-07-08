import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authApi, registerSessionExpiredHandler } from '@/services/api';
import {
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
  clearTokens,
} from '@/services/api/tokenStorage';
import type { LoginRequest, RegisterRequest, User } from '@/types';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  login: (request: LoginRequest) => Promise<void>;
  register: (request: RegisterRequest) => Promise<void>;
  logout: () => void;
  /** Re-fetches /auth/me and updates the cached user - call after profile edits. */
  refreshCurrentUser: () => Promise<void>;
  /** Lets the profile page update the in-memory user after a successful PATCH /auth/me. */
  setUser: (user: User) => void;
}

// eslint-disable-next-line react-refresh/only-export-components -- context object, not a component
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<User | null>(null);

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  // Silent session restore on load: the access token lives only in memory
  // (see tokenStorage.ts) and is gone after a full page reload, but the
  // refresh token persists in localStorage, so we can recover a session
  // without forcing the user to log in again on every refresh.
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        setStatus('unauthenticated');
        return;
      }

      try {
        const auth = await authApi.refresh({ refreshToken });
        if (cancelled) return;
        setAccessToken(auth.accessToken);
        setRefreshToken(auth.refreshToken);
        setUser(auth.user);
        setStatus('authenticated');
      } catch {
        if (cancelled) return;
        clearTokens();
        setStatus('unauthenticated');
      }
    }

    void restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  // Wired to the axios client so a 401-that-survives-refresh anywhere in the
  // app (not just on initial load) logs the user out consistently.
  useEffect(() => {
    registerSessionExpiredHandler(logout);
  }, [logout]);

  const login = useCallback(async (request: LoginRequest) => {
    const auth = await authApi.login(request);
    setAccessToken(auth.accessToken);
    setRefreshToken(auth.refreshToken);
    setUser(auth.user);
    setStatus('authenticated');
  }, []);

  const register = useCallback(async (request: RegisterRequest) => {
    const auth = await authApi.register(request);
    setAccessToken(auth.accessToken);
    setRefreshToken(auth.refreshToken);
    setUser(auth.user);
    setStatus('authenticated');
  }, []);

  const refreshCurrentUser = useCallback(async () => {
    const current = await authApi.getCurrentUser();
    setUser(current);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, login, register, logout, refreshCurrentUser, setUser }),
    [status, user, login, register, logout, refreshCurrentUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
