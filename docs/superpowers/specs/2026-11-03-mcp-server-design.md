# MCP server for product data (short design)

Issue: #11. Size: a small change.

## Intent

AI assistants and agents should fetch the product master data through the Model Context Protocol instead of wrapping the REST API by hand. It is a seminar example, so the first version is deliberately small.

## Goals, non-goals

- Goal: one read-only tool, `list_products`, that returns all products with their features (same data as `GET /api/products`).
- Goal: speak the current spec, 2026-07-28 (stateless, `server/discover`, `Mcp-Method`/`Mcp-Name` headers), and only that: older protocol versions are rejected (decided after the first version, which still served 2025-era clients statelessly).
- Non-goals: 2025-11-25 and older clients, writes, filters, single-product lookup, resources, prompts, authentication (the REST API has none yet either).

## Constraints

- Next.js 16 App Router, deployed as a standalone build on Azure App Service. Data comes from `DATA_DIR` through the existing repository, validated with the Zod schema.
- Repo rules: latest releases, tests next to the code, zero warnings.

## Approaches

| Approach                                                                                 | Trade-off                                                                                                                                                | Decision               |
| ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| Official SDK `@modelcontextprotocol/server` 2.4.0, `createMcpHandler` in a route handler | Web-standard `fetch` handler fits route handlers directly; one dependency; the API the seminar should show                                               | **Chosen**             |
| `mcp-handler` (Vercel Labs)                                                              | About 100 lines of wrapper around the same SDK call; adds event hooks, WebMCP and auth helpers we don't need; Labs status, docs missing from the package | Rejected after a spike |
| Separate stdio server process                                                            | Would read the files directly, but needs local installation and doesn't reach the deployed app                                                           | Ruled out              |
| Next.js built-in `/_next/mcp`                                                            | Dev-only, serves coding agents, not app data                                                                                                             | Ruled out              |

Both SDK and `mcp-handler` were spiked; both served 2026-07-28 and 2025-11-25 clients with nearly identical code.

## Decided

- Route `src/app/api/mcp/route.ts`. The handler is created once per module; the factory builds a fresh `McpServer` per request (stateless), with `legacy: "reject"`, so an `initialize` handshake gets 400 / `-32022`. Only POST is exported; Next.js answers other methods with 405.
- `list_products` reuses `listProducts()`. The result is `{ products }` (structured content must be an object), with an `outputSchema` from the product schema and read-only annotations. The same JSON goes into the text content for clients without structured content.
- Server info: name `license-management`, version from `package.json`.

## Builder's calls

- `tools/list` carries a cache hint of 5 minutes, scope `public` (the list only changes with a deployment).
- No Host/Origin validation: it protects local servers against DNS rebinding, and the data is public through the REST API anyway. Revisit with authentication.
- Tests: unit tests drive the route with the SDK client for 2026-07-28 and check that a 2025 client is rejected; one e2e test checks the production build.
