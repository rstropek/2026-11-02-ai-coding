---
theme: default
title: Lizenzverwaltung – Architektur
info: Architektur der Lizenzverwaltung für Reviews. Wird mit jeder Architekturänderung gepflegt.
colorSchema: light
canvasWidth: 1100
transition: none
fonts:
  sans: Fira Sans
  serif: Source Serif 4
  mono: Fira Mono
  weights: "400,500,600"
exportFilename: architektur-lizenzverwaltung
layout: cover
asOf: 03.11.2026
environment: app-licensemanager-rainer.azurewebsites.net
---

# Architektur der Lizenzverwaltung

Software-Schichten, Azure-Ressourcen, Identitäten und Secrets, offene Risiken.

<!--
Ziel des Reviews: Ist-Stand verstehen und die offenen Risiken priorisieren.
Alle Fakten stammen aus Code, README und den Azure-Einstellungen, abgefragt am Stichtag auf der Titelfolie.
-->

---
chapter: Überblick
source: README.md · src/app
---

# Eine Next.js-Anwendung bedient drei Zugänge aus einem Datenordner

> Was ist das System, und wer greift darauf zu?

<div class="grid grid-cols-[210px_110px_1fr_130px_220px] items-center gap-y-3 mt-6">
  <Node title="Administrator:innen" icon="i-lucide-users" meta="Browser · Weboberfläche" style="grid-area: 1 / 1" />
  <div style="grid-area: 1 / 2"><Flow label="/produkte" /></div>
  <div style="grid-area: 1 / 3 / 4 / 4" class="h-full">
    <Boundary label="Azure App Service" class="h-full flex flex-col justify-center">
      <Node title="Next.js-Anwendung" icon="i-lucide-container" meta="Docker-Container · Node 26" tone="accent">
        Weboberfläche, REST-API, MCP-Server und Health-Endpunkt in einem Prozess, eine Instanz
      </Node>
    </Boundary>
  </div>
  <div style="grid-area: 2 / 4" ><Flow label="JSON lesen und schreiben" /></div>
  <div style="grid-area: 2 / 5"><Node title="Datenordner /data" icon="i-lucide-folder-tree" meta="Azure Files · Share data">Eine JSON-Datei pro Produkt</Node></div>
  <Node title="Integrationen" icon="i-lucide-plug" meta="HTTP-Clients · REST" style="grid-area: 2 / 1" />
  <div style="grid-area: 2 / 2"><Flow label="/api/products" /></div>
  <Node title="KI-Assistenten" icon="i-lucide-bot" meta="MCP-Clients · nur lesend" style="grid-area: 3 / 1" />
  <div style="grid-area: 3 / 2"><Flow label="/api/mcp" /></div>
  <Node title="Kund:innen" icon="i-lucide-users" meta="folgen mit Lizenzen" tone="quiet" style="grid-area: 4 / 1" />
  <p class="note m-0 pl-3" style="grid-area: 4 / 3 / 5 / 6">Lieferung: GitHub Actions baut das Image, legt es in <code>ghcr.io</code> ab und setzt es per OIDC in App Service.</p>
</div>

<!--
Es gibt bewusst nur einen Prozess. Kund:innen und Lizenzschlüssel sind noch nicht gebaut.
-->

---
chapter: Überblick
source: specs/2026-11-02-Projektstart.md · README.md
---

# Fünf Grundsatzentscheidungen prägen den Prototyp

> Welche Entscheidungen tragen die Architektur, und was kosten sie?

<div class="table-card mt-6">

| Entscheidung | Warum | Preis |
| --- | --- | --- |
| **JSON-Dateien statt Datenbank** | Vorgabe für den Prototyp, einfach zu prüfen und zu sichern | Keine Transaktionen, keine Abfragen, alles wird pro Request gelesen |
| **Genau eine Instanz** | Schreibzugriffe werden im Prozess serialisiert | Kein Scale-out, bevor die Persistenz umgebaut ist |
| **Docker-Image aus `standalone`** | Gleiches Artefakt lokal, in CI und in Azure | Jede Version ist ein eigenes, unveränderliches Image |
| **Azure CLI statt Infrastructure as Code** | Schneller Start, Befehle dokumentiert im README | Drift zwischen README und Azure möglich |
| **Noch kein Login** | Kommt mit der Login-Iteration | Alle Eingänge sind offen, siehe Kapitel Risiken |

