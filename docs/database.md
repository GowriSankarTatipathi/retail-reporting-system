# Database Design

PostgreSQL 16. Schema is managed exclusively through versioned Flyway migrations in
`src/main/resources/db/migration/`. `spring.jpa.hibernate.ddl-auto` is `validate` in every
non-test profile — Hibernate is never allowed to auto-generate or alter schema outside
of tests, so the migration files are the single source of truth for what's in the
database.

## Migrations

| File | Purpose |
|---|---|
| `V1__init_schema.sql` | Creates all 7 tables, constraints, indexes, and two reporting views. |
| `V2__seed_reference_data.sql` | Seeds product categories and one demo user per role. |
| `V3__seed_sample_data.sql` | Seeds 15 products, inventory records, 10 customers, 60 orders, and ~160 order line items spanning Jan–Jul 2026, so reports have realistic data on first run. |

## Tables

### `users`
Authentication and authorization. One row per application user (not to be confused with
`customers`, who are retail end-customers and never log in).

| Column | Type | Notes |
|---|---|---|
| `id` | BIGSERIAL PK | |
| `email` | VARCHAR(255) UNIQUE NOT NULL | Login identifier |
| `password_hash` | VARCHAR(255) NOT NULL | BCrypt hash, never plaintext |
| `full_name` | VARCHAR(255) NOT NULL | |
| `role` | VARCHAR(20) NOT NULL | `ADMIN` \| `MANAGER` \| `ANALYST` \| `VIEWER`, enforced by CHECK constraint |
| `enabled` | BOOLEAN NOT NULL DEFAULT TRUE | Soft-disable without deleting the account |
| `created_at`, `updated_at` | TIMESTAMP | |

### `categories`
Product taxonomy (flat, single-level — sufficient for this domain; see ROADMAP for
hierarchical categories as a future enhancement).

### `products`
| Column | Notes |
|---|---|
| `sku` | UNIQUE, human-facing product code |
| `category_id` | FK → `categories.id` |
| `price` | Customer-facing sale price |
| `cost_price` | Internal cost, used for margin calculations in reports; never returned to `VIEWER`/`ANALYST` roles in API responses beyond what reports expose |
| `active` | Soft-delete flag; inactive products are excluded from new orders but remain visible in historical reports |

### `inventory`
One-to-one with `products` (`product_id` is `UNIQUE`). Kept as a separate table rather
than columns on `products` because inventory changes at a much higher write frequency
than product metadata, and it lets us apply a row lock (`SELECT ... FOR UPDATE`) scoped
to just the inventory row during order placement without locking the product record
itself.

### `customers`
Retail end-customers who place orders. Distinct entity from `users` (see above).

### `orders` / `order_items`
Classic header/line-item pattern. `orders.total_amount` is a derived/cached value —
always recomputed server-side as `SUM(order_items.subtotal)` at write time, never
trusted from client input (FR-16). `order_items.subtotal = quantity * unit_price`,
also computed server-side. `unit_price` is captured at order time (not joined live from
`products.price`) so historical orders remain accurate even if a product's price
changes later — this is deliberate denormalization for correctness, not an oversight.

## Relationships

```
categories (1) ──< (many) products (1) ──  (1) inventory
customers  (1) ──< (many) orders    (1) ──< (many) order_items >── (many) products
```

## Constraints

- Every monetary/quantity column has a `CHECK` constraint enforcing non-negativity
  (`price >= 0`, `quantity_on_hand >= 0`, etc.) — invalid data cannot enter the database
  even if application-layer validation is ever bypassed.
- `orders.status` and `users.role` are constrained to a fixed enum-like value set via
  `CHECK`, mirroring the Java enums (`OrderStatus`, `Role`) so the two can never drift
  silently.
- `ON DELETE CASCADE` on `inventory.product_id` and `order_items.order_id` /
  `order_items.product_id`... note `order_items.product_id` is **not** cascade-deleted;
  products are soft-deleted (`active = false`) rather than hard-deleted specifically so
  historical order line items are never orphaned.

## Indexing Strategy

| Index | Query it serves |
|---|---|
| `idx_products_category_id` | Filtering products by category (`GET /products?categoryId=`) |
| `idx_products_active` | Excluding inactive products from default listings |
| `idx_products_name_lower` | Case-insensitive product search |
| `idx_inventory_quantity_on_hand` | Low-stock report (`WHERE quantity_on_hand <= reorder_level`) |
| `idx_customers_last_name_lower` | Customer search |
| `idx_orders_customer_id` | Customer order history, top-customers report |
| `idx_orders_order_date` | Date-range sales reports, monthly trend aggregation |
| `idx_orders_status` | Filtering/dashboard counts by order status |
| `idx_order_items_order_id` | Loading line items for a given order |
| `idx_order_items_product_id` | Top-selling-products report |

All indexes were chosen to match an actual query in the codebase — none are speculative.
See `docs/performance.md`-equivalent notes in the main README's "Performance"
section for `EXPLAIN ANALYZE` guidance.

## Views

- **`v_low_stock_products`** — pre-joins products, inventory, and categories, filtered to
  `active = true AND quantity_on_hand <= reorder_level`. Backs the low-stock alert report.
- **`v_order_summary`** — denormalizes order + customer name/email for reporting queries
  that would otherwise repeat the same join.

## Sample Data

`V3__seed_sample_data.sql` is intentionally deterministic (seeded RNG at generation
time) rather than using `Faker`-at-migration-time, so the same dataset is produced every
time the migration runs — useful for reproducible screenshots and demo walkthroughs.
