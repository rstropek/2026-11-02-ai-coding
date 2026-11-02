// The standalone server (output: "standalone") does not include static assets.
// Copy them next to server.js so `npm run start` and the Docker image serve
// them without a CDN. Runs automatically after `npm run build`.
import { cpSync } from "node:fs";

const target = ".next/standalone";

cpSync("public", `${target}/public`, { recursive: true });
cpSync(".next/static", `${target}/.next/static`, { recursive: true });
