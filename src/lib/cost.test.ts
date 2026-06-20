import { describe, it, expect } from 'vitest';
import { COST_BANDS, costGlyphs, priceToMidpoint, priceToTier } from './cost';

describe('priceToMidpoint', () => {
  it('averages low and high when both present', () => {
    expect(priceToMidpoint(30, 45)).toBe(37.5);
  });
  it('falls back to the single value present', () => {
    expect(priceToMidpoint(20, null)).toBe(20);
    expect(priceToMidpoint(null, 500)).toBe(500);
  });
  it('throws when neither bound is known (forces data discipline)', () => {
    expect(() => priceToMidpoint(null, null)).toThrow();
  });
});

describe('priceToTier — seed table examples (Section 5/7)', () => {
  it.each([
    ['Miyota 8215 ($15–25)', 15, 25, 1],
    ['Seiko VH31 ($15–25)', 15, 25, 1],
    ['Ronda 515 ($17–25)', 17, 25, 1],
    ['Seiko NH35 ($30–45)', 30, 45, 2],
    ['Seiko NH36 ($35–50)', 35, 50, 2],
    ['Seagull ST36 ($40–70)', 40, 70, 2],
    ['Seiko NH34 GMT ($60–90)', 60, 90, 3],
    ['Miyota 9015 ($60–90)', 60, 90, 3],
    ['Seagull ST1901 ($90–150)', 90, 150, 3],
    ['ETA 2824-2 genuine ($200–300)', 200, 300, 4],
    ['Sellita SW200-1 ($120–180)', 120, 180, 4],
    ['Sellita SW300-1 ($150–220)', 150, 220, 4],
    ['ETA/Valjoux 7750 ($400–700)', 400, 700, 5],
    ['ETA 2892-A2 ($300–500)', 300, 500, 5],
    ['Sellita SW500 ($350–550)', 350, 550, 5],
  ])('%s → tier %i', (_label, low, high, expected) => {
    expect(priceToTier(low, high)).toBe(expected);
  });
});

describe('priceToTier — band boundaries are lower-inclusive', () => {
  it.each([
    [24, 1],
    [25, 2], // start of $$ band
    [59, 2],
    [60, 3], // start of $$$ band
    [149, 3],
    [150, 4], // start of $$$$ band
    [399, 4],
    [400, 5], // start of $$$$$ band
    [10000, 5],
  ])('midpoint %i → tier %i', (mid, expected) => {
    // pass mid as both low and high so midpoint === mid
    expect(priceToTier(mid, mid)).toBe(expected);
  });
});

describe('priceToTier — single-sided prices', () => {
  it('uses low when high is null', () => {
    expect(priceToTier(20, null)).toBe(1);
  });
  it('uses high when low is null', () => {
    expect(priceToTier(null, 450)).toBe(5);
  });
  it('throws when both are null', () => {
    expect(() => priceToTier(null, null)).toThrow();
  });
});

describe('COST_BANDS invariants', () => {
  it('covers tiers 1..5 in order with contiguous ranges', () => {
    expect(COST_BANDS.map((b) => b.tier)).toEqual([1, 2, 3, 4, 5]);
    for (let i = 1; i < COST_BANDS.length; i++) {
      // each band starts exactly where the previous ended (no gaps/overlaps)
      expect(COST_BANDS[i]!.minMidpointUsd).toBe(
        COST_BANDS[i - 1]!.maxMidpointUsd,
      );
    }
    expect(COST_BANDS[0]!.minMidpointUsd).toBe(0);
    expect(COST_BANDS[COST_BANDS.length - 1]!.maxMidpointUsd).toBe(Infinity);
  });
});

describe('costGlyphs', () => {
  it('renders filled + empty glyphs totalling 5', () => {
    expect(costGlyphs(1)).toBe('$⬚⬚⬚⬚');
    expect(costGlyphs(3)).toBe('$$$⬚⬚');
    expect(costGlyphs(5)).toBe('$$$$$');
    expect(costGlyphs(3)).toHaveLength(5);
  });
});
