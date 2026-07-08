/**
 * Centralized, validated access to build-time environment variables. Reading
 * `import.meta.env` directly all over the codebase makes it easy to typo a
 * key and silently get `undefined` at runtime - this module fails fast at
 * startup instead.
 */

function requireEnv(key: string, value: string | undefined): string {
  if (!value || value.trim() === '') {
    throw new Error(
      `Missing required environment variable "${key}". Copy .env.example to .env ` +
        'and set it (see frontend/README.md).'
    );
  }
  return value;
}

export const env = {
  apiBaseUrl: requireEnv('VITE_API_BASE_URL', import.meta.env.VITE_API_BASE_URL).replace(/\/$/, ''),
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  mode: import.meta.env.MODE,
} as const;
