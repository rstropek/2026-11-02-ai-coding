---

version: 1
slug: "docs-architecture-slides-md"
primary_target: "docs/architecture/slides.md"
related_targets: []
---

# Surface brief: architecture review deck

Scope: Slidev deck for architecture reviews (`docs/architecture/`), maintained in the repo alongside the code. Mode: Read.
Audience: architects, developers and security reviewers; presenter is the project lead. Language German, technical terms in English (assumed; question to the user went unanswered).
Task: understand the software layers, the Azure resources, identities, secrets and trust boundaries, and the open risks with proposed measures. Facts come from code, README and the live Azure configuration (read 2026-11-03).
Constraints: starfinanz-ui identity (magenta actions/focus, plum serif titles, Fira Sans/Mono, warm grays, 8px corners, brand-red only in the wordmark, status never color alone). Light only. No Star Finanz logo. Must stay easy to edit in Markdown when the architecture changes.
Unresolved: review audience and language unconfirmed; no login exists yet (shown as gap).

## Direction contract

THESIS: Every content slide answers one question a reviewer asks: the answer as the serif title, the question in one muted line below it, the evidence underneath. Refuses the bullet-list deck with a logo cover and a clip-art Azure diagram.
OWN-WORLD: starfinanz-ui unchanged: white slide on #f5f5f5 canvas band, plum Source Serif titles, Fira Sans body, Fira Mono for resource names, roles and paths, hairline warm-gray lines, 8px cards, magenta only for the active chapter, trust-boundary strokes and the one highlighted path; status chips with text labels.
STORY: The reviewer sees the system in one picture, walks down the layers, then the Azure resources, then each identity and secret path, and leaves with an honest risk list and next steps.
FIRST VIEWPORT: Cover: wordmark with red bar top left, serif title "Lizenzverwaltung – Architektur" large, subtitle, version and date as mono facts, the five chapters listed as the agenda. Content slides: chapter rail top (five chapters, current one plum text with magenta underbar), serif answer title, muted question line under it, diagram or table filling the rest, source line bottom left.
FORM: question-led reference deck, position 5 on my list (dealt lead). Signature: the chapter rail, a wayfinding band (raise from the declined airport-signage challenger: each slide shows only where the reader stands and what comes next). Diagrams are HTML components with magenta trust-boundary dashes.
seed: none (roll skipped: surface scope, unattended after an unanswered probe)
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
