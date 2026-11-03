# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Administrator:innen**: employees of the vendor. They maintain master data (products, features), customers and license keys. Product management is used by them only.
- **Kund:innen**: buy products and unlock features with purchased license keys. They never edit products; they will meet product and feature data later, when unlocking a feature.

## Product Purpose

The vendor sells products with hardware built in. Customers activate individual functions (features) in software by buying a license key. The license management app lets admins manage customers, products and license keys, and lets customers manage their products and activate features.

Success for product management: admins can keep the product catalog and each product's unlockable features correct without help, and every feature states exactly which extra information must be entered when it is unlocked.

## Operating Context

- Admins work at desktop workstations (Full HD) most of the time, but also look things up on large smartphones in portrait and landscape.
- Product management is master data: changed rarely, read often (when creating licenses, answering customer questions).

## Capabilities and Constraints

Product fields (spec `specs/2026-11-03-produktverwaltung.md`):

- ID: short text code, max. 20 characters
- Beschreibung: up to 1000 characters
- Aktuell verfügbar: boolean
- Preis: number (currency EUR assumed, not confirmed)
- Externe Links: list of URLs starting with `https://`
- Tags: list

Feature fields:

- ID: short text code, max. 20 characters
- Beschreibung: up to 1000 characters
- Zusatzinformationen: list of fields that must be entered when the feature is unlocked, each with a field name and a data type: Text, Ganzzahl or Datum (only these three for now)

Lifecycle: a product that is no longer sold is deactivated ("Aktuell verfügbar" off), not deleted. Deleting is allowed only while no licenses reference the product.

Technical: Next.js prototype, persistence as JSON files, light mode only, UI in German, code and docs in English.

Open decisions: whether prices are net or gross; whether features have their own price; how features are deleted once licenses reference them.

## Brand Commitments

The UI follows the `starfinanz-ui` skill (`.claude/skills/starfinanz-ui/`): Star Finanz identity (magenta actions, warm grays, red bar motif, serif page titles, 8px corners, formal German with "Sie" and gender colon) applied to a data-management tool, not a marketing site. Do not use the Star Finanz logo.

## Evidence on Hand

No real product data exists yet. Sample products in mockups are illustrative and must be labeled as such; do not present them as the real catalog.

## Product Principles

1. Data first: every screen exists to find, read or change records.
2. Master data must be trustworthy: changes that affect existing licenses are guarded.
3. One way to do each thing, the same on every screen, so admins work from muscle memory.
4. Accessible by default (WCAG 2.2 AA).

## Accessibility & Inclusion

WCAG 2.2 AA, as stated in the `starfinanz-ui` skill: semantic HTML, visible focus, labeled inputs, keyboard operation, status never shown by color alone.
