// ─────────────────────────────────────────────────────────────────────────────
// Cost tiering — PURE. The cost tier is DERIVED from the typical single-unit
// street/parts price midpoint, never hand-entered. The data validator asserts
// every cached `Movement.costTier` equals `priceToTier(low, high)` (Section 8),
// so a stale cached tier fails the build rather than misleading a buyer.
//
// Bands are LOWER-INCLUSIVE on the midpoint (USD):
//   $      [0, 25)      e.g. Miyota 8215, Ronda 515, Seiko VH31
//   $$     [25, 60)     e.g. Seiko NH35/36/38, Seagull ST36, VK63
//   $$$    [60, 150)    e.g. Miyota 9015/9039, Seagull ST1901, NH34 GMT
//   $$$$   [150, 400)   e.g. Sellita SW200-1, ETA 2824-2, SW300
//   $$$$$  [400, ∞)     e.g. ETA/Valjoux 7750, ETA 2892-A2, Sellita SW500
//
// NOTE on the Section-7 hint column: a few hand-written tier hints there sit on
// a band boundary or just inside a higher band (e.g. ST2130 at $50–90 → mid $70
// → tier 3, not the "2" hinted). The DERIVED tier wins; seed `costTier` values
// are set to whatever priceToTier() returns so the validator stays green.
// ─────────────────────────────────────────────────────────────────────────────

import type { CostTier } from '@/types';

export interface CostBand {
  tier: CostTier;
  glyph: string;
  /** Inclusive lower bound on the price midpoint (USD). */
  minMidpointUsd: number;
  /** Exclusive upper bound on the price midpoint (USD); Infinity for top tier. */
  maxMidpointUsd: number;
  label: string;
}

/** Tunable in one place. Ranges must stay contiguous (asserted in tests). */
export const COST_BANDS: readonly CostBand[] = [
  {
    tier: 1,
    glyph: '$',
    minMidpointUsd: 0,
    maxMidpointUsd: 25,
    label: 'Budget',
  },
  {
    tier: 2,
    glyph: '$$',
    minMidpointUsd: 25,
    maxMidpointUsd: 60,
    label: 'Value',
  },
  {
    tier: 3,
    glyph: '$$$',
    minMidpointUsd: 60,
    maxMidpointUsd: 150,
    label: 'Mid',
  },
  {
    tier: 4,
    glyph: '$$$$',
    minMidpointUsd: 150,
    maxMidpointUsd: 400,
    label: 'Premium',
  },
  {
    tier: 5,
    glyph: '$$$$$',
    minMidpointUsd: 400,
    maxMidpointUsd: Infinity,
    label: 'High-end',
  },
];

const EMPTY_GLYPH = '⬚';
const FILLED_GLYPH = '$';
const TIER_COUNT = COST_BANDS.length; // 5

/**
 * Collapse a low/high price range to the single value the tier is computed from.
 * Throws if neither bound is known — a movement with no price cannot have a
 * derived tier, and we refuse to invent one.
 */
export function priceToMidpoint(
  low: number | null,
  high: number | null,
): number {
  if (low != null && high != null) return (low + high) / 2;
  if (low != null) return low;
  if (high != null) return high;
  throw new Error(
    'priceToMidpoint: need at least one of priceUsdLow / priceUsdHigh',
  );
}

/** Map a price range to its 1–5 cost tier via the midpoint. */
export function priceToTier(low: number | null, high: number | null): CostTier {
  const midpoint = priceToMidpoint(low, high);
  const band = COST_BANDS.find((b) => midpoint < b.maxMidpointUsd);
  // The last band's upper bound is Infinity, so `band` is always defined.
  return (band ?? COST_BANDS[COST_BANDS.length - 1]!).tier;
}

/** Look up the full band record for a tier. */
export function bandForTier(tier: CostTier): CostBand {
  const band = COST_BANDS.find((b) => b.tier === tier);
  if (!band) throw new Error(`bandForTier: no band for tier ${tier}`);
  return band;
}

/** Render a tier as filled/empty glyphs, e.g. tier 3 → "$$$⬚⬚". */
export function costGlyphs(tier: CostTier): string {
  return (
    FILLED_GLYPH.repeat(tier) +
    EMPTY_GLYPH.repeat(Math.max(0, TIER_COUNT - tier))
  );
}
