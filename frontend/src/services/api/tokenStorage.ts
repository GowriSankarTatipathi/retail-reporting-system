/**
 * Token storage strategy and its trade-offs:
 *
 * - The access token lives only in memory (a module-level variable). It never
 *   touches localStorage/sessionStorage, so it cannot be read by a XSS payload
 *   that scans web storage - it disappears on a full page reload, which is an
 *   accepted cost (see restoreSession below for how we recover from that).
 * - The refresh token IS persisted to localStorage. This is a real trade-off:
 *   this API is a plain JSON REST API (see docs/architecture.md) with no
 *   httpOnly-cookie session support, so an in-memory-only refresh token would
 *   force a full re-login on every page reload, which is unacceptable UX for
 *   an internal retail-ops tool. localStorage is readable by any script
 *   running on this origin, so this remains a genuine XSS exposure window
 *   for the lifetime of the refresh token. Mitigations in place elsewhere:
 *   the backend's CSP-friendly design, a relatively short refresh TTL
 *   (see backend application.yml), and no eval/innerHTML usage in this app.
 *   A production hardening path is a backend-for-frontend that sets an
 *   httpOnly cookie instead - tracked in the backend ROADMAP as a future
 *   direction, out of scope for this project's stated backend/API-only design.
 */

const REFRESH_TOKEN_KEY = 'rrs.refreshToken';

let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token: string | null): void {
  if (token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

export function clearTokens(): void {
  accessToken = null;
  setRefreshToken(null);
}
