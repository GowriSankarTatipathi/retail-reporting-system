# API Reference

Base URL (local): `http://localhost:8080`. All endpoints are versioned under `/api/v1`.
Interactive docs: `GET /swagger-ui.html` (spec at `GET /v3/api-docs`).

## Authentication

All endpoints except `/api/v1/auth/**`, `/swagger-ui/**`, `/v3/api-docs/**`, and
`/actuator/health` require a bearer token:

```
Authorization: Bearer <accessToken>
```

### Demo Accounts

Seeded by `V2__seed_reference_data.sql` for local evaluation only (see SECURITY.md -
rotate or remove before any non-local deployment):

| Email | Password | Role |
|---|---|---|
| `admin@retail-reporting.local` | `Admin@12345` | ADMIN |
| `manager@retail-reporting.local` | `Manager@12345` | MANAGER |
| `analyst@retail-reporting.local` | `Analyst@12345` | ANALYST |
| `viewer@retail-reporting.local` | `Viewer@12345` | VIEWER |

### `POST /api/v1/auth/register`

Public. Always creates a `VIEWER` account.

```json
// Request
{ "fullName": "Jane Doe", "email": "jane@example.com", "password": "Password123" }
```

```json
// 201 Response
{
  "accessToken": "...", "refreshToken": "...", "tokenType": "Bearer",
  "expiresInSeconds": 900,
  "user": { "id": 5, "email": "jane@example.com", "fullName": "Jane Doe", "role": "VIEWER", "enabled": true, "createdAt": "..." }
}
```

### `POST /api/v1/auth/login`

Public. `{ "email": "...", "password": "..." }` -> same shape as register's 200 response.

### `POST /api/v1/auth/refresh`

Public. `{ "refreshToken": "..." }` -> new access/refresh token pair.

## Role Matrix

| Endpoint group | VIEWER | ANALYST | MANAGER | ADMIN |
|---|:---:|:---:|:---:|:---:|
| `GET` categories/products/customers/orders | Y | Y | Y | Y |
| `POST`/`PUT` categories/products/customers/orders | | | Y | Y |
| `DELETE` categories/customers | | | | Y |
| `PATCH` products inventory, order status | | | Y | Y |
| `GET /reports/*` (incl. CSV/PDF export) | | Y | Y | Y |
| `GET /dashboard/summary` | Y | Y | Y | Y |
| `GET/PATCH /users/*` | | | | Y |

## Core Resources

### Products - `GET /api/v1/products`

Query params: `categoryId`, `active` (bool), `minPrice`, `maxPrice`, `q` (free-text on
name/SKU), plus standard Spring pagination (`page`, `size`, `sort=field,asc|desc`).

```
GET /api/v1/products?categoryId=1&active=true&q=earbuds&page=0&size=20&sort=price,desc
```

### Orders - `POST /api/v1/orders`

```json
{
  "customerId": 3,
  "items": [ { "productId": 7, "quantity": 2 }, { "productId": 12, "quantity": 1 } ]
}
```

Server computes `unitPrice`/`subtotal`/`totalAmount` from current product prices at
order time - client-supplied totals are never trusted (see FR-16 in `requirements.md`).
Returns `409 Conflict` if any line item exceeds available stock; the entire order is
rolled back (no partial stock decrement).

### Order Status - `PATCH /api/v1/orders/{id}/status`

```json
{ "status": "SHIPPED" }
```

Only forward transitions are allowed (`PENDING -> PROCESSING|CANCELLED`,
`PROCESSING -> SHIPPED|CANCELLED`, `SHIPPED -> DELIVERED`). Cancelling releases
reserved stock back to inventory. Invalid transitions return `409 Conflict`.

## Reports

All under `/api/v1/reports` (ADMIN/MANAGER/ANALYST only). Add `&format=csv` or
`&format=pdf` to any of these to download instead of receiving JSON.

| Endpoint | Params |
|---|---|
| `GET /reports/sales-summary` | `start`, `end` (ISO-8601 date-time) |
| `GET /reports/revenue-trend` | `start`, `end`, `granularity=DAILY\|MONTHLY` |
| `GET /reports/top-products` | `start`, `end`, `limit`, `sortBy=quantity\|revenue` |
| `GET /reports/top-customers` | `start`, `end`, `limit` |
| `GET /reports/low-stock` | (none) |

Example:

```
GET /api/v1/reports/revenue-trend?start=2026-01-01T00:00:00&end=2026-07-01T00:00:00&granularity=MONTHLY
```

```json
[
  { "period": "2026-01", "revenue": 4821.55, "orderCount": 9 },
  { "period": "2026-02", "revenue": 5310.02, "orderCount": 11 }
]
```

## Dashboard

`GET /api/v1/dashboard/summary?lookbackDays=30` - available to every role, Redis-cached
5 minutes.

```json
{
  "totalRevenue": 18452.30, "totalOrders": 42, "averageOrderValue": 439.34,
  "activeCustomers": 9, "lowStockCount": 3, "generatedAt": "2026-07-07T10:15:00"
}
```

## Error Shape

Every non-2xx response (once past Spring Security's own filter chain - see
`docs/testing.md`) follows this contract:

```json
{
  "timestamp": "2026-07-07T10:00:00",
  "status": 409,
  "error": "Conflict",
  "message": "Insufficient stock for product 12 (requested=5, available=2)",
  "path": "/api/v1/orders",
  "fieldErrors": null
}
```

`fieldErrors` is populated only for `400` bean-validation failures, mapping field name
to a list of messages.
