import { describe, it, expect } from 'vitest';
import {
  activeFilterCount,
  applyFilters,
  complicationCount,
  emptyFilters,
  facetCounts,
  filtersFromSearchParams,
  filtersToSearchParams,
  sortMovements,
  type FilterState,
} from './filters';
import { makeMovement } from '@/test/factories';

describe('URL (de)serialization', () => {
  it('empty filters produce an empty query string', () => {
    expect(filtersToSearchParams(emptyFilters()).toString()).toBe('');
  });

  it('round-trips a populated filter state', () => {
    const s: FilterState = {
      ...emptyFilters(),
      search: 'nh35',
      types: ['automatic', 'quartz'],
      complications: ['date', 'gmt'],
      diameterMin: 25,
      diameterMax: 30,
      beatRates: ['28800', 'quartz'],
      hacking: 'yes',
      dateWindows: ['3', 'none'],
      costTiers: [2, 4],
      brands: ['Seiko (SII/TMI)'],
      countries: ['Japan'],
      handHour: 1.5,
      sort: 'cost-desc',
    };
    const round = filtersFromSearchParams(filtersToSearchParams(s));
    expect(round).toEqual(s);
  });

  it('ignores out-of-range cost tiers from the URL', () => {
    const p = new URLSearchParams('tier=2,9,4');
    expect(filtersFromSearchParams(p).costTiers).toEqual([2, 4]);
  });
});

describe('complicationCount', () => {
  it('excludes base hours/minutes/seconds', () => {
    expect(
      complicationCount(
        makeMovement({
          complications: ['hours', 'minutes', 'central-seconds', 'date', 'gmt'],
        }),
      ),
    ).toBe(2);
  });
});

describe('applyFilters', () => {
  const auto = makeMovement({ id: 'a', type: 'automatic', costTier: 2 });
  const quartz = makeMovement({
    id: 'q',
    type: 'quartz',
    costTier: 1,
    beatRateVph: null,
    quartzFrequencyHz: 32768,
    complications: ['hours', 'minutes', 'central-seconds'],
  });
  const all = [auto, quartz];

  it('filters by type', () => {
    const s = { ...emptyFilters(), types: ['quartz' as const] };
    expect(applyFilters(all, s, null).map((m) => m.id)).toEqual(['q']);
  });

  it('treats beatRates "quartz" as null beat rate', () => {
    const s = { ...emptyFilters(), beatRates: ['quartz'] };
    expect(applyFilters(all, s, null).map((m) => m.id)).toEqual(['q']);
  });

  it('requires ALL selected complications (AND within facet)', () => {
    const s = {
      ...emptyFilters(),
      complications: ['date' as const, 'gmt' as const],
    };
    // auto (default) has date but not gmt → excluded
    expect(applyFilters(all, s, null)).toHaveLength(0);
  });

  it('range filters exclude movements with a null value', () => {
    const known = makeMovement({ id: 'k', diameterMm: 28 });
    const unknown = makeMovement({ id: 'u', diameterMm: null });
    const s = { ...emptyFilters(), diameterMin: 27, diameterMax: 30 };
    expect(applyFilters([known, unknown], s, null).map((m) => m.id)).toEqual([
      'k',
    ]);
  });

  it('search order restricts and (relevance) orders the set', () => {
    const s = { ...emptyFilters(), sort: 'relevance' as const };
    expect(applyFilters(all, s, ['q', 'a']).map((m) => m.id)).toEqual([
      'q',
      'a',
    ]);
  });
});

describe('cost tier filter (incl. unknown)', () => {
  const priced = makeMovement({ id: 'p', costTier: 2 });
  const unknown = makeMovement({ id: 'u', costTier: null });
  const all = [priced, unknown];

  it('selecting tier 0 matches price-unknown movements', () => {
    const s = { ...emptyFilters(), costTiers: [0 as const] };
    expect(applyFilters(all, s, null).map((m) => m.id)).toEqual(['u']);
  });

  it('selecting a numeric tier excludes price-unknown movements', () => {
    const s = { ...emptyFilters(), costTiers: [2 as const] };
    expect(applyFilters(all, s, null).map((m) => m.id)).toEqual(['p']);
  });
});

describe('sortMovements', () => {
  it('sorts cost ascending by price midpoint', () => {
    const cheap = makeMovement({ id: 'c', priceUsdLow: 10, priceUsdHigh: 20 });
    const dear = makeMovement({ id: 'd', priceUsdLow: 200, priceUsdHigh: 300 });
    expect(sortMovements([dear, cheap], 'cost-asc').map((m) => m.id)).toEqual([
      'c',
      'd',
    ]);
  });

  it('sorts unknown numeric specs last', () => {
    const known = makeMovement({ id: 'k', diameterMm: 28 });
    const unknown = makeMovement({ id: 'u', diameterMm: null });
    expect(
      sortMovements([unknown, known], 'diameter-asc').map((m) => m.id),
    ).toEqual(['k', 'u']);
  });
});

describe('facetCounts', () => {
  const chrono = makeMovement({
    id: 'c',
    complications: ['hours', 'minutes', 'small-seconds', 'chronograph', 'date'],
  });
  const dateOnly = makeMovement({
    id: 'd',
    complications: ['hours', 'minutes', 'central-seconds', 'date'],
  });
  const moon = makeMovement({
    id: 'm',
    complications: ['hours', 'minutes', 'central-seconds', 'date', 'moonphase'],
  });
  const all = [chrono, dateOnly, moon];

  it('complications are AND-aware (except=null): non-co-occurring options go to 0', () => {
    const state = {
      ...emptyFilters(),
      complications: ['chronograph' as const],
    };
    const counts = facetCounts(all, state, null, (m) => m.complications, null);
    expect(counts.get('chronograph')).toBe(1); // the chrono movement itself
    expect(counts.get('date')).toBe(1); // chrono also has a date → stays
    expect(counts.get('moonphase') ?? 0).toBe(0); // no chrono+moonphase → greys out
  });

  it('OR facets exclude their own dimension so siblings stay counted', () => {
    const state = { ...emptyFilters(), types: ['automatic' as const] };
    const counts = facetCounts(all, state, 'types', (m) => [m.type], null);
    expect(counts.get('automatic')).toBe(3); // type filter ignored for its own facet
  });
});

describe('activeFilterCount', () => {
  it('is zero for empty filters and counts active ones', () => {
    expect(activeFilterCount(emptyFilters())).toBe(0);
    expect(
      activeFilterCount({
        ...emptyFilters(),
        search: 'x',
        types: ['automatic'],
        diameterMin: 25,
      }),
    ).toBe(3);
  });
});
