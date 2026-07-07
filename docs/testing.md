# Testing Strategy

## Test Types and Where They Live

| Type | Location | Runs against | Command |
|---|---|---|---|
| Unit | `src/test/.../service/*Test.java`, `.../security/*Test.java` | Mockito mocks, no Spring context | `mvn test` |
| Repository | `src/test/.../repository/*Test.java` | `@DataJpaTest`, embedded H2 (auto-configured) | `mvn test` |
| Integration | `src/test/.../controller/*IntegrationTest.java` | `@SpringBootTest` (real HTTP, `TestRestTemplate`), H2 + simple cache via the `test` Spring profile | `mvn verify` |

Unit and repository tests run under `mvn test` (Maven Surefire, bound to the `test`
phase). Integration tests are named `*IntegrationTest` and run under Maven Failsafe,
bound to the `integration-test`/`verify` phases - so `mvn test` stays fast (no Spring
context startup) while `mvn verify` runs the complete suite.

**No external services are required to run any test.** The `test` profile
(`src/test/resources/application-test.yml`) uses H2 in Postgres-compatibility mode with
Hibernate-generated schema (Flyway disabled for tests) and Spring's simple in-memory
cache instead of Redis. This was a deliberate choice so the suite is trivially runnable
in CI or on a fresh clone without provisioning Postgres/Redis first - see
`docs/architecture.md` Decision Log and ROADMAP.md for the planned addition of a smaller
Testcontainers-based subset for Postgres-specific behavior.

## What's Covered

- **Business rules**: duplicate SKU/email/category-name rejection, category/customer
  deletion blocked while still referenced, inactive-product order rejection, order
  status transition validation (illegal transitions rejected), stock reservation
  math (including the negative-quantity guard on manual adjustments).
- **Concurrency-relevant logic**: `InventoryServiceImplTest` verifies the
  reserve/release/adjust methods never let quantity go negative and that a failed
  reservation leaves quantity unchanged (no partial application).
- **Security**: token generation/validation/expiry (`JwtServiceTest`), end-to-end
  register/login/refresh (`AuthControllerIntegrationTest`), RBAC enforcement returning
  403 for an under-privileged role (`ProductControllerIntegrationTest`), and rejecting
  unauthenticated requests with 401.
- **Negative/edge cases**: wrong password, duplicate registration, missing bearer
  token, insufficient stock on order placement, invalid order status transitions,
  deleting a category/customer that's still referenced.
- **Dynamic query building**: `ProductRepositoryTest` exercises the `Specification`
  composition (category + active + price range + free-text search) against a real
  (embedded) database rather than mocking JPA internals.

## Running Tests Locally

```bash
mvn test              # unit + repository tests
mvn verify             # everything, including *IntegrationTest classes
mvn verify -Dtest=OrderServiceImplTest         # a single unit test class
mvn verify -Dit.test=OrderControllerIntegrationTest -DfailIfNoTests=false  # a single IT
```

Coverage report (JaCoCo, configured in `pom.xml`): open
`target/site/jacoco/index.html` after `mvn verify`.

## Production Readiness Checklist

Per the project brief, nothing below is marked done unless it was actually verified in
this environment. Being transparent about what could and couldn't be checked here:

| Item | Status | Notes |
|---|---|---|
| Clean folder structure | Verified | Layered package structure per `docs/architecture.md` |
| No secrets committed | Verified | `.gitignore` excludes `.env`; only `.env.example` (placeholders) is committed; grepped the tree for the literal seed-user passwords/hashes, which are intentionally documented, not secret |
| No debug code | Verified | No `System.out.println`/commented-out code paths left in |
| No `TODO` comments | Verified | Grepped for `TODO`/`FIXME` - none present; open items are tracked in ROADMAP.md instead |
| Sample data available | Verified | `V3__seed_sample_data.sql`; sanity-checked with a Python script that recomputed every order total from its line items (0 mismatches across 60 orders / 160 line items) |
| API documentation complete | Verified | Every controller method has `@Operation`/`@Tag`; `docs/api.md` cross-checked against controller code |
| Architecture diagrams included | Verified | Mermaid diagrams in `docs/architecture.md`, render natively on GitHub |
| CI/CD pipeline configured | Written, not run | `.github/workflows/ci.yml` will execute on first push to GitHub; not yet observed green (see below) |
| Docker support | Written, not run | `Dockerfile`/`docker-compose.yml` written to the multi-stage/health-check pattern; not locally built (see below) |
| **Builds successfully** | **Not verified** | This project was authored in a sandbox with no Maven installation and no network access to Maven Central - `mvn` could not be run at all. Every file was hand-written and reviewed for syntax/API correctness (imports, method signatures, generics, Lombok annotations checked against the versions pinned in `pom.xml`), but an actual `mvn compile` has not happened yet. |
| **Tests pass** | **Not verified** | Same constraint - the test suite was written to be correct and idiomatic, but has not been executed. **Run `mvn verify` yourself as the first step after cloning.** |

If you hit a compile error or test failure, it's expected that this may need one or two
small fixes on first build in a real environment - please open an issue or PR; this is
called out explicitly rather than glossed over.