</div>

---
chapter: Software
source: src/app · src/components · src/lib/products
---

# Vier Eingänge teilen sich Fachlogik und Repository

> Wie ist der Code geschichtet, und wo liegt was?

<div class="layers mt-4">
  <div class="layer-name"><strong>Eingänge</strong><span>Next.js App Router</span></div>
  <div class="layer-row grid-cols-4">
    <Node title="UI-Seiten" icon="i-lucide-layers" meta="src/app/produkte/**">Komponenten in <code>src/components</code></Node>
    <Node title="Server Actions" icon="i-lucide-workflow" meta="src/app/produkte/actions.ts">Schreiben aus den Formularen</Node>
    <Node title="REST-API" icon="i-lucide-plug" meta="src/app/api/products/**">GET, POST, PUT, DELETE</Node>
    <Node title="MCP-Server" icon="i-lucide-bot" meta="src/app/api/mcp/route.ts">Nur lesend</Node>
  </div>
  <div class="layer-name"><strong>Anwendung</strong><span>Anwendungsfälle</span></div>
  <div class="layer-row grid-cols-[1fr_1fr]">
    <Node title="saveProduct" icon="i-lucide-workflow" meta="src/lib/products/service.ts">Anlegen und Ändern, Fehler als 400, 404, 409</Node>
    <Node title="Direkter Weg" tone="quiet">Lesen, Löschen und Verfügbarkeit gehen ohne Service direkt ans Repository</Node>
  </div>
  <div class="layer-name"><strong>Domäne</strong><span>Regeln und Typen</span></div>
  <div class="layer-row">
    <Node title="Produkt-Schema (Zod)" icon="i-lucide-shield-check" meta="src/lib/products/schema.ts">Produkt, Feature, Zusatzfeld, ID-Regeln; gilt für Formular, API und jede gelesene Datei</Node>
  </div>
  <div class="layer-name"><strong>Persistenz</strong><span>Dateisystem</span></div>
  <div class="layer-row grid-cols-[1fr_1fr]">
    <Node title="Datei-Repository" icon="i-lucide-hard-drive" meta="src/lib/products/repository.ts">Schreib-Queue im Prozess, Temp-Datei und Umbenennen</Node>
    <Node title="Datenordner" icon="i-lucide-folder-tree" meta="$DATA_DIR/products/<ID>.json">Lokal <code>./data</code>, Container <code>/data</code>, Azure File Share</Node>
  </div>
</div>

<style>
.layers {
  display: grid;
  grid-template-columns: 128px 1fr;
  row-gap: 8px;
  align-items: stretch;
}
.layer-name {
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-top: 1px solid var(--lv-line-subtle);
  padding-top: 6px;
  font-size: 14px;
}
.layer-name span {
  font-size: 12px;
  color: var(--lv-ink-muted);
}
.layer-row {
  display: grid;
  gap: 8px;
  border-top: 1px solid var(--lv-line-subtle);
  padding-top: 8px;
}
</style>

<!--
Wichtig für das Review: Die Validierung sitzt in der Domäne und wird von allen Eingängen genutzt.
Lesen und Löschen sind so einfach, dass sie keinen eigenen Anwendungsfall haben.
-->

---
chapter: Software
source: src/lib/products/service.ts · repository.ts
---

# Jeder Schreibzugriff läuft durch dieselbe Prüfung

> Was passiert, wenn ein Produkt gespeichert wird?

