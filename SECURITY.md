# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please **do not** open a
public GitHub issue. Instead, email **gowrisankart12@gmail.com** with:

- A description of the vulnerability and its potential impact
- Steps to reproduce (or a proof-of-concept)
- Any suggested remediation, if you have one

You should expect an initial response within 5 business days. Once a fix is available,
the vulnerability will be disclosed responsibly, and credit will be given unless you
prefer otherwise.

## Supported Versions

| Version | Supported |
|---|---|
| 1.x (main) | Yes |

## Security Posture (What This Project Does)

- **Authentication**: stateless JWT (HMAC-SHA256), short-lived access tokens (15 min
  default) + longer-lived refresh tokens (7 days default).
- **Password storage**: BCrypt, cost factor 12. Passwords are never logged, returned in
  API responses, or stored in a reversible form.
- **Authorization**: role-based access control enforced at the service-method level
  (`@PreAuthorize`), not just at the controller/route level, so business logic can't be
  reached through an unguarded path.
- **Input validation**: every request DTO is validated with Bean Validation before it
  reaches business logic; validation failures return field-level error messages, never
  a stack trace.
- **SQL injection**: structurally prevented - the codebase uses JPA/Hibernate and
  parameterized `@Query`/Criteria API exclusively; there is no string-concatenated SQL
  anywhere in the codebase.
- **Secrets management**: no secret ever appears in source control. `.env.example`
  documents every required variable with placeholder (non-functional) values;
  `application.yml` reads all secrets from environment variables with no committed
  fallback that would work outside local dev. The app **refuses to start** if
  `JWT_SECRET` is unset (see `JwtService`).
- **CORS**: explicit allow-list (`app.cors.allowed-origins`), not a wildcard.
- **Security headers**: HSTS, `X-Frame-Options: DENY` (clickjacking protection) set via
  Spring Security's headers configuration.
- **CSRF**: intentionally disabled - this is a stateless, token-authenticated JSON API
  with no cookie/session-based auth, so CSRF (which exploits ambient browser
  credentials like cookies) does not apply. See `SecurityConfig` for the inline
  rationale.
- **Dependency hygiene**: dependency versions are pinned via the Spring Boot BOM
  (`spring-boot-starter-parent`); see ROADMAP.md for planned Dependabot/Renovate
  automation.

## Known Limitations (Tracked in ROADMAP.md)

- Refresh tokens are not currently revocable before expiry (no denylist) - logging out
  client-side does not invalidate a still-valid refresh token server-side. A
  Redis-backed denylist is planned (see ROADMAP.md).
- Rate limiting is not yet implemented on the `/api/v1/auth/*` endpoints - a
  brute-force login attempt is not currently throttled server-side beyond normal
  infrastructure-level protections.

## Demo/Seed Data Warning

The Flyway seed migrations (`V2__seed_reference_data.sql`) create four demo user
accounts with known, published passwords (documented in `docs/api.md`) purely so the
API is immediately explorable after `docker compose up`. **These are not intended for
any non-local deployment.** Disable or rotate them before deploying anywhere reachable
by the public internet.
