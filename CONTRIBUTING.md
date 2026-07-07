# Contributing

Thanks for considering a contribution. This is a portfolio project, but it's built and
maintained with real open-source hygiene in mind - contributions, issues, and questions
are welcome.

## Getting Set Up

1. Fork and clone the repo.
2. Copy `.env.example` to `.env` and fill in local values (see the README's Quick Start).
3. `docker compose up --build` to run the full stack, or run Postgres/Redis yourself and
   use `mvn spring-boot:run`.
4. `mvn verify` before opening a PR - this runs the full unit + integration suite.

## Branch and Commit Conventions

- Branch names: `feat/<short-description>`, `fix/<short-description>`, `docs/<short-description>`.
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/):
  `feat(scope): summary`, `fix(scope): summary`, `docs: summary`, `test: summary`,
  `chore: summary`. Look at `git log` in this repo for real examples.
- Keep commits focused - one logical change per commit. Prefer several small, well
  described commits over one giant one.

## Code Style

- Java 17, standard Spring Boot layering (see `docs/architecture.md`): controllers only
  talk to services and DTOs, never to repositories or entities directly.
- Formatting follows `.editorconfig` (4-space indents, 120-char soft line length).
- New business logic goes in `service`/`service.impl`; new HTTP-facing behavior goes in
  `controller` + a `dto/request`/`dto/response` pair - don't leak entities into the API.
- Any new endpoint needs: bean validation on its request DTO, an OpenAPI `@Operation`
  annotation, and a role check (`@PreAuthorize`) appropriate to who should call it.

## Tests

- New service logic: add/extend a Mockito-based unit test in `src/test/.../service`.
- New repository query: add a `@DataJpaTest` in `src/test/.../repository`.
- New endpoint: add or extend a `*IntegrationTest` in `src/test/.../controller` (these
  run against a real Spring context + H2, via `mvn verify`).
- Please add both a positive and at least one negative/edge-case test for new logic.

## Database Changes

Schema changes go through a new Flyway migration file
(`src/main/resources/db/migration/V<next>__description.sql`) - never edit an existing,
already-applied migration. Update `docs/database.md` alongside any schema change.

## Pull Requests

- Fill out the PR template.
- Link the issue it resolves, if any.
- Make sure `mvn verify` passes and CI is green before requesting review.
- Update `CHANGELOG.md` under an "Unreleased" heading if the change is user-facing.

## Reporting Bugs / Requesting Features

Use the issue templates in `.github/ISSUE_TEMPLATE/`. For security vulnerabilities,
please follow [`SECURITY.md`](SECURITY.md) instead of opening a public issue.

## Code of Conduct

By participating, you agree to abide by the [Code of Conduct](CODE_OF_CONDUCT.md).