<div class="grid grid-cols-[1fr_28px_1fr_28px_1fr_28px_1fr] items-stretch mt-7">
  <Node title="1 · Eingang" icon="i-lucide-plug" meta="Server Action · POST/PUT">Body gilt als nicht vertrauenswürdig, auch aus dem eigenen Formular</Node>
  <Flow />
  <Node title="2 · Prüfen" icon="i-lucide-shield-check" meta="productSchema.safeParse" tone="accent">Ungültig: 400 mit Feldfehlern. Die ID eines bestehenden Produkts bleibt gleich.</Node>
  <Flow />
  <Node title="3 · Einreihen" icon="i-lucide-workflow" meta="serialized(...)">Schreibzugriffe laufen nacheinander. Existiert schon: 409, fehlt: 404.</Node>
  <Flow />
  <Node title="4 · Schreiben" icon="i-lucide-file-json" meta=".<ID>.<uuid>.tmp → <ID>.json">Temp-Datei, dann Umbenennen. Leser sehen nie eine halbe Datei.</Node>
</div>

<div class="grid grid-cols-2 gap-8 mt-8">
<div>

### Beim Lesen

Jede Datei wird erneut mit Zod geprüft. Ungültige Dateien werden geloggt und ausgelassen, die Produktliste nennt sie in einer Warnung.

</div>
<div>

### Grenze dieses Modells

Die Queue gilt nur innerhalb eines Prozesses. Zwei Instanzen auf demselben File Share könnten sich überschreiben.

</div>
</div>

---
chapter: Software
source: README.md · testdata/products
---

# Ein Produkt ist eine Datei, die Features stecken darin

> Wie sind die Daten abgelegt?

<div class="grid grid-cols-[1fr_1.1fr] gap-8 mt-6">
<div>

```json
{
  "id": "GATEWAY-IOT4",
  "description": "Industrie-Gateway …",
  "available": true,
  "price": 2450,
  "links": ["https://docs.example.com/…"],
  "tags": ["Industrie", "IoT"],
  "features": [{
    "id": "FERNWARTUNG",
    "description": "Fernzugriff …",
    "fields": [
      { "name": "Gültig bis", "type": "date" }
    ]
  }]
}
```

</div>
<div>

- Pfad: `$DATA_DIR/products/<ID>.json`, Dateiname und `id` müssen übereinstimmen
- IDs: `A–Z`, `0–9`, `-`, `_`, höchstens 20 Zeichen, danach unveränderlich, weil Lizenzen sie referenzieren werden
- Feldtypen der Zusatzinformationen: `text`, `integer`, `date`
- Preise in EUR mit höchstens zwei Nachkommastellen
- Die ID-Regel verhindert Pfade wie `../`, bevor ein Dateiname gebaut wird
- Produkte werden nur als Ganzes geschrieben, nie einzelne Features

</div>
</div>

---
chapter: Software
source: src/app/api · README.md
---

# Sieben Eingänge, keiner verlangt eine Anmeldung

> Welche Schnittstellen gibt es, und wer darf sie aufrufen?

<div class="table-card mt-6">

| Eingang | Zweck | Bewertung |
| --- | --- | --- |
| `GET /api/products` | Alle Produkte mit Features, sortiert nach ID | <Status kind="low" /> |
| `POST /api/products` | Produkt anlegen: 201, 400, 409 | <Status kind="high" /> |
| `PUT /api/products/<ID>` | Produkt samt Features ersetzen: 200, 400, 404 | <Status kind="high" /> |
| `DELETE /api/products/<ID>` | Produkt löschen: 204, 404 | <Status kind="high" /> |
| Server Actions | Speichern, Verfügbarkeit, Löschen aus der UI | <Status kind="high" /> |
| `POST /api/mcp` | MCP 2026-07-28, Tool `list_products`, ältere Protokolle abgelehnt | <Status kind="low" /> |
| `GET /api/health` | Status und Version für Docker, App Service und Pipeline | <Status kind="done">Bewusst offen</Status> |

</div>

<p class="note mt-3">Kein Eingang verlangt eine Anmeldung. Schreibende Eingänge sind hoch bewertet, lesende niedrig, weil sie nur Stammdaten liefern und es noch keine Kundendaten gibt.</p>

