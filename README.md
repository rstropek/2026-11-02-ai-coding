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
npm run check:version  # version in package.json is greater than on origin/main
npm run test:e2e   # Playwright against a production build (port 3100)
npm run build      # production build into .next/standalone
npm run start      # serve the production build
```

## Project structure

```
src/
  app/              Next.js routes (pages, layouts, API route handlers)
    api/health/     liveness endpoint, reports the app version
  components/       React components (tests next to them: *.test.tsx)
  lib/              framework-independent logic (tests next to it: *.test.ts)
e2e/                Playwright end-to-end tests
scripts/            build and CI helper scripts
.github/workflows/  GitHub Actions pipelines
specs/              dated requirement snapshots (historical, not maintained)
```

## Docker

```bash
docker build -t license-management .
docker run --rm -p 3000:3000 license-management
curl http://localhost:3000/api/health   # {"status":"ok","version":"x.y.z"}
```

The image uses a multi-stage build, contains only the standalone server (no dev dependencies or source), runs as the unprivileged `node` user, and has a built-in health check.

## Versioning

The app version lives in `package.json`. Every feature branch bumps the patch version once:

```bash
npm version patch --no-git-tag-version
```

`GET /api/health` returns it (`{"status":"ok","version":"x.y.z"}`), so you can check which version is running. The version is baked in at build time.

If two branches are open at the same time, the second one to be merged has to bump again after rebasing onto `main`. `npm run check:version` fails until it does.

## CI/CD

GitHub Actions workflows live in `.github/workflows/`:

| Workflow   | Trigger                          | Steps                                                                                    |
| ---------- | -------------------------------- | ---------------------------------------------------------------------------------------- |
| `ci.yml`   | push to any branch except `main` | `npm run check`, version guard (`npm run check:version`)                                 |
| `main.yml` | push to `main`                   | `qa`: `npm run check` + e2e tests → `publish`: Docker image to GitHub Container Registry |

The `main` pipeline repeats the full QA because there are no pull requests that would gate a merge. It publishes the image only if QA is green:

- Image: [`ghcr.io/rstropek/license-management`](https://github.com/rstropek/2026-11-02-ai-coding/pkgs/container/license-management) (public)
- Tags: `<version>` (from `package.json`, immutable), `sha-<short commit>`, and `latest`
- The pipeline fails if `<version>` already exists in the registry, so a published release is never overwritten. Bump the version on the feature branch instead.

```bash
docker run --rm -p 3000:3000 ghcr.io/rstropek/license-management:latest
curl http://localhost:3000/api/health
```

## Quality rules

- At the end of every coding session the code is free of errors and warnings, and all tests pass.
- Prefer unit tests over component tests over e2e tests.
- Every commit references a GitHub issue that explains what the change does and why.

Rules for coding agents are in [`AGENTS.md`](AGENTS.md).
