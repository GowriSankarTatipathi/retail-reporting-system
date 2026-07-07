# Roadmap

This tracks planned enhancements and known scaling limits, in rough priority order.
Contributions toward any of these are welcome - see [CONTRIBUTING.md](CONTRIBUTING.md).

## Near-Term

- [ ] **Email-based password reset.** `/api/v1/auth/change-password` covers self-service
  password changes for an already-authenticated user; a true "forgot password" flow
  (emailed reset link/token) needs SMTP delivery infrastructure this deployment doesn't
  provision, so the frontend's Forgot Password page explains this instead of faking it.
- [ ] **Audit log API.** Structured access logs currently go to files/console
  (`logback-spring.xml`), not a queryable table. A persisted, filterable audit trail
  (and the admin UI to browse it) is a natural next step.
- [ ] **Granular permissions.** Authorization is role-based (4 fixed roles) rather than
  a separate permissions/claims system - sufficient for this project's scope, but a real
  permissions model would be needed for finer-grained access control.
- [ ] **Inventory adjustment history.** `InventoryService.adjust` mutates the current
  quantity directly; there's no ledger of past adjustments. A `stock_adjustments` table
  would back a real "stock history" view.
- [ ] **Notifications.** No persisted notification/inbox system exists server-side yet;
  the frontend uses ephemeral toasts for immediate feedback instead.
- [ ] **Refresh token revocation.** Add a Redis-backed denylist so logout (or an admin
  disabling a user) immediately invalidates outstanding refresh tokens, instead of
  waiting out their TTL.
- [ ] **Rate limiting on `/api/v1/auth/*`.** Throttle login/register attempts per
  IP/email to reduce brute-force exposure.
- [ ] **Dependabot/Renovate.** Automated dependency update PRs with CI-gated merges.
- [ ] **Testcontainers for a subset of integration tests.** The current test suite uses
  H2 for speed and zero external dependencies; a smaller set of tests against a real
  PostgreSQL container (via Testcontainers) would catch any Postgres-specific SQL
  behavior H2's compatibility mode doesn't perfectly emulate.

## Medium-Term

- [ ] **Hierarchical categories.** Categories are currently a flat, single-level
  taxonomy; nested categories (electronics > audio > earbuds) would better model larger
  catalogs.
- [ ] **Supplier entity.** Track supplier/vendor per product for purchase-order-style
  workflows and supplier-level reporting.
- [ ] **Webhooks / event notifications.** Notify external systems on order status
  changes or low-stock triggers, rather than requiring polling.
- [ ] **API rate limiting more broadly** (not just auth) via a token-bucket filter or
  gateway-level enforcement.
- [ ] **OpenAPI-generated client SDKs** (TypeScript/Python) published alongside releases.

## Scaling Path (When Volume Outgrows Current Design)

The current design makes a few explicit, documented trade-offs appropriate for a
single-store, moderate-transaction-volume deployment. Here's what changes if that
assumption stops holding:

- **Revenue trend bucketing** is currently done in the application tier via Java
  streams over the fetched order set (see `SalesReportServiceImpl`) rather than a
  database-side `GROUP BY`/`date_trunc`, specifically so the same code works
  identically against H2 in tests and PostgreSQL in production. Once order volume makes
  pulling the full date-range result set into the app tier too expensive, this should
  move to either a PostgreSQL-specific native query using `date_trunc`, or a
  materialized view refreshed on a schedule.
- **Table partitioning.** Partition `orders`/`order_items` by date range (e.g. monthly)
  once a single table's row count starts affecting index efficiency.
- **Read replicas.** Once reporting-query load contends with transactional (order
  placement) load on the primary, point the reporting engine's repositories at a
  read-replica connection pool.
- **CQRS / event-driven reporting.** Introduce a message bus (Kafka, or simpler,
  Postgres LISTEN/NOTIFY) to publish order/inventory events, and build the reporting
  engine against a purpose-built read model instead of querying the transactional
  schema directly. This fully decouples report-query load from order-placement load.
- **Multi-tenancy.** The schema is currently single-tenant (one retailer per
  deployment). Serving multiple retailers would require a `tenant_id` discriminator
  column across every table plus row-level security (or schema-per-tenant), and JWT
  claims would need a tenant scope.
- **Caffeine L1 cache in front of Redis.** For very hot, rarely-changing lookups
  (e.g. category list), an in-process L1 cache in front of the existing Redis L2 cache
  would shave off a network round trip; not needed at current scale.

## Explicitly Out of Scope (For Now)

- A frontend/UI - the API is documented and explorable via Swagger UI and the included
  Postman collection instead (see README "Quick Start").
- Payment processing or real POS hardware integration.
- Multi-currency support.
