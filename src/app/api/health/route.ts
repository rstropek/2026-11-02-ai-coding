import packageJson from "../../../../package.json";

/**
 * Liveness endpoint, used by the Docker HEALTHCHECK, the App Service health
 * check and the deployment pipeline. `version` is baked in at build time and
 * lets the pipeline verify that a new release is online.
 */
export function GET(): Response {
  return Response.json({ status: "ok", version: packageJson.version });
}