---
chapter: Azure
source: az resource list -g rg-licensemanagement · 03.11.2026
---

# Fünf Ressourcen in einer Ressourcengruppe

> Welche Azure-Ressourcen gibt es, und wie hängen sie zusammen?

<div class="azure mt-9">
  <div style="grid-area: 1 / 3 / 5 / 6" class="rg">
    <Boundary label="rg-licensemanagement · West Europe" class="h-full" />
  </div>
  <Node title="Nutzer:innen" icon="i-lucide-globe" meta="Internet" style="grid-area: 1 / 1" />
  <div style="grid-area: 1 / 2"><Flow label="HTTPS" /></div>
  <div style="grid-area: 1 / 3 / 3 / 4" class="relative z-1 h-full">
    <Node title="Web App for Containers" icon="i-lucide-container" meta="app-licensemanager-rainer" tone="accent" class="h-full">
      Plan <code>asp-licensemanagement</code>, Linux P0v4, 1 Instanz, Port 3000, Health-Check <code>/api/health</code>, System-assigned Managed Identity
    </Node>
  </div>
  <div style="grid-area: 1 / 4" class="z-1"><Flow label="SMB-Mount /data" /></div>
  <Node title="Storage Account" icon="i-lucide-hard-drive" meta="stlicensemgmtrainer" style="grid-area: 1 / 5" class="z-1">File Share <code>data</code>, Standard LRS</Node>
  <Node title="Container-Registry" icon="i-lucide-package" meta="ghcr.io (öffentlich)" style="grid-area: 2 / 1">Image pro Version</Node>
  <div style="grid-area: 2 / 2"><Flow label="Image-Pull" /></div>
  <div style="grid-area: 2 / 4" class="z-1"><Flow label="Secret lesen" /></div>
  <Node title="Key Vault" icon="i-lucide-key-round" meta="kv-licensemgmt-rainer" style="grid-area: 2 / 5" class="z-1">Secret <code>storage-account-key</code></Node>
  <div style="grid-area: 3 / 3" class="z-1 h-full flex justify-center"><Flow dir="up" label="Website Contributor" /></div>
  <Node title="GitHub Actions" icon="i-lucide-github" meta="Umgebung production" style="grid-area: 4 / 1" />
  <div style="grid-area: 4 / 2"><Flow label="OIDC" tone="accent" /></div>
  <Node title="Managed Identity" icon="i-lucide-id-card" meta="id-licensemanagement-deploy" style="grid-area: 4 / 3" class="z-1">User-assigned, nur für Deployments</Node>
</div>

<style>
.azure {
  display: grid;
  grid-template-columns: 150px 92px 1fr 104px 200px;
  grid-template-rows: auto auto 34px auto;
  row-gap: 10px;
  align-items: center;
}
.azure .rg {
  margin: -30px -14px -14px -14px;
  align-self: stretch;
}
.azure > :not(.rg) {
  position: relative;
  z-index: 1;
}
</style>

<!--
Kein VNet, keine Private Endpoints: alle Ressourcen haben öffentliche Endpunkte. Details im Kapitel Risiken.
-->

---
chapter: Azure
source: az webapp/storage/keyvault show · 03.11.2026
---

# Jede Ressource hat genau eine Aufgabe

> Wie sind die Ressourcen konfiguriert?

<div class="table-card mt-6">

| Ressource | Typ | Konfiguration | Aufgabe |
| --- | --- | --- | --- |
| `asp-licensemanagement` | App Service Plan | Linux, P0v4, 1 Instanz, nicht zonenredundant | Rechenleistung |
| `app-licensemanager-rainer` | Web App for Containers | Image `ghcr.io/rstropek/license-management:<version>`, HTTPS only, TLS 1.2, Always On, System-MI | Betreibt die App |
| `stlicensemgmtrainer` | Storage Account | StorageV2, Standard LRS, HTTPS only, TLS 1.2, kein öffentlicher Blob-Zugriff | File Share `data` (1 GiB, SMB) |
| `kv-licensemgmt-rainer` | Key Vault | Standard, RBAC-Modus, Soft Delete 90 Tage | Hält den Storage-Key |
| `id-licensemanagement-deploy` | User-assigned Managed Identity | Federated Credential `github-production` | Deployment aus GitHub |

