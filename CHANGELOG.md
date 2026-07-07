# Changelog

All notable changes to this project are documented here. Format loosely follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows
[Semantic Versioning](https://semver.org/).

## [Unreleased]

Nothing yet.

## [1.0.0] - 2026-07-07

### Added

- Initial public release of the Retail Reporting System backend.
- Requirements and architecture documentation (Mermaid diagrams: component, sequence,
  data flow, deployment, ERD) with a decision log.
- Normalized PostgreSQL schema (7 tables, 2 views) via versioned Flyway migrations,
  including a deterministic sample dataset (products, customers, orders spanning six
  months) for immediate demoing.
- JPA domain model, Spring Data repositories with dynamic `Specification`-based
  filtering, and DTO/mapper layer decoupled from persistence.
- Stateless JWT authentication (access + refresh tokens), BCrypt password hashing, and
  method-level RBAC across four roles (`ADMIN`, `MANAGER`, `ANALYST`, `VIEWER`).
- Full CRUD service + REST API for categories, products (+ inventory), customers, and
  orders, with transactional, stock-safe order placement and enum-driven order status
  transitions.
- Reporting engine: sales summary, revenue trend, top products, top customers,
  low-stock alerts, and a Redis-cached KPI dashboard - every report exportable as CSV
  or PDF.
- Centralized exception handling, structured request logging with correlation IDs,
  OpenAPI/Swagger documentation, and Actuator health/metrics/Prometheus endpoints.
- Unit (Mockito), repository (`@DataJpaTest`), and integration
  (`@SpringBootTest` + `TestRestTemplate`) test suites.
- Multi-stage Dockerfile, Docker Compose stack (app + Postgres + Redis), and a GitHub
  Actions CI pipeline (build, test, coverage artifact, Docker image build/verify).
- Full repository documentation set: README, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY,
  ROADMAP, and `docs/` (requirements, architecture, database, api, deployment, testing).

[Unreleased]: https://github.com/gowrisankar-t/retail-reporting-system/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/gowrisankar-t/retail-reporting-system/releases/tag/v1.0.0
