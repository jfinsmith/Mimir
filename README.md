# MIMIR — Watch Movement Catalog & Fitment Engine

**▶ Live site: https://jfinsmith.github.io/Mimir/**

[![Deploy to GitHub Pages](https://github.com/jfinsmith/Mimir/actions/workflows/deploy.yml/badge.svg)](https://github.com/jfinsmith/Mimir/actions/workflows/deploy.yml)

MIMIR is a free, fast, **no-login** web app for hobbyist watchmakers and modders.
Browse a searchable catalog of watch **movements** (calibers), read each one's
full spec sheet, and use the **Fitment Engine** to find out which parts — cases,
dials, hands, crystals, stems/crowns, spacers — actually fit a given movement,
with a specific reason for every verdict. Then plan a complete build and get
**precise search links** to go buy the right parts.

It runs entirely in your browser. There's no account, no backend, no tracking,
and nothing is scraped — every number is transcribed from a real source or left
blank.

> ### ⚠️ Verify before you buy
> Data is community-sourced and can contain errors. Every spec carries a
> **confidence flag**; treat `medium`/`low` values as starting points and confirm
> the critical dimensions against a manufacturer sheet or the seller's listing
> before spending money. **MIMIR never guesses a number** — unknown fields are
> shown blank, never invented.

---

## Why it exists

The hardest part of a watch mod or repair isn't choosing a look — it's working
out **what physically fits**. Will these hands sit on that movement's pinions?
Will this dial's feet line up? Is the case opening the right diameter? Will the
date window land at 3 or 4:30? Getting one of these wrong means a wasted order
and a part that doesn't fit.

MIMIR encodes those compatibility rules so you can check them in seconds instead
of cross-referencing forum threads and spec PDFs — and it's honest about what it
doesn't know.

## What's inside

- **153 movements / 74 movement families / 101 parts** and growing.
- Swiss, Japanese, Chinese and Russian makers (Seiko, Miyota, ETA, Sellita,
  Seagull, Ronda, Orient, Vostok, Poljot, and more).
- Every movement type: **automatic, manual, quartz, mecaquartz, solar, kinetic** —
  across moonphase, GMT, chronograph, power-reserve, alarm, day-date and
  vintage/restoration calibers.
- Sourced modding parts (cases, dials, hands, crystals, bezels, stems/crowns,
  spacers, gaskets, rotors) from namokiMODS, DLW, CrystalTimes, Lucius Atelier,
  Otto Frei, Esslinger, Cousins and others — each tagged with the movements/
  families it fits.

---

## How to use it

### 1. Browse & filter the catalog
The home page is the **catalog**. Search by caliber or alias (e.g. `NH35`,
`7S26`, `2824`) and narrow with faceted filters — **make** (Seiko, Miyota…),
type, complication, diameter, beat rate, hacking/hand-winding, date position,
cost tier. Incompatible filter combinations grey out, and the URL updates as you
filter, so any search is shareable/bookmarkable.

### 2. Read a movement
Open any movement for its full **spec sheet**: dimensions, hand-bore sizes, dial
feet, crown/date positions, performance (beat rate, power reserve, jewels),
price range and a **cost tier** (`$`–`$$$$$`, or "Unknown" when there's no honest
price). A **confidence flag** marks anything not fully verified.

### 3. See which parts fit (the Fitment Engine)
Every movement page lists **"Parts that fit this movement"**, each with a verdict
you can filter by:

| Verdict | Meaning |
| --- | --- |
| **Direct fit** | Drops in — bores/footprint/feet all match. |
| **Fits with spacer** | Works, but needs a movement ring/spacer. |
| **Needs modification** | Possible with work (e.g. remove dial feet, align date). |
| **Check clearance** | Likely OK, but a key spec is unknown — verify first. |
| **Incompatible** | A hard conflict (e.g. wrong hand bore, opening too small). |

Hover any badge for the **exact reason** (e.g. *"Minute bore mismatch: hands need
0.90 mm but the 8215 minute pinion is 1.00 mm"*).

### 4. Plan a build
The **Build Planner** lets you pick a movement and a part for each slot. It:
- **blocks parts that are certainly incompatible** with your movement (they're
  disabled in the dropdown, with the reason shown),
- runs live **cross-checks** (movement↔part and part↔part, e.g. dial Ø vs case
  seat) and rolls them up to a single buildable/blocked status,
- tracks a **running cost** and lists **missing pieces**,
- **saves builds** in your browser and exports them as JSON or print.

### 5. Find where to buy
On movement pages, part cards and each build slot, the **"Where to buy"** row
gives ready-made, precise searches — your own region's **eBay** (plus sold-price
comps for movements), the part's listed vendors, and a **Google** fallback —
built with forced-exact operators so you land on the right item. A
**"confirm before buying"** checklist surfaces the exact variant details to match
(hand bores, dial feet, crown position…), and the Build Planner can export a
whole **shopping list**. Use the **region toggle** in the header (US/UK/EU/AU) to
target your marketplaces. MIMIR holds no inventory and earns nothing from these
links.

### 6. Compare, learn & explore
Add movements to the **compare** tray for a side-by-side table (fitment rows
first, differences highlighted, shareable URL). The **Education** section is an
illustrated encyclopedia — watch **styles** (diver, dress, pilot, field,
chronograph, GMT, racing, skeleton), **movement types** (automatic, manual,
quartz, mecaquartz, solar, kinetic) and **origins** (Swiss, German, Japanese,
American, Chinese, Russian) — each with original labeled diagrams, history,
prices, iconic examples, and the matching movements/parts from the live catalog.
The **Learn** page has the glossary and explains how the catalog is built.

---

## Data integrity (the rules MIMIR holds itself to)

- **No fabricated numbers.** Every spec is transcribed from a real source or left
  blank — never guessed.
- **Honest confidence.** `high` confidence requires cited references; `medium`/
  `low` flag where to double-check.
- **Derived, not hand-typed cost tiers**, so a price and its tier can't disagree.
- **No scraping, no hot-linked images.** The shipped app is fully static; product
  art is a generated placeholder unless a license-clean image is supplied.
- **Neutral buy-links.** No affiliate codes, no third-party trackers.
- A **data validator** fails the build on contradictions (cost-tier drift,
  quartz/beat-rate mismatches, family hand-size conflicts, dangling references,
  missing citations, duplicate ids, malformed clock positions).

---

# For developers

A client-side **React 18 + TypeScript (strict) + Vite** app. **react-router-dom**
(with a GitHub Pages SPA shim), **Tailwind** (design tokens as CSS variables),
**fuse.js** fuzzy search, **zod** schemas, and **Vitest** + Testing Library
(unit tests are mandatory for the pure `lib/` engines and the data validator).

## Run it locally

```bash
npm install
npm run dev            # local dev server
npm run check          # lint + validate:data + test + build (the full gate)
```

| Script                  | What it does                                       |
| ----------------------- | ------------------------------------------------- |
| `npm run dev`           | Vite dev server                                   |
| `npm run build`         | `tsc -b` type-check, then `vite build` → `dist/`  |
| `npm run preview`       | Preview the production build                       |
| `npm test`              | Run all unit tests once                           |
| `npm run test:watch`    | Vitest in watch mode                              |
| `npm run validate:data` | zod + business-rule validation of the dataset     |
| `npm run check:images`  | Report which records still use the SVG placeholder|
| `npm run lint`          | ESLint                                            |
| `npm run format`        | Prettier write                                    |
| `npm run check`         | lint + validate:data + test + build (CI gate)     |

## Data model

Types live in [`src/types/`](src/types/), mirrored as zod schemas in
[`src/lib/schema.ts`](src/lib/schema.ts).

- **`Movement`** — a caliber. Fitment-critical fields: `casingDiameterMm`
  (movement Ø **incl.** spacer/ring — checked against a case opening),
  `heightWithHandsMm` (top of the hand stack — checked against case depth),
  `handSizes`, `dialFeet`, `crownPositions`, `dateWindowPosition`.
- **`Part`** — a case / dial / hands / crystal / stem-crown / spacer-ring /
  bezel / gasket / rotor. Only fields relevant to its `category` populate;
  `fitsMovements`/`fitsFamilies` are the strongest fit signal.
- **`MovementFamily`** — the fitment backbone: shared hand sizes / dial feet /
  footprint live on the family so a part can target a family and inherit to
  every member.

Conventions: hand sizes are always stored hour / minute / second in mm;
`diameterMm` (bare) ≠ `casingDiameterMm` (with ring); `heightMm` (no hands) ≠
`heightWithHandsMm`; cost tiers are derived (see below); clock positions are
`'3'`, `'4.5'`, `'10:30'`, … and format-validated.

### Cost tiers ($–$$$$$)

[`src/lib/cost.ts`](src/lib/cost.ts) maps a price **midpoint** to a tier
(lower-inclusive bands). `null` = price unknown (shown as "Unknown").

| Tier | Midpoint (USD) | Tier | Midpoint (USD) |
| --- | --- | --- | --- |
| `$` | `< 25` | `$$$$` | `150 – 400` |
| `$$` | `25 – 60` | `$$$$$` | `≥ 400` |
| `$$$` | `60 – 150` | | |

## How the fitment engine works

`evaluateFit(movement, part)` in [`src/lib/fitment.ts`](src/lib/fitment.ts) is a
pure function returning `{ status, reasons[], warnings[], requiredExtras[] }`.

- **Statuses:** `direct` · `with-spacer` · `needs-modification` ·
  `check-clearance` · `incompatible` · `unknown`.
- An explicit `fitsMovements`/`fitsFamilies` listing starts at `direct`;
  dimensional checks can downgrade it.
- **Most severe wins:** `incompatible > needs-modification > with-spacer >
  check-clearance > direct`.
- Tolerances: hour/minute bores match within ±0.02 mm; seconds ±0.02 mm; case
  opening within ±0.2 mm is a snug direct fit.

The Build Planner's blocking and the per-slot pickers are built on the pure
helpers `partOptionsForSlot` / `canUsePart` in [`src/lib/build.ts`](src/lib/build.ts).

## Buy-links (sourcing)

[`src/lib/buyLinks.ts`](src/lib/buyLinks.ts) is a pure module that turns a record
+ region into copy-ready searches/deep-links: `buildBuyLinks(item, region)`,
`buildShoppingList(build, region)`, `discriminatorChecklist(category, movement)`.
Forced-exact queries (quoted strings, `site:`, `-replica -fake -clone`, alias
`OR`-groups), one `encodeURIComponent` pass, durable search-URLs over fragile
product-URLs. Only **verified** retailer schemes emit native deep-links; the rest
degrade to a precise Google `site:` search. Region/marketplace config is in
[`src/data/marketplaces.ts`](src/data/marketplaces.ts); the vendor registry in
[`src/data/vendors.ts`](src/data/vendors.ts). Links are neutral today, with a
single `withAffiliate()` seam to monetize later (then add `rel="sponsored nofollow"`
+ FTC disclosure).

## Adding a movement or part

1. Add a typed object to [`src/data/movements.ts`](src/data/movements.ts) or
   [`src/data/parts.ts`](src/data/parts.ts) (TS flags missing fields).
2. **Transcribe numbers from a real source.** No verified value → `null`.
3. Set `dataConfidence` honestly (`high` requires non-empty `references`).
4. For a new movement, make sure its `family` exists in
   [`src/data/families.ts`](src/data/families.ts) and lists it in `members` with
   matching `sharedHandSizes`.
5. Run `npm run validate:data` (it must pass), then `npm run check`.

**Trusted sources:** manufacturer sheets (Miyota, Ronda, Sellita, Seiko/TMI) →
Caliber Corner → WatchBase → Ranfft → parts-retailer spec fields. A single
retailer listing is `medium`; promote to `high` only when ≥2 independent sources
agree or a manufacturer PDF confirms.

## Images — copyright-safe

Records render a generated **SVG placeholder** by default. Real images are
optional via the `images: ImageRef[]` field (`credit`/`sourceUrl`/`license` →
attribution caption). Don't hot-link or commit scraped photos; drop license-clean
files in `public/movements/<id>/`. `npm run check:images` reports placeholders.

## Deployment (GitHub Pages)

[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) runs the quality
gates and deploys `dist/` to Pages on every push to `main` (Pages source =
"GitHub Actions").

### ⚠️ The base-path gotcha

The Pages base path is the **#1 thing that breaks** on a hosting/domain change.
It's one commented constant in [`vite.config.ts`](vite.config.ts):

```ts
const BASE_PATH = '/Mimir/'; // ← change ONLY this line (must match the repo name's case)
```

- **Project Pages** (`https://USER.github.io/REPO/`) → `'/REPO/'`
  (case-sensitive — must match the repo name exactly).
- **Custom domain at the root** → `'/'`, and also set `pathSegmentsToKeep = 0`
  in [`public/404.html`](public/404.html) (the SPA deep-link shim).

The router reads the same value via `import.meta.env.BASE_URL`, so routing stays
in sync automatically.

## Project structure

```
src/
  types/      Movement, Part, MovementFamily, Build, enums
  data/       families · movements(.batchN) · parts(.batch1) · marketplaces · vendors · glossary
  lib/        cost · fitment · build · buyLinks · filters · schema  (+ *.test.ts)
  pages/      Catalog · MovementDetail · Compare · Parts · BuildPlanner · Learn · About · NotFound
  hooks/      useCatalogState · useCompare · useBuilds · useRegion
  components/ FilterPanel · MovementCard · SpecSheet · FitBadge · VendorLinks · …
scripts/      validate-data.ts · check-images.ts
.github/workflows/  ci.yml · deploy.yml
```

The catalog and parts are compiled from research → adversarial-verify agent
workflows and grow over time; contributions that follow the data-integrity rules
above are welcome.