</div>

<p class="note mt-3">Angelegt mit der Azure CLI, die Befehle stehen im README unter „Deployment“. Es gibt kein Bicep oder Terraform.</p>

---
chapter: Azure
source: .github/workflows/ci.yml · main.yml
---

# Jede Version geht genau einmal durch Prüfung, Registry und Deployment

> Wie kommt eine Änderung in Produktion?

<div class="grid grid-cols-[1fr_60px_1fr_28px_1fr_28px_1fr] items-stretch mt-7">
  <Node title="Feature-Branch" icon="i-lucide-git-branch" meta="ci.yml">Lint, Typen, Unit-Tests, Versionsprüfung, E2E</Node>
  <Flow label="Merge" />
  <Node title="QA auf main" icon="i-lucide-shield-check" meta="main.yml · qa">Gleiche Prüfungen noch einmal, weil es keine Pull Requests gibt</Node>
  <Flow />
  <Node title="Image veröffentlichen" icon="i-lucide-package" meta="ghcr.io · publish">Tags <code>&lt;version&gt;</code>, <code>sha-…</code>, <code>latest</code>. Eine vorhandene Version bricht ab.</Node>
  <Flow />
  <Node title="Deployment" icon="i-lucide-cloud" meta="production · deploy" tone="accent">OIDC-Login, Web App auf <code>&lt;version&gt;</code> setzen, bis zu 5 Min. warten, bis <code>/api/health</code> sie meldet</Node>
</div>

<div class="grid grid-cols-3 gap-8 mt-9">
<div>

### Unveränderliche Versionen

Deployt wird der Versionstag, nie `latest`. So ist jede laufende App genau einem Image zugeordnet.

</div>
<div>

### Keine überholenden Releases

`main` läuft mit `concurrency: main-deploy` nacheinander, ohne laufende Jobs abzubrechen.

</div>
<div>

### Erfolg ist messbar

Der Job ist erst grün, wenn die neue Version online antwortet.

</div>
</div>

---
chapter: Sicherheit
source: az role assignment list · 03.11.2026
---

# Drei Identitäten, jede mit einer eng geschnittenen Rolle

> Wer darf in Azure was, und warum?

<div class="table-card mt-6">

| Identität | Art | Rolle | Scope | Wofür |
| --- | --- | --- | --- | --- |
| `id-licensemanagement-deploy` | User-assigned Managed Identity | Website Contributor | nur die Web App | Image-Version setzen aus GitHub |
| System-Identität der Web App | System-assigned Managed Identity | Key Vault Secrets User | nur der Key Vault | Storage-Key lesen |
| Betreiber:in | Entra-ID-Benutzer:in | Key Vault Secrets Officer<br>Storage File Data Privileged Contributor | Key Vault<br>Storage Account | Secret pflegen und rotieren<br>Testdaten mit Entra ID hochladen |

</div>

<div class="grid grid-cols-2 gap-8 mt-6">
<div>

### Keine Passwörter, keine Client-Secrets

Beide Maschinen-Identitäten sind Managed Identities. In GitHub liegen nur IDs als Variablen: `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`.

</div>
<div>

### Nicht auf dieser Folie

Rollen, die aus der Subscription vererbt werden (etwa Owner), sind nicht aufgeführt. Sie sollten im Review separat geprüft werden.

</div>
</div>

---
chapter: Sicherheit
source: main.yml · az identity federated-credential list
---

# Das Deployment kommt ohne gespeichertes Secret aus

> Wie meldet sich GitHub Actions bei Azure an?

