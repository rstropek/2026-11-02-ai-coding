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
- Persistence is the file system (JSON files in a sensible folder structure), no database. This is a prototype.
- `specs/` contains dated snapshots of requirements. They are not kept up to date, so never edit them. Biome excludes them on purpose.

## Maintaining this file

Agents keep this file current without being asked: update it whenever commands or rules change. Keep it short and list only what an agent can't learn by reading a handful of source files.
