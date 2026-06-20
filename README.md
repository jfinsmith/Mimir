# MIMIR — Watch Movement Catalog & Fitment Engine

A client-side web app for hobbyist watchmakers. Browse a searchable, filterable
catalog of watch **movements**, read each one's full spec sheet and cost tier,
and use the **Fitment Engine** to find which parts (cases, dials, hands,
crystals, stems/crowns, spacers) actually fit a chosen movement — with the
specific reason for every verdict.

> ⚠️ **Verify before you buy.** Data is community-sourced and may contain
> errors. Every spec carries a confidence flag; treat `medium`/`low` values as
> starting points and confirm critical dimensions against a manufacturer sheet
> before spending money on parts. MIMIR never guesses a number — unknown fields
> are `null`.

This repo is currently at **Phase 0** (scaffold + contracts). See
[Build phases](#build-phases).

---

## Tech stack

- **React 18 + TypeScript (strict)** + **Vite**
- **react-router-dom** (BrowserRouter + GitHub Pages SPA shim)
- **Tailwind CSS** with design tokens centralized as CSS variables
- **fuse.js** for fuzzy search (wired in Phase 2)
- **zod** schemas + a `validate:data` script that fails the build on bad data
- **Vitest** + Testing Library — unit tests are mandatory for `lib/fitment.ts`,
  `lib/cost.ts` and the data validator

## Quick start

```bash
npm install
npm run dev            # local dev server
npm test               # run unit tests
npm run validate:data  # check the dataset for contradictions
npm run build          # type-check + production build
npm run check          # lint + validate:data + test + build (everything)
```

## Scripts

| Script                  | What it does                                              |
| ----------------------- | -------------------------------------------------------- |
| `npm run dev`           | Vite dev server                                          |
| `npm run build`         | `tsc -b` type-check, then `vite build` → `dist/`         |
| `npm run preview`       | Preview the production build                             |
| `npm test`              | Run all unit tests once                                  |
| `npm run test:watch`    | Vitest in watch mode                                     |
| `npm run validate:data` | zod + business-rule validation of the seed data         |
| `npm run check:images`  | Report which records still use the SVG placeholder       |
| `npm run lint`          | ESLint                                                   |
| `npm run format`        | Prettier write                                           |
| `npm run check`         | lint + validate:data + test + build (the CI gate)        |

---

## Data model

Defined as TypeScript types in [`src/types/`](src/types/) and mirrored as zod
schemas in [`src/lib/schema.ts`](src/lib/schema.ts).

- **`Movement`** — a caliber: identity, complications, physical/fitment specs,
  performance, commerce, provenance. Fitment-critical fields:
  `casingDiameterMm` (movement Ø **including** its spacer/ring — the number
  checked against a case opening), `heightWithHandsMm` (top of the hand stack —
  checked against case depth), `handSizes`, `dialFeet`, `crownPositions`,
  `dateWindowPosition`.
- **`Part`** — a case / dial / hands / crystal / stem-crown / spacer-ring /
  bezel / gasket / rotor. Only the fields relevant to its `category` populate.
  `fitsMovements` / `fitsFamilies` are the strongest fit signal.
- **`MovementFamily`** — the fitment backbone. Shared facts (hand sizes, dial
  feet, footprint) live on the family so a part can target a family and inherit
  to every member.

### Canonical conventions (enforced — see Section 8 of the brief)

- **Hand sizes are always stored hour / minute / second, in mm.** Normalize on
  ingest (retailers list these every which way).
- **`diameterMm`** = bare movement Ø. **`casingDiameterMm`** = incl. ring/spacer
  (this is what the fitment engine compares to a case opening). Don't conflate.
- **`heightMm`** (no hands) vs **`heightWithHandsMm`** (hand stack) are distinct;
  case-depth checks use the latter.
- **Cost tier is derived, never hand-entered** (see below).
- Clock positions are `'3'`, `'4.5'`, `'5:30'`, `'10:30'`, … and are
  format-validated.

### Cost tiers ($ – $$$$$)

`lib/cost.ts` maps a price **midpoint** to a 1–5 tier (lower-inclusive bands):

| Tier  | Midpoint (USD) |
| ----- | -------------- |
| `$`   | `< 25`         |
| `$$`  | `25 – 60`      |
| `$$$` | `60 – 150`     |
| `$$$$`| `150 – 400`    |
| `$$$$$`| `≥ 400`       |

The tier is **cached** on each movement for fast filtering, and
`validate:data` fails the build if a cached `costTier` ≠ `priceToTier(...)`.
Bands are a single tunable constant (`COST_BANDS`).

---

## How the fitment engine works

`evaluateFit(movement, part)` in [`src/lib/fitment.ts`](src/lib/fitment.ts) is a
pure function returning `{ status, reasons[], warnings[], requiredExtras[] }`.

- **Statuses:** `direct` · `with-spacer` · `needs-modification` ·
  `check-clearance` · `incompatible` · `unknown`.
- **Strongest signal first:** an explicit `fitsMovements`/`fitsFamilies` listing
  starts at `direct`, then dimensional checks can downgrade it.
- **Combining precedence (most severe wins):**
  `incompatible > needs-modification > with-spacer > check-clearance > direct`.
- Every non-trivial verdict carries a **specific reason** (e.g. _"Minute bore
  mismatch: hands need 0.90mm but 8215 minute pinion is 1.00mm"_).
- Missing **optional** data becomes a non-blocking **warning**; missing
  **primary** data (e.g. hand bores for a hand set) yields `check-clearance`.

Tolerances: hour/minute bores must match exactly; seconds within ±0.02mm; case
opening within ±0.2mm counts as a snug direct fit.

---

## Adding a movement or part

1. Add a typed object to [`src/data/movements.ts`](src/data/movements.ts) or
   [`src/data/parts.ts`](src/data/parts.ts). TypeScript will flag any missing
   field.
2. **Transcribe numbers from a real source** (see _Sources_ below). If you don't
   have a verified value, set it to `null` — never guess.
3. Set `dataConfidence` honestly (`high` requires non-empty `references`).
4. For a new movement, make sure its `family` exists in
   [`src/data/families.ts`](src/data/families.ts) and that the family lists it in
   `members` with matching `sharedHandSizes`.
5. Run `npm run validate:data` — it fails on cost-tier drift, quartz/beat-rate
   mismatches, family hand-size contradictions, dangling references, missing
   citations, duplicate ids and malformed clock positions.

### Trusted sources (verify, don't scrape)

Manufacturer sheets (Miyota, Ronda, Sellita, Seiko/TMI) → Caliber Corner →
WatchBase → Ranfft → parts-retailer spec fields. Treat a single retailer listing
as `medium`; promote to `high` only when ≥2 independent sources agree or a
manufacturer PDF confirms. **The shipped app is fully static — nothing is
scraped at runtime.**

---

## Images — copyright-safe strategy

- Every record renders a generated **SVG placeholder** by default (Phase 6).
- Real images are optional via the `images: ImageRef[]` field, which carries
  `credit` / `sourceUrl` / `license` and renders an attribution caption.
- **Do not** hot-link or commit scraped retailer images. Drop your own
  license-clean files in `public/movements/<id>/` and fill the `images` field.
- `npm run check:images` reports which records still use a placeholder.

---

## Deployment (GitHub Pages)

A workflow at [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)
runs the quality gates (lint, validate:data, test, build) and deploys `dist/` to
Pages on every push to `main`. Enable Pages → "GitHub Actions" in repo settings.

### ⚠️ The base-path gotcha (read this before switching domains)

The `base` is the **#1 thing that breaks** when you move hosting. It lives in
**one clearly-commented constant** in
[`vite.config.ts`](vite.config.ts):

```ts
const BASE_PATH = '/mimir/'; // ← change ONLY this line
```

- **Project Pages** (`https://USER.github.io/REPO_NAME/`) → `'/REPO_NAME/'`
- **Custom domain at the root** (`https://example.com/`) → `'/'`

The router reads the same value via `import.meta.env.BASE_URL`, so routing stays
in sync automatically. **If you switch to a custom domain, also set**
`pathSegmentsToKeep = 0` in [`public/404.html`](public/404.html) (the SPA
deep-link shim — it lets deep links survive a hard refresh on Pages).

`public/CNAME` is domain-specific; create it yourself when you point a custom
domain at the site (a single line containing your domain).

---

## Project structure

```
src/
  types/      Movement, Part, MovementFamily, Build, enums, common value objects
  data/       families.ts · movements.ts · parts.ts · glossary.ts (typed seed)
  lib/        cost.ts · fitment.ts · schema.ts  (+ *.test.ts)
  pages/      Catalog · MovementDetail · Compare · Parts · BuildPlanner · Learn · About · NotFound
  hooks/      useCatalogState · useCompare · useBuilds
  components/ FilterPanel · MovementCard · SpecSheet · FitBadge · CompareBar · …
  test/       setup.ts · factories.ts  (hermetic fixtures)
  styles/     index.css (design tokens)
scripts/      validate-data.ts · check-images.ts
.github/workflows/  ci.yml · deploy.yml
```

---

## Build phases

- **Phase 0 — Scaffold & contracts** ✅ — types, zod schemas, `cost.ts` +
  `fitment.ts` (tested), data validator, CI, Vite/Pages config.
- **Phase 1 — Seed data** ✅ — typed, validated dataset: **153 movements /
  74 families / 101 parts** (86 sourced modding parts in `parts.batch1.ts` —
  cases, dials, hands, crystals, bezels, stems/crowns, spacers, gaskets, rotors
  from namokiMODS / DLW / CrystalTimes / Lucius Atelier / Otto Frei / Esslinger /
  Cousins — each carrying `fitsFamilies` so fitment + the Build Planner's
  incompatible-blocking work out of the box), sourced from manufacturer technical
  sheets, Caliber
  Corner and WatchBase (every record cites its `references`; `dataConfidence`
  set honestly). Spans Swiss/Japanese/Chinese/Russian makers (incl. Orient,
  Vostok, Poljot, Seagull, Ronda) and every movement type — automatic, manual,
  quartz, mecaquartz, solar, kinetic — across moonphase, GMT, chronograph,
  power-reserve, alarm and vintage/restoration calibers. `costTier` is nullable:
  movements with no honest loose price (e.g. Seiko 8L35) show as "Unknown" and
  are filterable as such, rather than being excluded. The round-2…6 batches
  (`movements.batch2.ts` … `movements.batch6.ts`) were compiled from research →
  adversarial-verify agent workflows. Ongoing — more get added over time.
- **Phase 2 — Catalog** ✅ — faceted filters + Fuse search + URL-as-state +
  sortable card grid + schematic placeholders + sticky compare bar.
- **Phase 3 — Detail + Compare** ✅ — grouped spec sheet, cost glyphs,
  confidence flags, references; side-by-side compare (URL-shareable, diff
  highlighting, fitment rows first).
- **Phase 4 — Fitment in the UI** ✅ — "Parts that fit" on each movement
  (FitBadge + reasons, filter by status); Parts page with reverse fit-check.
- **Phase 5 — Build Planner** ✅ — movement + part slots, live cross-check
  checklist, running cost, missing-pieces, localStorage saves, JSON export, print.
- **Phase 6 — Learn/About + polish** ✅ — Learn/glossary, methodology page,
  image-attribution plumbing, route code-splitting, skip-link/aria, deploy config.
- **Phase 7** _(stretch, not started)_ — Firestore backend for community corrections.
