# syntax=docker/dockerfile:1

# Multi-stage build for the Next.js standalone output.
# Build:  docker build -t license-management .
# Run:    docker run --rm -p 3000:3000 -v "$PWD/testdata:/data" license-management

ARG NODE_VERSION=26

FROM node:${NODE_VERSION}-alpine AS base
ENV NEXT_TELEMETRY_DISABLED=1 \
    NPM_CONFIG_UPDATE_NOTIFIER=false

# Install dependencies (cached as long as the lockfile does not change).
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

# Build the application. `npm run build` also copies static assets into
# .next/standalone (see scripts/copy-standalone-assets.mjs).
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Minimal runtime image: only the standalone server, no dev dependencies,
# runs as the unprivileged `node` user that ships with the base image.
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    DATA_DIR=/data

COPY --from=builder --chown=node:node /app/.next/standalone ./

# Master data (JSON files) lives in /data. Mount a volume there (host folder,
# Azure Files share); without one the data is lost with the container.
RUN mkdir /data && chown node:node /data
VOLUME /data

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD ["node", "-e", "fetch(`http://127.0.0.1:${process.env.PORT}/api/health`).then((r) => process.exit(r.ok ? 0 : 1), () => process.exit(1))"]

CMD ["node", "server.js"]
