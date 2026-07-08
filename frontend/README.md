# Retail Reporting System - Frontend

An enterprise React SPA for the [Retail Reporting System](../README.md) backend - the
internal tool a retailer's staff would actually use to manage categories, products,
inventory, customers, and orders, and to pull sales/inventory reports. Built as a
portfolio-grade demonstration of production frontend engineering, not a tutorial CRUD UI.

[![CI](https://github.com/gowrisankar-t/retail-reporting-system/actions/workflows/ci.yml/badge.svg)](https://github.com/gowrisankar-t/retail-reporting-system/actions/workflows/ci.yml)
[![React](https://img.shields.io/badge/React-19-61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF)](https://vitejs.dev/)
[![MUI](https://img.shields.io/badge/MUI-9-007FFF)](https://mui.com/)

> Replace the CI badge URL above with your actual GitHub `owner/repo` path once pushed.

## What This Is

A single-page application that consumes the backend's versioned REST API exclusively -
no mock data, no hardcoded JSON, no invented endpoints. Every screen, table, and form
was built by reading the actual controllers and DTOs first (see the root
[`docs/api.md`](../docs/api.md)) and matching request/response shapes field-for-field.

- **Auth**: JWT access token held in memory, refresh token in `localStorage`, silent
  token refresh with request coalescing, role-based UI (`ADMIN`, `MANAGER`, `ANALYST`,
  `VIEWER`), protected/public-only routes, session-expiry handling.
- **Core screens**: dashboard with KPIs and charts, categories, products + inventory,
  customers (with order history), orders (create, status transitions, invoice view),
  reporting (sales summary, revenue trend, top products/customers, low stock, CSV/PDF
  export), admin user management, profile.
- **Enterprise UX**: light/dark theme, responsive layout, loading skeletons,
  empty/error states, toast notifications, confirm-before-destructive-action dialogs,
  unsaved-changes protection on every form, offline detection.
- **Quality**: strict TypeScript (no `any`), 19 test files / 59 tests (Vitest + React
  Testing Library), ESLint + Prettier + Husky/lint-staged, Dockerized with an Nginx
  production config, CI (lint/typecheck/test/build) on every push.

## Tech Stack

| Layer             | Choice                                                         | Why                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ----------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework         | React 19 + TypeScript (strict) + Vite                          | Fast dev server/HMR, first-class TS support, no framework lock-in the backend doesn't need (no SSR requirement - this is an authenticated internal tool, not a public marketing site)                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Routing           | React Router v7                                                | Nested layouts, lazy-loaded routes via `createBrowserRouter`, well-suited to a role-gated multi-section app                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Server state      | **TanStack Query**, not Redux Toolkit                          | Nearly everything this app renders _is_ server data (products, orders, reports...) with no complex client-only state machine to justify a global store. TanStack Query gives caching, request de-duplication, background refetch, and loading/error states for free, and eliminates an entire category of bugs (manually keeping a Redux slice in sync with the server) that Redux Toolkit would otherwise require RTK Query to solve anyway - at which point it _is_ effectively this same architecture with more ceremony. The few genuinely client-only pieces of state (auth session, theme mode) are handled with plain Context, which is all they need. |
| Component library | **MUI**, not Ant Design                                        | MUI's visual language (elevation, spacing, typography scale) reads closer to Stripe/Google-style enterprise software than Ant Design's more distinctly "admin-template" look, and its theming API made a from-scratch light/dark enterprise palette (`src/theme/`) straightforward without fighting the library's defaults.                                                                                                                                                                                                                                                                                                                                   |
| Tables            | Custom `DataTable` (TanStack Table + MUI Table primitives)     | Combines TanStack Table's headless sorting/column-visibility logic with MUI's visual components, rather than only reaching for `@mui/x-data-grid` - keeps table behavior consistent with the rest of the MUI-themed UI while still being genuinely driven by TanStack Table, not just decorative                                                                                                                                                                                                                                                                                                                                                              |
| Forms             | React Hook Form + Zod                                          | Schema validation shared in spirit with the backend's Bean Validation rules (hand-mirrored per field, documented in `src/validators/`), minimal re-renders                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Charts            | Recharts                                                       | Composable, themeable (reads MUI theme colors), sized correctly for dashboard/report panels                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| HTTP              | Axios, with a hand-built client (`src/services/api/client.ts`) | Request/response interceptors for JWT attach + silent refresh + typed error normalization - more control than a fetch wrapper for this amount of cross-cutting concern                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Notifications     | notistack                                                      | Stacked, dismissible toasts for every mutation's success/error outcome                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Testing           | Vitest + React Testing Library + jsdom                         | Vite-native (shares config/transform pipeline with the app itself), fast, and RTL's user-centric queries catch real accessibility regressions                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Tooling           | ESLint (flat config) + Prettier + Husky + lint-staged          | Consistent formatting/linting enforced at commit time, not just in CI                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |

## Project Structure

```
frontend/
├── src/
│   ├── components/       Reusable UI, grouped by feature (categories/, customers/,
│   │                     orders/, products/, reports/, forms/) plus common/ (DataTable,
│   │                     FormDialog, ConfirmDialog, EmptyState, ErrorState, ...)
│   ├── pages/             One folder per route (auth/, dashboard/, categories/,
│   │                     products/, inventory/, customers/, orders/, reports/,
│   │                     admin/, profile/, errors/)
│   ├── layouts/           AppLayout (authenticated shell: AppBar, nav drawer, account
│   │                     menu) and AuthLayout (centered card for login/register/...)
│   ├── routes/            router.tsx (route tree), ProtectedRoute, PublicOnlyRoute,
│   │                     RequireRole (per-route RBAC), lazyRoute (code splitting)
│   ├── hooks/             One hook module per domain (useAuth, useProducts,
│   │                     useOrders, useReports, useUsers, ...) - thin TanStack Query
│   │                     wrappers around services/api
│   ├── services/api/      client.ts (axios + interceptors), tokenStorage.ts,
│   │                     apiError.ts, one file per resource (products.ts,
│   │                     orders.ts, reports.ts, ...), queryKeys.ts
│   ├── contexts/          AuthContext (session state, login/logout/refresh),
│   │                     ThemeModeContext (light/dark)
│   ├── types/             Hand-mirrored request/response DTOs, one file per domain
│   ├── validators/        Zod schemas, one per form/domain
│   ├── constants/         navigation.ts (role-gated nav items), permissions.ts
│   │                     (WRITE_ROLES/DELETE_ROLES/REPORTING_ROLES - single source
│   │                     of truth for every RBAC check in the UI)
│   ├── theme/             Light/dark MUI theme + enterprise navy/slate palette
│   ├── utils/              format.ts, dateRange.ts, pagination.ts
│   └── config/             env.ts (validated env access), queryClient.ts
├── Dockerfile, nginx.conf, .dockerignore
├── eslint.config.js, .prettierrc (via package.json), vite.config.ts
└── package.json
```

## Pages & Role Access

| Page                      | Route                          | Who can view                  | Who can write                                 |
| ------------------------- | ------------------------------ | ----------------------------- | --------------------------------------------- |
| Dashboard                 | `/dashboard`                   | Everyone                      | -                                             |
| Categories                | `/categories`                  | Everyone                      | `ADMIN`, `MANAGER` (delete: `ADMIN` only)     |
| Products / Inventory      | `/products`, `/inventory`      | Everyone                      | `ADMIN`, `MANAGER`                            |
| Customers                 | `/customers`                   | Everyone                      | `ADMIN`, `MANAGER` (delete: `ADMIN` only)     |
| Orders                    | `/orders`                      | Everyone                      | Create/status transitions: `ADMIN`, `MANAGER` |
| Reports                   | `/reports`                     | `ADMIN`, `MANAGER`, `ANALYST` | -                                             |
| User administration       | `/admin/users`                 | `ADMIN` only                  | `ADMIN` only                                  |
| Profile / change password | `/profile`, `/change-password` | Everyone (own account)        | -                                             |

This exactly mirrors the backend's `@PreAuthorize` annotations (see
[`constants/permissions.ts`](src/constants/permissions.ts) and
[`routes/router.tsx`](src/routes/router.tsx)) - the UI hides actions a role can't
perform, but the backend re-validates every request regardless, so a mismatch here
would be a UX bug, never a security hole.

## Getting Started

### Option A: Docker Compose (recommended - runs the whole stack)

From the **repo root** (not this `frontend/` folder):

```bash
cp .env.example .env
# set a real JWT_SECRET (see .env.example), everything else has sane defaults

docker compose up --build
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8080` (Swagger UI: `http://localhost:8080/swagger-ui.html`)

### Option B: Run the frontend standalone against a running backend

```bash
cd frontend
cp .env.example .env
# VITE_API_BASE_URL defaults to http://localhost:8080 - point it at wherever
# your backend actually is if different

npm install     # also wires up the git commit hooks via the `prepare` script
npm run dev
```

Requires the backend to already be running somewhere reachable (see the root
[`README.md`](../README.md) for backend setup).

### Demo accounts

Log in with any of the backend's seeded accounts to see role-based UI differences
firsthand (see [`docs/api.md`](../docs/api.md#demo-accounts) for the full list):

| Email                            | Password        | Role    |
| -------------------------------- | --------------- | ------- |
| `admin@retail-reporting.local`   | `Admin@12345`   | ADMIN   |
| `manager@retail-reporting.local` | `Manager@12345` | MANAGER |
| `analyst@retail-reporting.local` | `Analyst@12345` | ANALYST |
| `viewer@retail-reporting.local`  | `Viewer@12345`  | VIEWER  |

## Environment Variables

| Variable            | Required | Default                | Purpose                                                                                                                                                                                                                                                          |
| ------------------- | -------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_API_BASE_URL` | Yes      | - (see `.env.example`) | Base URL of the backend REST API, no trailing slash. Baked into the JS bundle at **build time** - Vite inlines every `VITE_*` variable, so this can't be changed at container runtime without rebuilding the image (see `Dockerfile`'s `ARG VITE_API_BASE_URL`). |

`src/config/env.ts` fails fast with a clear error at app startup if this is missing,
rather than silently making requests to `undefined`.

## Available Scripts

| Script                            | Purpose                                                          |
| --------------------------------- | ---------------------------------------------------------------- |
| `npm run dev`                     | Start the Vite dev server with HMR                               |
| `npm run build`                   | Typecheck (`tsc -b`) then produce a production bundle in `dist/` |
| `npm run preview`                 | Serve the production build locally                               |
| `npm run lint` / `lint:fix`       | ESLint (flat config), zero warnings allowed                      |
| `npm run format` / `format:check` | Prettier                                                         |
| `npm run typecheck`               | `tsc -b --noEmit`                                                |
| `npm test`                        | Run the full Vitest suite once                                   |
| `npm run test:watch`              | Vitest in watch mode                                             |
| `npm run test:coverage`           | Vitest with v8 coverage report                                   |

## Testing

19 test files, 59 tests, spanning:

- **Pure units**: `utils/format.test.ts`, `utils/dateRange.test.ts`,
  `utils/pagination.test.ts`, `services/api/apiError.test.ts`
- **Hooks**: `hooks/useDebouncedValue.test.ts` (fake timers)
- **Standalone components**: `DataTable`, `ConfirmDialog`, `FormDialog`,
  `OfflineBanner`
- **Page-level RBAC integration tests**: Categories, Products, Customers, Orders,
  Reports, Users - each renders as multiple roles against a mocked API layer and
  asserts which actions are visible, matching the backend's actual `@PreAuthorize`
  rules
- **A critical-flow test**: `App.test.tsx` renders the real app (router +
  `AuthProvider`, no mocking of the auth flow itself), fills in and submits the login
  form, and asserts the redirect to `/dashboard` actually renders - not just that the
  pieces work in isolation

```bash
npm test               # run once
npm run test:coverage  # with coverage
```

## Docker

`Dockerfile` is a two-stage build: `node:22-alpine` installs dependencies and runs
`npm run build`, then `nginx:1.27-alpine` serves the static output. `nginx.conf`
handles client-side routing (falls back to `index.html` for any non-file path),
immutable long-term caching for Vite's content-hashed assets, gzip, and baseline
security headers.

```bash
# from the frontend/ directory
docker build -t retail-reporting-frontend --build-arg VITE_API_BASE_URL=http://localhost:8080 .
docker run -p 3000:80 retail-reporting-frontend
```

Or via the root `docker-compose.yml`, which wires this up alongside the backend,
Postgres, and Redis automatically (see Option A above).

## Screenshots

Not included in this repository - this project was built in a headless environment
without a browser available to capture real screenshots. If you're evaluating this
project, `npm run dev` (or `docker compose up`) and log in with any demo account
above to see it running. Contributions of real screenshots for this section are
welcome.

## Known Gaps / Future Improvements

Tracked in detail in the root [`ROADMAP.md`](../ROADMAP.md); frontend-relevant items:

- **Forgot/reset password** pages exist but are informational only - the backend has
  no email/SMTP infrastructure or reset-token endpoint yet, so this is honestly
  disclosed in the UI rather than faked with a "check your email" success state.
- **Inventory page** reuses `GET /products` with inventory-oriented columns/filters,
  since there's no dedicated inventory-listing endpoint yet. Inventory _adjustments_
  do hit a real endpoint (`PATCH /products/{id}/inventory`).
- **Customer/product pickers** in the create-order dialog load a single page (200
  rows) rather than a paginated type-ahead search - reasonable at this dataset's
  scale, but the first thing to revisit for a larger catalog.
- **Notifications** and **audit log** pages from the original scope were folded into
  existing screens (snackbar toasts for the former; the backend doesn't currently
  persist an audit trail for the latter) rather than built as standalone pages
  against endpoints that don't exist.

## License

[MIT](../LICENSE) © Gowri Sankar Reddy Tatipathi
