<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Agent guide

## Commands

| Task                                                       | Command                                           |
| ---------------------------------------------------------- | ------------------------------------------------- |
| Setup (once per machine, needed for e2e)                   | `npm install && npx playwright install chromium`  |
| Dev server                                                 | `npm run dev`                                     |
| Production build (+ copies assets into `.next/standalone`) | `npm run build`                                   |
| Run production build                                       | `npm run start` (needs `npm run build` first)     |
| Lint + format check                                        | `npm run lint` (auto-fix: `npm run lint:fix`)     |
| Type check                                                 | `npm run typecheck`                               |
| Unit + component tests                                     | `npm test` (single file: `npx vitest run <path>`) |
| E2E tests (builds and starts the app on port 3100)         | `npm run test:e2e`                                |
| Lint + typecheck + unit/component tests                    | `npm run check`                                   |
| Version is above `origin/main` (run `git fetch` first)     | `npm run check:version`                           |
| Docker image                                               | `docker build -t license-management .`            |
| Copy the test data into `./data` (default `DATA_DIR`)      | `npm run data:reset`                              |
| Architecture deck (Slidev, in `docs/architecture/`)        | `npm install && npm run dev` in that folder       |

## Rules

- Definition of done for every session: `npm run check` and `npm run test:e2e` pass with zero errors **and zero warnings**. `npm run lint` fails on Biome warnings; also resolve any Biome infos and build/test warnings, which are not enforced automatically.
- Every feature branch bumps the patch version exactly once with `npm version patch --no-git-tag-version`. If `main` has reached the same version (e.g. after a rebase), bump again. CI enforces this with `npm run check:version`.
- Pushing to `main` deploys to production automatically (`.github/workflows/main.yml`): QA → image `ghcr.io/rstropek/license-management:<version>` → Azure App Service, then it waits until `/api/health` reports the new version. Published versions are never overwritten. Azure setup and URL are in the README.
- Every commit references a GitHub issue (e.g. `Refs #12`) that describes what the change does functionally and why.
- Never commit to `main`. Work on a feature branch (`feature/<issue#>-<slug>`) and push it to origin. Don't open pull requests, and don't merge into `main` unless asked. After merging, delete the branch locally and on origin.
- Code, comments, and technical docs are in English. The UI is German (i18n is out of scope for now).
- UI work follows the design system in the `starfinanz-ui` skill.
- Test preference: unit > component > e2e. Tests sit next to the code (`*.test.ts(x)`); e2e tests live in `e2e/`.
- Change project config with tools, not by hand where possible: `npm install <pkg>`, `npm pkg set scripts.x="…"`, `npx biome migrate --write`.
- Use the latest release versions of dependencies; prereleases only when there is no suitable release.
- Persistence is the file system (JSON files in a sensible folder structure), no database. This is a prototype. Data lives in `DATA_DIR` (default `./data`, `/data` in Docker, an Azure Files mount in production); validate every read with the Zod schemas in `src/lib/`.
- Next.js keeps pages visited before in the DOM (hidden). Element IDs must be unique per instance (`useId`), never fixed strings.
- The MCP server (`src/app/api/mcp/`) uses the official SDK v2 (`@modelcontextprotocol/server`, spec 2026-07-28), not the v1 package `@modelcontextprotocol/sdk` or `mcp-handler`. It rejects older protocol versions on purpose (`legacy: "reject"`); don't add a fallback. The v2 client (`@modelcontextprotocol/client`) negotiates the 2025 era, and so fails here, unless you pass `versionNegotiation: { mode: "auto" }`.
- `docs/architecture/` is the architecture slide deck (Slidev, own `package.json`). It is maintained: when a change touches layers, interfaces, Azure resources, identities, roles, secrets or a listed risk, update the affected slides in the same branch and set `asOf` on the title slide. Slides are German (an exception to the English-docs rule, for the review audience). Facts on the slides must be verified (code, README, read-only `az` queries), never assumed. `slides.md` is excluded from Biome because Biome's Markdown formatter would rewrite Slidev's frontmatter separators and HTML blocks.
- `specs/` contains dated snapshots of requirements. They are not kept up to date, so never edit them. Biome excludes them on purpose.
- Third-party skills and agents (`brainstorming`, `impeccable` with its `impeccable-*` agents, in `.agents/`, `.claude/` and `.github/`) are vendored as installed. Don't edit them by hand; Biome excludes them on purpose.

## Maintaining this file

Agents keep this file current without being asked: update it whenever commands or rules change. Keep it short and list only what an agent can't learn by reading a handful of source files.
