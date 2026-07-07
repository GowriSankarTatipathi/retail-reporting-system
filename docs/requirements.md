# Requirements Specification

## 1. Business Goal

Small and mid-size retailers rarely have a unified, queryable system that ties sales,
inventory, and customer data together for decision-making. Data lives in spreadsheets
or disconnected point-of-sale exports. **Retail Reporting System (RRS)** is a backend
platform that centralizes product, inventory, customer, and order data behind a secure
REST API, and layers a reporting/analytics engine on top so that operations and
management staff can answer questions like *"what sold last month?"*, *"what's about to
run out of stock?"*, and *"who are our best customers?"* without touching SQL directly.

This repository implements the backend system described in the project scope below. It
is designed as a portfolio-grade demonstration of production backend engineering:
clean architecture, a normalized relational schema, authenticated/authorized REST APIs,
a caching layer, an export-capable reporting engine, automated tests, and a CI/CD
pipeline — not a tutorial CRUD app.

## 2. Actors / Roles

| Role | Description |
|---|---|
| `ADMIN` | Full access: user management, all CRUD, all reports, system configuration. |
| `MANAGER` | Manages products, inventory, customers, orders; views all reports. |
| `ANALYST` | Read-only access to data plus full access to the reporting engine (including exports). |
| `VIEWER` | Read-only access to core data and dashboard KPIs; cannot export or mutate data. |

## 3. Functional Requirements

### 3.1 Authentication & Authorization
- FR-1: Users register with email, password, and are assigned a role (self-registration defaults to `VIEWER`; role elevation requires an `ADMIN`).
- FR-2: Users authenticate via email + password and receive a short-lived JWT access token and a longer-lived refresh token.
- FR-3: All non-public endpoints require a valid bearer token.
- FR-4: Endpoints enforce role-based access control (RBAC) at the method level.
- FR-5: Passwords are stored using a one-way adaptive hash (BCrypt), never in plaintext or reversible form.

### 3.2 Product & Category Management
- FR-6: CRUD operations on products (SKU, name, description, category, price, cost, active flag).
- FR-7: CRUD operations on categories.
- FR-8: Products support pagination, sorting, full-text search (name/SKU), and filtering (category, active status, price range).

### 3.3 Inventory Management
- FR-9: Every product has an associated inventory record (quantity on hand, reorder level, warehouse location).
- FR-10: Inventory quantity is automatically decremented when an order is placed and restored when an order is cancelled.
- FR-11: The system flags products at or below their reorder level as "low stock."

### 3.4 Customer Management
- FR-12: CRUD operations on customers (name, contact info, address).
- FR-13: Customers support search (name/email) and pagination.

### 3.5 Order Management
- FR-14: Orders are created with one or more line items, referencing existing products and customers.
- FR-15: Orders transition through a defined status lifecycle: `PENDING → PROCESSING → SHIPPED → DELIVERED`, with `CANCELLED` reachable from `PENDING`/`PROCESSING`.
- FR-16: Order totals are computed server-side from line-item quantity × unit price; client-supplied totals are never trusted.
- FR-17: Orders cannot be created for inactive products or with insufficient inventory.

### 3.6 Reporting Engine
- FR-18: Sales report: revenue and order count over a date range, grouped by day/month.
- FR-19: Top-selling products report: ranked by quantity sold and by revenue, over a date range.
- FR-20: Low-stock report: all products at/under reorder level.
- FR-21: Customer report: top customers by lifetime spend, new customer counts over time.
- FR-22: Dashboard/KPI endpoint: total revenue, order count, average order value, active customer count, low-stock count — cached for fast repeated access.
- FR-23: Sales and customer reports are exportable as CSV and PDF.

### 3.7 Cross-Cutting
- FR-24: All API errors return a structured, consistent error payload (type, message, field-level validation errors, timestamp, path).
- FR-25: All write operations are logged with actor, action, and entity reference (audit-style application logging).
- FR-26: The API is versioned (`/api/v1/...`) so breaking changes can be introduced in `/api/v2` without disrupting existing clients.

## 4. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Performance** | P95 API response time < 300ms for CRUD endpoints under nominal load (indexed queries, pagination enforced, no unbounded result sets). |
| **Scalability** | Stateless application tier (JWT, no server-side session) so the app can scale horizontally behind a load balancer; read-heavy report queries offloaded to a Redis cache. |
| **Availability** | Health/readiness endpoints (`/actuator/health`) suitable for container orchestrator probes. |
| **Security** | OWASP Top 10 mitigations: parameterized queries (JPA), BCrypt hashing, input validation, RBAC, no secrets in source control, CORS configuration, security headers. |
| **Maintainability** | Layered architecture (controller → service → repository), dependency injection, DTOs isolating persistence from API contracts, ≥ 80% line coverage target on service layer. |
| **Observability** | Structured logs, Actuator metrics, Prometheus-compatible metrics endpoint. |
| **Portability** | Fully containerized (Docker); runs identically in dev, CI, and prod via profile-based configuration and environment variables. |
| **Data Integrity** | Foreign-key constraints, check constraints, transactional order placement (all-or-nothing inventory + order writes). |

## 5. User Stories

- As an **Admin**, I want to create Manager/Analyst accounts so my team can use the system with least-privilege access.
- As a **Manager**, I want to search products by name or SKU so I can quickly update pricing.
- As a **Manager**, I want to place an order for a customer and have inventory update automatically so stock counts stay accurate without manual reconciliation.
- As an **Analyst**, I want to export last month's sales report as a PDF so I can attach it to a stakeholder email.
- As an **Analyst**, I want a top-selling-products report so I know what to reorder and promote.
- As a **Viewer**, I want a dashboard of key metrics so I can check business health at a glance without needing report-building skills.
- As a **Developer/Ops**, I want a `/actuator/health` endpoint and structured logs so I can monitor the service in production.

## 6. Scope

### In Scope
- Backend REST API, database schema, reporting engine, authentication/authorization, CSV/PDF export, Redis caching, Dockerized deployment, CI pipeline, automated tests, full documentation.

### Out of Scope (this iteration)
- Frontend/UI (API is documented and explorable via Swagger UI and a Postman collection instead — see [ROADMAP.md](../ROADMAP.md)).
- Payment processing / real POS hardware integration.
- Multi-tenant (multi-store-chain) support.
- Real-time push notifications (webhooks are noted as a future enhancement).

## 7. Assumptions

- A single deployment serves a single retail organization (single-tenant).
- Currency is a single ISO currency per deployment (no multi-currency conversion).
- Clients consuming the API are trusted to implement their own UI-level validation; the API is the authoritative validation layer regardless.
- Report date ranges are bounded by application-level limits to avoid unbounded aggregation queries (see `docs/database.md` for index strategy).

## 8. Future Scalability Considerations

See [ROADMAP.md](../ROADMAP.md) for the full list. Highlights:
- Partition `orders`/`order_items` by date range once volume grows past single-table efficiency.
- Move report aggregation to materialized views or a read-replica once report traffic contends with transactional traffic.
- Introduce an event/message bus (e.g., Kafka) for inventory and order events to decouple reporting from the transactional path entirely (CQRS-style read model).
- Add multi-tenancy via a `tenant_id` discriminator column + row-level security if the product needs to serve multiple retailers.
