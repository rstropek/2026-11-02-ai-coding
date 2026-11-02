# License Management (Lizenzverwaltung)

Prototype of a web application for managing license keys.

Our products ship with built-in hardware features that customers unlock in software by buying a license key. This application will let:

- **customers** manage their products and activate features with purchased license keys,
- **administrators** (our employees) manage customers, products, and license keys.

> **Status:** Iteration 1 is the project skeleton. It contains the toolchain, Docker packaging, and a small sample feature (a calculator that adds two numbers) that proves every test layer works. There is no license management functionality yet. Requirements live in [`specs/`](specs/).

## Tech stack

| Area        | Choice                                                            |
| ----------- | ----------------------------------------------------------------- |
| Runtime     | Node.js (24+ locally, Node 26 LTS in the Docker image), npm       |
| Framework   | Next.js 16 (App Router, Turbopack, Cache Components), React 19    |
| Language    | TypeScript 7, strict mode plus `noUncheckedIndexedAccess`         |
| Styling     | Tailwind CSS 4                                                    |
| Lint/format | Biome                                                             |
| Tests       | Vitest and Testing Library (unit and component), Playwright (e2e) |
| Persistence | JSON files on the file system (no database, it's a prototype)     |
| Delivery    | Docker image built from the Next.js `standalone` output           |

The UI is currently German. Code and technical documentation are in English.

## Getting started

```bash
npm install
npx playwright install chromium   # once, for e2e tests
npm run dev                       # http://localhost:3000
```

## Common commands

```bash
npm run check      # Biome + TypeScript + unit/component tests
npm run test:e2e   # Playwright against a production build (port 3100)
npm run build      # production build into .next/standalone
npm run start      # serve the production build
```

## Project structure

```
src/
  app/              Next.js routes (pages, layouts, API route handlers)
    api/health/     liveness endpoint used by the Docker HEALTHCHECK
  components/       React components (tests next to them: *.test.tsx)
  lib/              framework-independent logic (tests next to it: *.test.ts)
e2e/                Playwright end-to-end tests
scripts/            build helper scripts
specs/              dated requirement snapshots (historical, not maintained)
```

## Docker

```bash
docker build -t license-management .
docker run --rm -p 3000:3000 license-management
curl http://localhost:3000/api/health   # {"status":"ok"}
```

The image uses a multi-stage build, contains only the standalone server (no dev dependencies or source), runs as the unprivileged `node` user, and has a built-in health check.

## Quality rules

- At the end of every coding session the code is free of errors and warnings, and all tests pass.
- Prefer unit tests over component tests over e2e tests.
- Every commit references a GitHub issue that explains what the change does and why.

Rules for coding agents are in [`AGENTS.md`](AGENTS.md).
