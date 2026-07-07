# Architecture

## 1. Architectural Style

The system is a **modular monolith** with a strict **layered architecture**
(Controller → Service → Repository → Database). A monolith was chosen over microservices
deliberately (see §6, Decision Log) — at this scale, microservices would add operational
overhead (service discovery, distributed tracing, network calls in place of function
calls) with no corresponding benefit. The layering internally is designed so that a
future extraction into services (e.g., splitting the Reporting module out) would follow
existing seams (`service/reporting/*`) rather than requiring a rewrite.

## 2. High-Level Architecture

```mermaid
flowchart TB
    subgraph Client["Clients"]
        A[Swagger UI / API Consumers]
        B[Postman / External Systems]
    end

    subgraph App["Retail Reporting System (Spring Boot)"]
        direction TB
        GW["API Layer<br/>REST Controllers, Versioning, Validation"]
        SEC["Security Layer<br/>JWT Auth Filter, RBAC"]
        SVC["Service Layer<br/>Business Logic, Transactions"]
        REP["Reporting Engine<br/>Aggregation, CSV/PDF Export"]
        REPO["Repository Layer<br/>Spring Data JPA"]
    end

    subgraph Data["Data & Infra"]
        DB[(PostgreSQL)]
        CACHE[(Redis)]
    end

    A --> GW
    B --> GW
    GW --> SEC
    SEC --> SVC
    SVC --> REP
    SVC --> REPO
    REP --> REPO
    REP -. cached reads .-> CACHE
    REPO --> DB
```

**Why this shape:** the API layer never talks to the database directly, and the
reporting engine is a peer of the core service layer (not bolted onto controllers) so
it can be tested and cached independently of CRUD business logic.

## 3. Layered Architecture (Package Responsibilities)

```mermaid
flowchart LR
    controller["controller/<br/>HTTP concerns only:<br/>routing, status codes, DTO (de)serialization"]
    service["service/ + service.impl/<br/>Business rules, transactions,<br/>orchestration"]
    reporting["service.reporting/ + service.export/<br/>Aggregation queries,<br/>CSV/PDF generation, caching"]
    repository["repository/ + repository.specification/<br/>Spring Data JPA, dynamic queries"]
    domain["domain.entity/<br/>JPA entities, invariants"]
    dto["dto/<br/>Request/Response contracts,<br/>decoupled from entities"]
    security["security/ + config/<br/>JWT, filters, RBAC, CORS,<br/>cache/OpenAPI config"]
    exception["exception/<br/>Custom exceptions +<br/>GlobalExceptionHandler"]

    controller --> service
    controller --> dto
    service --> repository
    service --> domain
    service --> exception
    reporting --> repository
    reporting --> domain
    security -.-> controller
    exception -.-> controller
```

**Rule enforced throughout the codebase:** controllers depend on services and DTOs
only — never on repositories or entities directly. This keeps persistence details
(and any future ORM change) from leaking into the API contract.

## 4. Component Diagram

```mermaid
flowchart TB
    subgraph API
        AuthC[AuthController]
        ProdC[ProductController]
        CatC[CategoryController]
        CustC[CustomerController]
        OrdC[OrderController]
        InvC[InventoryController]
        RepC[ReportController]
        DashC[DashboardController]
    end

    subgraph Services
        AuthS[AuthService]
        ProdS[ProductService]
        CustS[CustomerService]
        OrdS[OrderService]
        InvS[InventoryService]
        SalesRep[SalesReportService]
        InvRep[InventoryReportService]
        CustRep[CustomerReportService]
        Dash[DashboardService]
        Export[ReportExportService]
    end

    subgraph Infra
        JWT[JwtService]
        Cache[(Redis Cache)]
        DB[(PostgreSQL)]
    end

    AuthC --> AuthS --> JWT
    ProdC --> ProdS --> DB
    CatC --> ProdS
    CustC --> CustS --> DB
    OrdC --> OrdS --> DB
    OrdS --> InvS
    InvC --> InvS --> DB
    RepC --> SalesRep --> DB
    RepC --> InvRep --> DB
    RepC --> CustRep --> DB
    RepC --> Export
    DashC --> Dash --> Cache
    SalesRep -. cached .-> Cache
    Dash --> DB
```

## 5. Sequence Diagram — Place an Order

```mermaid
sequenceDiagram
    actor U as Manager (JWT)
    participant C as OrderController
    participant S as OrderService
    participant I as InventoryService
    participant R as OrderRepository
    participant DB as PostgreSQL

    U->>C: POST /api/v1/orders {customerId, items[]}
    C->>C: validate DTO (bean validation)
    C->>S: createOrder(request)
    activate S
    S->>I: reserveStock(items) [within same DB transaction]
    I->>DB: SELECT inventory FOR UPDATE
    I-->>S: OK or InsufficientStockException
    S->>R: save(order + orderItems)
    R->>DB: INSERT order, order_items
    S->>I: decrementStock(items)
    I->>DB: UPDATE inventory
    DB-->>S: commit
    S-->>C: OrderResponse
    deactivate S
    C-->>U: 201 Created + OrderResponse
```

If stock reservation fails, the whole transaction rolls back — the order is never
persisted in a partially-applied state (see §7, Transaction Boundaries).

## 6. Sequence Diagram — Cached Dashboard Read

