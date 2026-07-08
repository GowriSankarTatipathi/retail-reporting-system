# syntax=docker/dockerfile:1

# ---- Build stage -------------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /workspace

# Cache dependencies separately from source so `docker build` doesn't
# reinstall the world every time application code changes.
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

COPY . .

# Vite bakes every VITE_* variable into the JS bundle at build time - there is
# no runtime injection without extra tooling (unlike a server-rendered app),
# so the backend's base URL must be known when the image is built. Override
# via `docker compose build --build-arg VITE_API_BASE_URL=...` or the
# `frontend.build.args` block in docker-compose.yml.
ARG VITE_API_BASE_URL=http://localhost:8080
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# ---- Runtime stage ------------------------------------------------------------
FROM nginx:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/dist /usr/share/nginx/html

# The official nginx:alpine image already runs its worker processes as the
# unprivileged `nginx` user (see /etc/nginx/nginx.conf's `user` directive) -
# only the master process needs root, to bind port 80. Nothing further to
# drop here.

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost:80/ >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
