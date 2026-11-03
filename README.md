# License Management (Lizenzverwaltung)

Prototype of a web application for managing license keys.

Our products ship with built-in hardware features that customers unlock in software by buying a license key. This application will let:

- **customers** manage their products and activate features with purchased license keys,
- **administrators** (our employees) manage customers, products, and license keys.

> **Status:** Iteration 1 was the project skeleton (toolchain, Docker packaging). Iteration 2 added CI/CD: every merge into `main` is tested, published to GitHub Container Registry, and deployed to Azure App Service at <https://app-licensemanager-rainer.azurewebsites.net>. Iteration 3 adds **product management**: administrators maintain products and their unlockable features, stored as JSON files on an Azure Files share. Customers and license keys follow. There is no login yet. Requirements live in [`specs/`](specs/).

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
| CI/CD       | GitHub Actions → GitHub Container Registry → Azure App Service    |

The UI is currently German. Code and technical documentation are in English.

## Getting started

```bash
npm install
npx playwright install chromium   # once, for e2e tests
npm run data:reset                # copy the test data into ./data
npm run dev                       # http://localhost:3000
```

## Common commands

```bash
npm run check      # Biome + TypeScript + unit/component tests
npm run check:version  # version in package.json is greater than on origin/main
npm run test:e2e   # Playwright against a production build (port 3100)
npm run build      # production build into .next/standalone
npm run start      # serve the production build
npm run data:reset # replace the products in ./data with the test data
```

## Project structure

```
src/
  app/              Next.js routes (pages, layouts, API route handlers)
    api/health/     liveness endpoint, reports the app version
    api/products/   product REST API
    produkte/       product management pages and their Server Actions
  components/
    ui/             design system primitives (starfinanz-ui skill)
    shell/          header and navigation
    products/       product list, detail and form
  lib/              framework-independent logic (tests next to it: *.test.ts)
    products/       product schema (Zod), file repository, save use case
testdata/           sample products to mount as data folder
mockups/            static click dummies (not deployed)
e2e/                Playwright end-to-end tests
scripts/            build, data and CI helper scripts
.github/workflows/  GitHub Actions pipelines
specs/              dated requirement snapshots (historical, not maintained)
```

## Product management

Administrators list all products, open one with its features, create and edit products including all features, deactivate them and delete them. UI routes: `/produkte`, `/produkte/neu`, `/produkte/<ID>`, `/produkte/<ID>/bearbeiten`.

### Data

Each product is one JSON file, `<DATA_DIR>/products/<ID>.json`, with its features embedded:

```json
{
  "id": "GATEWAY-IOT4",
  "description": "Industrie-Gateway mit vier Ethernet-Anschlüssen …",
  "available": true,
  "price": 2450,
  "links": ["https://docs.example.com/gateway-iot4/installation"],
  "tags": ["Industrie", "IoT"],
  "features": [
    {
      "id": "FERNWARTUNG",
      "description": "Fernzugriff für den Service …",
      "fields": [
        { "name": "Wartungsvertrag-Nr.", "type": "text" },
        { "name": "Anzahl Service-Zugänge", "type": "integer" },
        { "name": "Gültig bis", "type": "date" }
      ]
    }
  ]
}
```

- `DATA_DIR` defaults to `./data` (relative to the working directory; `npm run start` runs in `.next/standalone`). The Docker image uses `/data`, which is meant to be a volume mount.
- The schema in `src/lib/products/schema.ts` (Zod) validates every file on every read, every API request and the form. Files that fail validation are logged and left out; the product list shows a warning naming them.
- IDs are upper-case codes (`A–Z`, `0–9`, `-`, `_`, max. 20 characters) and cannot change once saved, because licenses will reference them. Field types: `text`, `integer`, `date`. Prices are EUR with at most two decimal places.
- Writes go to a temporary file that is then renamed, so readers never see half-written files. Writes are serialized in the process; the app runs as one instance.
- [`testdata/`](testdata/) holds five sample products that follow the rules of the spec.

### API

There is no authentication yet. It comes with the login iteration.

| Method   | Path                 | Description                                                                  |
| -------- | -------------------- | ---------------------------------------------------------------------------- |
| `GET`    | `/api/products`      | All products with all features, sorted by ID (no filters yet)                |
| `POST`   | `/api/products`      | Create a product including features. `201`, `400` with `issues`, `409` taken |
| `PUT`    | `/api/products/<ID>` | Replace a product including all features. `200`, `400`, `404`                |
| `DELETE` | `/api/products/<ID>` | Delete a product. `204`, `404`                                               |

```bash
curl https://app-licensemanager-rainer.azurewebsites.net/api/products
```

## Docker

```bash
docker build -t license-management .
docker run --rm -p 3000:3000 -v "$PWD/testdata:/data" license-management
curl http://localhost:3000/api/health   # {"status":"ok","version":"x.y.z"}
```

