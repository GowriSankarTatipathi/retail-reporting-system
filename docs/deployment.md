# Deployment

## Local (Docker Compose)

```bash
cp .env.example .env
# set a real JWT_SECRET: openssl rand -base64 64
docker compose up --build
```

This starts three containers - `app`, `postgres:16-alpine`, `redis:7-alpine` - wired
together via the compose network, with the app waiting on both dependencies' health
checks before starting (see `docker-compose.yml`).

## Building the Image Standalone

```bash
docker build -t retail-reporting-system:local .
docker run --rm -p 8080:8080 \
  -e DB_HOST=<host> -e DB_PASSWORD=<pw> -e JWT_SECRET=<secret> \
  -e REDIS_HOST=<host> \
  retail-reporting-system:local
```

The image is a multi-stage build (Maven build stage -> slim `eclipse-temurin:17-jre`
runtime), runs as a non-root user, and exposes an `/actuator/health`-based
`HEALTHCHECK`. See the `Dockerfile` for details.

## Environment Variables

See [`.env.example`](../.env.example) for the full list. At minimum, every deployment
must set: `DB_HOST`, `DB_PASSWORD`, `REDIS_HOST`, and `JWT_SECRET` (the app refuses to
start without a configured `JWT_SECRET` - see `JwtService`).

## Render

1. Create a **PostgreSQL** instance and a **Redis** instance (Render's managed Redis, or
   a Redis add-on) in the same region as your web service.
2. Create a **Web Service** from this repo, environment: **Docker**.
3. Set environment variables from `.env.example` using the connection strings Render
   provides for the Postgres/Redis instances (split host/port/db/user/password from the
   connection URL Render gives you - `application.yml` expects discrete `DB_HOST`,
   `DB_PORT`, etc., not a single JDBC URL, so map accordingly, or add a
   `SPRING_DATASOURCE_URL` override if you'd rather pass the full URL directly).
4. Health check path: `/actuator/health`.

## Railway

1. `railway init`, then add a **PostgreSQL** and a **Redis** plugin from the Railway
   dashboard - both expose their connection details as service variables automatically.
2. Deploy this repo as a service using the included `Dockerfile` (Railway auto-detects
   it).
3. Set `JWT_SECRET` and map Railway's Postgres/Redis service variables to the
   `DB_*`/`REDIS_*` variables this app expects (Railway's variable reference syntax,
   e.g. `${{Postgres.PGHOST}}`, can populate these directly in the service's variable
   editor).

## AWS (ECS Fargate, sketch)

1. Push the built image to **ECR**: `docker build -t <account>.dkr.ecr.<region>.amazonaws.com/retail-reporting-system:1.0.0 . && docker push ...`.
2. Provision **RDS PostgreSQL** and **ElastiCache Redis** in the same VPC as your
   Fargate service.
3. Define an ECS **Task Definition** using the pushed image; inject `DB_*`/`REDIS_*`/
   `JWT_SECRET` via **AWS Secrets Manager** (referenced as task-definition secrets, not
   plain environment variables, for anything sensitive).
4. Put the service behind an **Application Load Balancer**; ALB health check path
   `/actuator/health`.
5. CI/CD: extend `.github/workflows/ci.yml` with a job that builds, tags, pushes to ECR,
   and triggers an ECS service update (e.g. via `aws-actions/amazon-ecs-deploy-task-definition`).

## Azure (Container Apps, sketch)

1. Push the image to **Azure Container Registry**.
2. Provision **Azure Database for PostgreSQL - Flexible Server** and **Azure Cache for
   Redis**.
3. Create a **Container App** from the ACR image; set environment variables/secrets via
   the Container App's configuration (`DB_*`, `REDIS_*`, `JWT_SECRET` as a secret ref).
4. Container Apps' built-in ingress health probes can point at `/actuator/health`.

## Database Migrations in Production

Flyway runs automatically on application startup (`spring.flyway.enabled: true`) against
whatever `V1__init_schema.sql` onward hasn't yet been applied - there is no separate
manual migration step. For a zero-downtime rolling deploy with multiple app instances,
ensure only one instance runs migrations at a time in practice this is safe by default
because Flyway takes a database-level lock during migration, so concurrent instances
starting simultaneously will serialize rather than race.

**Do not** apply `V2`/`V3` (demo seed data + sample dataset) to a real deployment as-is;
either skip them (`spring.flyway.target` pinned to `1`) or replace them with your own
reference-data migration before going live.