<div class="grid grid-cols-[1fr_24px_1.25fr_24px_1fr_24px_1fr] items-stretch mt-7">
  <Node title="Job startet" icon="i-lucide-github" meta="environment: production">Die Umgebung erlaubt nur den Branch <code>main</code>. Der Job darf ein ID-Token anfordern (<code>id-token: write</code>).</Node>
  <Flow />
  <Node title="GitHub stellt OIDC-Token aus" icon="i-lucide-fingerprint" meta="token.actions.githubusercontent.com">Subject mit unveränderlichen IDs: <code class="break">repo:rstropek@2341573/2026-11-02-ai-coding@1443011122:environment:production</code></Node>
  <Flow tone="accent" />
  <Node title="Entra ID prüft" icon="i-lucide-shield-check" meta="github-production" tone="accent">Issuer, Subject und Audience müssen zum Federated Credential passen</Node>
  <Flow />
  <Node title="Image setzen" icon="i-lucide-container" meta="az webapp config container set">Access-Token der Managed Identity, Rolle nur auf der Web App</Node>
</div>

<div class="grid grid-cols-2 gap-8 mt-8">
<div>

### Warum Owner- und Repo-IDs im Subject

Ein umbenanntes Repository oder ein neues Repository mit gleichem Namen erhält kein Token. Nur dieses Repo, nur diese Umgebung.

</div>
<div>

### Was ein Angreifer mit dem Token könnte

Höchstens die Web App umkonfigurieren. Key Vault, Storage und die Ressourcengruppe sind für diese Identität nicht erreichbar.

</div>
</div>

---
chapter: Sicherheit
source: README.md „Persistent data“ · az webapp config · 03.11.2026
---

# Den Storage-Key kennt nur der Key Vault

> Wie kommt die App an ihre Daten, ohne ein Secret in der Konfiguration?

<div class="grid grid-cols-[1fr_76px_1.1fr_76px_1.15fr_28px_0.9fr] items-stretch mt-7">
  <Node title="Storage-Key" icon="i-lucide-key" meta="stlicensemgmtrainer · key1">Account-Key, Shared-Key-Zugriff ist aktiv</Node>
  <Flow label="einmal abgelegt" />
  <Node title="Key-Vault-Secret" icon="i-lucide-key-round" meta="storage-account-key" tone="accent">RBAC-Modus, Soft Delete 90 Tage. Lesen darf nur die System-Identität der Web App.</Node>
  <Flow label="System-MI" tone="accent" />
  <Node title="App-Setting als Referenz" icon="i-lucide-lock" meta="DATA_STORAGE_KEY">Wert: <code class="break">@Microsoft.KeyVault(VaultName=…;SecretName=…)</code>, Status <code>Resolved</code></Node>
  <Flow />
  <Node title="Mount /data" icon="i-lucide-folder-tree" meta="@AppSettingRef(…)">Azure Files über SMB im Container</Node>
</div>

<div class="grid grid-cols-2 gap-8 mt-8">
<div>

### Warum überhaupt ein Key

App-Service-Mounts unterstützen nur Account-Keys, kein Entra ID und kein RBAC. Die Referenz hält den Key wenigstens aus App-Settings, Portal-Ansichten und Exporten heraus.

</div>
<div>

### Rotation

`key2` neu erzeugen, Secret aktualisieren, App neu starten, dann `key1` neu erzeugen. App Service lädt Referenzen beim Neustart, sonst spätestens nach 24 Stunden. Heute ein manueller Ablauf.

</div>
</div>

---
chapter: Sicherheit
source: az webapp/storage/keyvault show · curl -I · 03.11.2026
---

# Fünf Vertrauensgrenzen, eine davon ganz ohne Schutz

> Wo verlaufen die Vertrauensgrenzen, und was sichert sie?

<div class="table-card mt-6">

| Grenze | Absicherung heute | Status |
| --- | --- | --- |
| Internet → Web App | HTTPS only, TLS ≥ 1.2, aber keine Anmeldung und keine Security-Header | <Status kind="high">Ungeschützt</Status> |
| GitHub Actions → Azure | OIDC mit Federated Credential, Umgebung `production`, Rolle nur auf der Web App | <Status kind="done" /> |
| Web App → Key Vault | System-assigned Managed Identity, Rolle Key Vault Secrets User | <Status kind="done" /> |
| Web App → Storage | SMB mit Account-Key, öffentlicher Endpunkt, Firewall auf „Allow“ | <Status kind="medium">Teilweise</Status> |
| Betrieb → Azure | Entra ID mit RBAC; Uploads mit `--auth-mode login` statt Key | <Status kind="done" /> |
| Deployment-Zugänge (FTP, SCM) | Basic-Auth für FTP und SCM ausgeschaltet, FTPS only | <Status kind="done" /> |