The app keeps its data in `/data`. Without a volume there, the data is lost with the container. Mounting `testdata/` directly changes the files in the repository; copy it first if you don't want that.

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

| Workflow   | Trigger                          | Jobs                                                                                       |
| ---------- | -------------------------------- | ------------------------------------------------------------------------------------------ |
| `ci.yml`   | push to any branch except `main` | `qa`: `npm run check`, version guard (`npm run check:version`)                             |
| `main.yml` | push to `main`                   | `qa`: `npm run check` + e2e tests → `publish`: image to GHCR → `deploy`: Azure App Service |

The `main` pipeline repeats the full QA because there are no pull requests that would gate a merge. It publishes the image only if QA is green, and deploys only if the image was published:

- Image: [`ghcr.io/rstropek/license-management`](https://github.com/rstropek/2026-11-02-ai-coding/pkgs/container/license-management) (public)
- Tags: `<version>` (from `package.json`, immutable), `sha-<short commit>`, and `latest`
- The pipeline fails if `<version>` already exists in the registry, so a published release is never overwritten. Bump the version on the feature branch instead.

```bash
docker run --rm -p 3000:3000 ghcr.io/rstropek/license-management:latest
curl http://localhost:3000/api/health
```

The `deploy` job logs in to Azure via OIDC, points the web app to `ghcr.io/rstropek/license-management:<version>`, and polls `/api/health` for up to 5 minutes until it reports the new version. If the new version doesn't come online, the job fails.

## Deployment

The app runs on Azure App Service (Web App for Containers):

- URL: <https://app-licensemanager-rainer.azurewebsites.net>
- Check the online version: `curl https://app-licensemanager-rainer.azurewebsites.net/api/health`

| Resource                                  | Name                          |
| ----------------------------------------- | ----------------------------- |
| Resource group (West Europe)              | `rg-licensemanagement`        |
| App Service plan (Linux, P0v4)            | `asp-licensemanagement`       |
| Web App for Containers                    | `app-licensemanager-rainer`   |
| User-assigned managed identity for GitHub | `id-licensemanagement-deploy` |
| Storage account with file share `data`    | `stlicensemgmtrainer`         |
| Key Vault (storage key for the mount)     | `kv-licensemgmt-rainer`       |

### How the resources were created

The resources were created once with the Azure CLI (no infrastructure as code, this is a prototype). To recreate them:

```bash
RG=rg-licensemanagement
PLAN=asp-licensemanagement
APP=app-licensemanager-rainer
ID=id-licensemanagement-deploy
REPO=rstropek/2026-11-02-ai-coding

az group create -n $RG -l westeurope
az appservice plan create -g $RG -n $PLAN --is-linux --sku P0V4
az webapp create -g $RG -p $PLAN -n $APP --https-only true \
  --container-registry-url https://ghcr.io \
  --container-image-name rstropek/license-management:0.1.2

# The container listens on port 3000. App Service ignores the Docker
# HEALTHCHECK, so it gets its own health check path.
az webapp config appsettings set -g $RG -n $APP --settings WEBSITES_PORT=3000
az webapp config set -g $RG -n $APP --always-on true \
  --generic-configurations '{"healthCheckPath": "/api/health"}'
az webapp log config -g $RG -n $APP --docker-container-logging filesystem

# Identity for GitHub Actions (OIDC, no secrets). It may only deploy from the
# `production` environment and only change this web app.
# GitHub issues OIDC subjects with immutable owner and repository IDs:
# repo:<owner>@<owner id>/<repo>@<repo id>:environment:<environment>
az identity create -g $RG -n $ID
OWNER_ID=$(gh api users/rstropek --jq .id)
REPO_ID=$(gh api repos/$REPO --jq .id)
az identity federated-credential create -g $RG --identity-name $ID -n github-production \
  --issuer https://token.actions.githubusercontent.com \
  --subject "repo:rstropek@$OWNER_ID/2026-11-02-ai-coding@$REPO_ID:environment:production" \
  --audiences api://AzureADTokenExchange
az role assignment create --role "Website Contributor" \
  --assignee-object-id "$(az identity show -g $RG -n $ID --query principalId -o tsv)" \
  --assignee-principal-type ServicePrincipal \
  --scope "$(az webapp show -g $RG -n $APP --query id -o tsv)"

# GitHub: `production` environment (main only) and the IDs for azure/login.
# These are identifiers, not secrets.
echo '{"deployment_branch_policy":{"protected_branches":false,"custom_branch_policies":true}}' \
  | gh api -X PUT repos/$REPO/environments/production --input -
gh api -X POST repos/$REPO/environments/production/deployment-branch-policies -f name=main -f type=branch
gh variable set AZURE_CLIENT_ID -R $REPO -b "$(az identity show -g $RG -n $ID --query clientId -o tsv)"
gh variable set AZURE_TENANT_ID -R $REPO -b "$(az account show --query tenantId -o tsv)"
gh variable set AZURE_SUBSCRIPTION_ID -R $REPO -b "$(az account show --query id -o tsv)"
```

The GHCR package is public (it inherited the visibility of the public repository), so App Service pulls the image without registry credentials. When you set the image manually, always include the `ghcr.io/` host in the image name. Without it, App Service pulls from Docker Hub.

### Persistent data (Azure Files)

The Azure Files share `data` is mounted into the container at `/data` (`DATA_DIR`), so products survive restarts and deployments.

App Service storage mounts only support storage account keys; Entra ID and RBAC are not supported for mounts ([docs](https://learn.microsoft.com/azure/app-service/configure-connect-to-azure-storage?pivots=container-linux#limitations)). To keep the key out of the app configuration, it is stored in Key Vault. The web app reads it with its system-assigned managed identity through a Key Vault reference, and the mount points to that app setting. Uploads by administrators use Entra ID (`--auth-mode login`), not the key.

```bash
RG=rg-licensemanagement
APP=app-licensemanager-rainer
SA=stlicensemgmtrainer
KV=kv-licensemgmt-rainer

az storage account create -g $RG -n $SA -l westeurope --sku Standard_LRS --kind StorageV2 \
  --https-only true --min-tls-version TLS1_2 --allow-blob-public-access false
az storage share-rm create -g $RG --storage-account $SA -n data --quota 1 --enabled-protocols SMB
az keyvault create -g $RG -n $KV -l westeurope --enable-rbac-authorization true

# The web app's identity may read secrets; you may write secrets and files.
ME=$(az ad signed-in-user show --query id -o tsv)
APP_PRINCIPAL=$(az webapp identity assign -g $RG -n $APP --query principalId -o tsv)
az role assignment create --role "Key Vault Secrets User" --assignee-object-id $APP_PRINCIPAL \
  --assignee-principal-type ServicePrincipal --scope "$(az keyvault show -n $KV --query id -o tsv)"
az role assignment create --role "Key Vault Secrets Officer" --assignee-object-id $ME \
  --assignee-principal-type User --scope "$(az keyvault show -n $KV --query id -o tsv)"
az role assignment create --role "Storage File Data Privileged Contributor" --assignee-object-id $ME \
  --assignee-principal-type User --scope "$(az storage account show -g $RG -n $SA --query id -o tsv)"

az keyvault secret set --vault-name $KV -n storage-account-key \
  --value "$(az storage account keys list -g $RG -n $SA --query '[0].value' -o tsv)" -o none

# Key Vault reference in an app setting; the mount refers to it with
# @AppSettingRef(...). The CLI cannot do this yet (az webapp config
# storage-account add only takes a plain key), so it goes through the REST API.
az webapp config appsettings set -g $RG -n $APP -o none \
  --settings "DATA_STORAGE_KEY=@Microsoft.KeyVault(VaultName=$KV;SecretName=storage-account-key)"
az rest --method put \
  --url "https://management.azure.com$(az webapp show -g $RG -n $APP --query id -o tsv)/config/azurestorageaccounts?api-version=2024-04-01" \
  --body "{\"properties\":{\"data\":{\"type\":\"AzureFiles\",\"accountName\":\"$SA\",\"shareName\":\"data\",\"mountPath\":\"/data\",\"protocol\":\"Smb\",\"accessKey\":\"@AppSettingRef(DATA_STORAGE_KEY)\"}}}"

# Upload the test data (only once, it overwrites changes made in the app).
az storage file upload-batch --account-name $SA --destination data --destination-path products \
  --source testdata/products --auth-mode login --enable-file-backup-request-intent
```

Check that the Key Vault reference resolves:

```bash
az rest --method get --url "https://management.azure.com$(az webapp show -g rg-licensemanagement -n app-licensemanager-rainer --query id -o tsv)/config/configreferences/appsettings/DATA_STORAGE_KEY?api-version=2024-04-01" --query properties.status
```

Key rotation: regenerate `key2`, store it in the secret, restart the app, then regenerate `key1`. App Service refreshes Key Vault references within 24 hours or on restart.

### Logs and cleanup

```bash
az webapp log tail -g rg-licensemanagement -n app-licensemanager-rainer   # container logs
az group delete -n rg-licensemanagement                                   # delete everything (stops all costs)
```

## Quality rules

- At the end of every coding session the code is free of errors and warnings, and all tests pass.
- Prefer unit tests over component tests over e2e tests.
- Every commit references a GitHub issue that explains what the change does and why.

Rules for coding agents are in [`AGENTS.md`](AGENTS.md).