```mermaid
sequenceDiagram
    actor U as Any authenticated user
    participant C as DashboardController
    participant S as DashboardService
    participant Cache as Redis
    participant DB as PostgreSQL

    U->>C: GET /api/v1/dashboard/summary
    C->>S: getSummary()
    S->>Cache: GET dashboard::summary
    alt cache hit
        Cache-->>S: cached DashboardSummary
    else cache miss
        S->>DB: aggregate queries (revenue, orders, customers, low stock)
        DB-->>S: results
        S->>Cache: SET dashboard::summary (TTL 5m)
    end
    S-->>C: DashboardSummary
    C-->>U: 200 OK
```

## 7. Data Flow Diagram

```mermaid
flowchart LR
    Client -->|HTTPS + JWT| API[REST API]
    API -->|validated DTO| Service
    Service -->|entity ops| Repo[JPA Repository]
    Repo -->|SQL| PG[(PostgreSQL)]
    Service -->|report query| ReportEngine[Reporting Engine]
    ReportEngine -->|aggregation SQL| PG
    ReportEngine <-->|cache read/write| Redis[(Redis)]
    ReportEngine -->|CSV/PDF bytes| API
    API -->|JSON / file download| Client
```

## 8. Deployment Diagram

```mermaid
flowchart TB
    subgraph Internet
        Dev[Developer / CI]
        Consumer[API Consumer]
    end

    subgraph "Docker Compose / Container Platform"
        subgraph AppContainer["app (retail-reporting-system:1.0.0)"]
            Boot[Spring Boot JVM]
        end
        subgraph DBContainer["postgres:16"]
            PG[(retail_reporting DB)]
        end
        subgraph CacheContainer["redis:7"]
            RD[(cache)]
        end
    end

    subgraph CI["GitHub Actions"]
        Build[Build + Unit/Integration Tests]
        Image[Build & Push Docker Image]
    end

    Dev -->|git push| CI
    Build --> Image
    Consumer -->|HTTPS :8080| Boot
    Boot -->|JDBC :5432| PG
    Boot -->|Redis protocol :6379| RD
    Image -.->|deploy| AppContainer
```

Target hosts documented in `docs/deployment.md` include Render, Railway, and
AWS ECS/Azure Container Apps — all consume the same Docker image, differing only
in environment variable configuration.

## 9. Entity-Relationship Diagram

```mermaid
erDiagram
    USERS {
        bigint id PK
        varchar email UK
        varchar password_hash
        varchar role
        boolean enabled
        timestamp created_at
        timestamp updated_at
    }
    CATEGORIES {
        bigint id PK
        varchar name UK
        varchar description
    }
    PRODUCTS {
        bigint id PK
        varchar sku UK
        varchar name
        varchar description
        bigint category_id FK
        numeric price
        numeric cost_price
        boolean active
        timestamp created_at
        timestamp updated_at
    }
    INVENTORY {
        bigint id PK
        bigint product_id FK,UK
        integer quantity_on_hand
        integer reorder_level
        varchar warehouse_location
        timestamp updated_at
    }
    CUSTOMERS {
        bigint id PK
        varchar first_name
        varchar last_name
        varchar email UK
        varchar phone
        varchar address
        varchar city
        varchar state
        varchar zip_code
        timestamp created_at
    }
    ORDERS {
        bigint id PK
        bigint customer_id FK
        varchar status
        numeric total_amount
        timestamp order_date
        timestamp created_at
        timestamp updated_at
    }
    ORDER_ITEMS {
        bigint id PK
        bigint order_id FK
        bigint product_id FK
        integer quantity
        numeric unit_price
        numeric subtotal
    }

    CATEGORIES ||--o{ PRODUCTS : contains
    PRODUCTS ||--|| INVENTORY : has
    CUSTOMERS ||--o{ ORDERS : places
    ORDERS ||--|{ ORDER_ITEMS : contains
    PRODUCTS ||--o{ ORDER_ITEMS : "sold as"
```

Full column-level documentation, constraints, and index rationale live in
[`docs/database.md`](./database.md).

## 10. Transaction Boundaries

- `OrderService.createOrder()` is `@Transactional`: stock check, stock decrement, order
  insert, and order-item inserts commit or roll back together.
- Report queries are read-only transactions (`@Transactional(readOnly = true)`), which
  lets the JPA/Hibernate session skip dirty-checking overhead for large aggregation reads.
- Inventory adjustments use a pessimistic row lock (`SELECT ... FOR UPDATE` via
  `@Lock(LockModeType.PESSIMISTIC_WRITE)`) to prevent overselling under concurrent order
  placement.

## 11. Decision Log

| Decision | Alternatives Considered | Why This Choice |
|---|---|---|
| Modular monolith | Microservices | Team-of-one project at this data volume; monolith is faster to build, test, and deploy correctly. Package boundaries mirror likely future service boundaries. |
| PostgreSQL | MySQL, MongoDB | Strong relational integrity (FKs, constraints) fits normalized retail data; window functions and CTEs simplify reporting SQL; MongoDB would fight the inherently relational domain. |
| JWT (stateless) | Server-side sessions | Enables horizontal scaling without sticky sessions or a shared session store. |
| Redis for caching | In-memory (Caffeine) only | Cache survives app restarts/multi-instance deployments; Caffeine noted in ROADMAP as an optional local L1 cache in front of Redis. |
| DTOs separate from entities | Expose entities directly | Prevents accidental over-fetching/serialization of sensitive fields (e.g., password hash) and decouples API contract from schema changes. |
| Flyway migrations | Hibernate `ddl-auto=update` | Explicit, versioned, reviewable schema changes; `ddl-auto` is disabled entirely outside tests. |
| openhtmltopdf for PDF export | iText | Permissive license (LGPL/MIT-style), sufficient for HTML-templated report rendering without commercial licensing concerns. |