</div>

<p class="note mt-3">Die Grenze zum Internet ist die einzige ohne Authentifizierung. Die letzte Zeile betrifft die Deployment-Zugänge der Plattform selbst.</p>

---
chapter: Sicherheit
source: src/lib/products · Dockerfile · src/app/api/mcp
---

# Im Code ist die Eingabe schon gut abgesichert

> Was schützt die Anwendung selbst, unabhängig von Azure?

<div class="grid grid-cols-2 gap-10 mt-6">
<div>

### Eingaben

- Zod prüft an jeder Grenze: Formular, REST-API, Server Actions und jede gelesene Datei
- Server Actions gelten als öffentliche Endpunkte und werden genauso geprüft wie die API
- IDs nur aus `A–Z0–9-_`, das schließt Pfadmanipulation beim Dateinamen aus
- Ungültiges JSON und fremde Dateien führen zu 400 bzw. werden übersprungen, nie zu Absturz

</div>
<div>

### Laufzeit und Lieferung

- Container läuft als unprivilegierter User `node`, nur der `standalone`-Server ist im Image
- Fehlermeldungen an Nutzer:innen ohne technische Details, Details nur im Log
- MCP-Server ist zustandslos und nur lesend, Tool mit `readOnlyHint`
- Abhängigkeiten in aktuellen Release-Versionen, `npm ci` gegen Lockfile

</div>
</div>

---
chapter: Risiken
source: Abfragen und Code-Stand vom 03.11.2026
---

# Das größte Risiko ist der fehlende Login

> Welche Sicherheitsrisiken sind offen, und was schlagen wir vor?

<div class="table-card mt-6 risks">

| Risiko | Bewertung | Vorschlag |
| --- | --- | --- |
| **Keine Authentifizierung.** Jede:r im Internet kann über UI, REST und Server Actions Produkte anlegen, ändern und löschen. | <Status kind="high" /> | Login mit Entra ID, Rollen Admin und Kunde, Prüfung in der Service-Schicht; API und MCP mit OAuth-Token |
| **Alles öffentlich erreichbar.** Web App und SCM „Allow all“, Storage-Firewall „Allow“, Key Vault mit öffentlichem Zugriff. | <Status kind="medium" /> | VNet-Integration, Private Endpoints für Storage und Key Vault, SCM auf Pipeline und Admins beschränken |
| **Keine Security-Header.** Kein CSP, HSTS oder X-Frame-Options; `X-Powered-By: Next.js` wird gesendet. | <Status kind="medium" /> | `headers()` und `poweredByHeader: false` in `next.config.ts` |
| **Account-Key mit manueller Rotation.** Shared-Key-Zugriff muss für den Mount aktiv bleiben. | <Status kind="medium" /> | Rotation automatisieren oder fest terminieren; Ablaufdatum am Secret |
| **Purge Protection aus.** Ein gelöschter Key Vault kann endgültig entfernt werden. | <Status kind="low" /> | Purge Protection einschalten |

</div>

<style>
.risks td:nth-child(2) { width: 92px; }
.risks td:nth-child(3) { width: 36%; }
</style>

---
chapter: Risiken
source: Abfragen und Code-Stand vom 03.11.2026
---

# Im Betrieb fehlen Nachvollziehbarkeit und Backup

> Welche Betriebsrisiken sind offen?

<div class="table-card mt-6 risks">

| Risiko | Bewertung | Vorschlag |
| --- | --- | --- |
| **Kein Backup der Daten.** File Share auf Standard LRS, keine Snapshots oder Azure Backup. Ein falsches Löschen ist endgültig. | <Status kind="medium" /> | Azure Backup für Azure Files oder geplante Share-Snapshots |
| **Kein Monitoring.** Kein Application Insights, keine Diagnoseeinstellungen für Key Vault und Storage, Logs nur im Container-Dateisystem. | <Status kind="medium" /> | Log Analytics Workspace, Application Insights, Diagnoseeinstellungen, Alarm auf Health-Check |
| **Keine Infrastructure as Code.** Ressourcen wurden per CLI angelegt; Abweichungen fallen niemandem auf. | <Status kind="medium" /> | Bicep im Repository, `what-if` in der Pipeline |
| **Eine Instanz ohne Zonenredundanz.** Die Schreib-Queue im Prozess verhindert Scale-out. | <Status kind="low">Bewusst</Status> | Mit dem Umstieg auf eine Datenbank auflösen |

</div>

<style>
.risks td:nth-child(2) { width: 92px; }
.risks td:nth-child(3) { width: 36%; }
</style>

---
chapter: Risiken
source: Vorschlag zur Diskussion
---

# Vorgeschlagene Reihenfolge der Maßnahmen

> Was gehen wir zuerst an?

<div class="steps mt-6">
  <div class="step"><span class="num">1</span><div><strong>Login und Autorisierung</strong><p>Entra ID für Admins und Kund:innen, Rollenprüfung in der Service-Schicht, OAuth für REST und MCP. Schließt das einzige hohe Risiko.</p></div></div>
  <div class="step"><span class="num">2</span><div><strong>Security-Header</strong><p>Kleine Änderung in <code>next.config.ts</code>, sofort wirksam.</p></div></div>
  <div class="step"><span class="num">3</span><div><strong>Backup und Monitoring</strong><p>Daten sichern, Fehler sehen, bevor Kund:innen sie melden.</p></div></div>
  <div class="step"><span class="num">4</span><div><strong>Infrastructure as Code</strong><p>Bicep für die fünf Ressourcen; Grundlage für die Netzwerkänderungen.</p></div></div>
  <div class="step"><span class="num">5</span><div><strong>Netzwerk abschotten</strong><p>VNet-Integration und Private Endpoints für Storage und Key Vault, SCM beschränken.</p></div></div>
  <div class="step"><span class="num">6</span><div><strong>Key-Rotation und Purge Protection</strong><p>Rotation automatisieren, Key Vault vor endgültigem Löschen schützen.</p></div></div>
</div>

<style>
.steps {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 40px;
}
.step {
  display: grid;
  grid-template-columns: 30px 1fr;
  gap: 10px;
  border-top: 1px solid var(--lv-line-subtle);
  padding-top: 10px;
}
.step .num {
  font-family: "Source Serif 4", ui-serif, Georgia, serif;
  font-size: 22px;
  font-weight: 600;
  line-height: 1;
  color: var(--lv-primary-strong);
}
.step strong {
  font-size: 15px;
}
.step p {
  margin: 3px 0 0;
  font-size: 13px;
  color: var(--lv-ink-muted);
}
</style>

<!--
Reihenfolge nach Risiko und Aufwand. IaC vor dem Netzwerkumbau, weil VNet und Private Endpoints viele Ressourcen anfassen.
-->

---
chapter: Risiken
source: docs/architecture/README.md
---

# Fragen und Diskussion

> Was fehlt, was sehen Sie anders?

<div class="grid grid-cols-2 gap-10 mt-8">
<div>

### Woher die Fakten stammen

- Code und Konfiguration im Repository
- README, Abschnitte „Deployment“ und „CI/CD“
- Lesende `az`-Abfragen und HTTP-Header der Produktion zum Stand auf der Titelfolie

</div>
<div>

### Wie das Deck aktuell bleibt

- Liegt in `docs/architecture/slides.md` neben dem Code
- Jede Architekturänderung aktualisiert die betroffenen Folien im selben Branch
- Lokal ansehen: `npm run dev` im Ordner `docs/architecture`

</div>
</div>
