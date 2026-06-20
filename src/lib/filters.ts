// ─────────────────────────────────────────────────────────────────────────────
// Faceted filtering — pure predicates + URL (de)serialization. The URL query
// string is the single source of truth for catalog state (shareable links), so
// everything here round-trips through URLSearchParams.
//
// Multi-select facets are OR within the facet (a movement has one type/brand/
// tier), EXCEPT `complications`, which is AND (a movement must have ALL the
// selected complications — "I need GMT *and* date"). Ranges exclude movements
// whose value is null (we can't confirm an unknown spec is in range).
// ─────────────────────────────────────────────────────────────────────────────

import {
  BASE_COMPLICATIONS,
  type Availability,
  type Complication,
  type CostTier,
  type Movement,
  type MovementType,
} from '@/types';

export type TriState = 'any' | 'yes' | 'no';

export type SortKey =
  | 'relevance'
  | 'az'
  | 'cost-asc'
  | 'cost-desc'
  | 'diameter-asc'
  | 'diameter-desc'
  | 'height-asc'
  | 'height-desc'
  | 'power-desc'
  | 'beat-desc'
  | 'availability';

export interface FilterState {
  search: string;
  types: MovementType[];
  complications: Complication[];
  compCountMin: number | null;
  compCountMax: number | null;
  diameterMin: number | null;
  diameterMax: number | null;
  heightMin: number | null;
  heightMax: number | null;
  beatRates: string[]; // '21600' | '28800' | '36000' | 'quartz'
  powerReserveMin: number | null;
  powerReserveMax: number | null;
  jewelsMin: number | null;
  jewelsMax: number | null;
  hacking: TriState;
  handWinding: TriState;
  dateWindows: string[]; // '3' | '4.5' | '6' | 'none'
  costTiers: CostTier[];
  availabilities: Availability[];
  brands: string[];
  countries: string[];
  handHour: number | null;
  handMinute: number | null;
  handSecond: number | null;
  sort: SortKey;
}

export function emptyFilters(): FilterState {
  return {
    search: '',
    types: [],
    complications: [],
    compCountMin: null,
    compCountMax: null,
    diameterMin: null,
    diameterMax: null,
    heightMin: null,
    heightMax: null,
    beatRates: [],
    powerReserveMin: null,
    powerReserveMax: null,
    jewelsMin: null,
    jewelsMax: null,
    hacking: 'any',
    handWinding: 'any',
    dateWindows: [],
    costTiers: [],
    availabilities: [],
    brands: [],
    countries: [],
    handHour: null,
    handMinute: null,
    handSecond: null,
    sort: 'az',
  };
}

/** Number of "real" complications (excludes base hours/minutes/seconds). */
export function complicationCount(m: Movement): number {
  const base = new Set<Complication>(BASE_COMPLICATIONS);
  return m.complications.filter((c) => !base.has(c)).length;
}

const AVAILABILITY_ORDER: Record<Availability, number> = {
  common: 0,
  moderate: 1,
  scarce: 2,
  discontinued: 3,
};

// ── Per-dimension predicates ─────────────────────────────────────────────────
// Keyed so facet counts can re-run "all predicates except this one".

function inRange(
  v: number | null,
  min: number | null,
  max: number | null,
): boolean {
  if (min != null && (v == null || v < min)) return false;
  if (max != null && (v == null || v > max)) return false;
  return true;
}

export type FilterDimension =
  | 'types'
  | 'complications'
  | 'compCount'
  | 'diameter'
  | 'height'
  | 'beatRates'
  | 'powerReserve'
  | 'jewels'
  | 'hacking'
  | 'handWinding'
  | 'dateWindows'
  | 'costTiers'
  | 'availabilities'
  | 'brands'
  | 'countries'
  | 'handSizes';

const PREDICATES: Record<
  FilterDimension,
  (m: Movement, s: FilterState) => boolean
> = {
  types: (m, s) => s.types.length === 0 || s.types.includes(m.type),
  complications: (m, s) =>
    s.complications.length === 0 ||
    s.complications.every((c) => m.complications.includes(c)),
  compCount: (m, s) =>
    inRange(complicationCount(m), s.compCountMin, s.compCountMax),
  diameter: (m, s) => inRange(m.diameterMm, s.diameterMin, s.diameterMax),
  height: (m, s) => inRange(m.heightMm, s.heightMin, s.heightMax),
  beatRates: (m, s) =>
    s.beatRates.length === 0 ||
    (m.beatRateVph == null
      ? s.beatRates.includes('quartz')
      : s.beatRates.includes(String(m.beatRateVph))),
  powerReserve: (m, s) =>
    inRange(m.powerReserveHours, s.powerReserveMin, s.powerReserveMax),
  jewels: (m, s) => inRange(m.jewels, s.jewelsMin, s.jewelsMax),
  hacking: (m, s) =>
    s.hacking === 'any' ||
    (s.hacking === 'yes' ? m.hacking === true : m.hacking === false),
  handWinding: (m, s) =>
    s.handWinding === 'any' ||
    (s.handWinding === 'yes'
      ? m.handWinding === true
      : m.handWinding === false),
  dateWindows: (m, s) =>
    s.dateWindows.length === 0 ||
    (m.dateWindowPosition == null
      ? s.dateWindows.includes('none')
      : s.dateWindows.includes(m.dateWindowPosition)),
  costTiers: (m, s) =>
    s.costTiers.length === 0 || s.costTiers.includes(m.costTier),
  availabilities: (m, s) =>
    s.availabilities.length === 0 || s.availabilities.includes(m.availability),
  brands: (m, s) => s.brands.length === 0 || s.brands.includes(m.brand),
  countries: (m, s) =>
    s.countries.length === 0 ||
    (m.manufactureCountry != null &&
      s.countries.includes(m.manufactureCountry)),
  handSizes: (m, s) =>
    (s.handHour == null || m.handSizes.hour === s.handHour) &&
    (s.handMinute == null || m.handSizes.minute === s.handMinute) &&
    (s.handSecond == null || m.handSizes.second === s.handSecond),
};

const ALL_DIMENSIONS = Object.keys(PREDICATES) as FilterDimension[];

/** Does a movement pass every dimension except the listed one(s)? */
function passesExcept(
  m: Movement,
  s: FilterState,
  except: FilterDimension | null,
): boolean {
  return ALL_DIMENSIONS.every((dim) => dim === except || PREDICATES[dim](m, s));
}

// ── Sorting ──────────────────────────────────────────────────────────────────
function priceMid(m: Movement): number {
  const lo = m.priceUsdLow;
  const hi = m.priceUsdHigh;
  if (lo != null && hi != null) return (lo + hi) / 2;
  return lo ?? hi ?? Number.POSITIVE_INFINITY;
}

function numCompare(
  a: number | null,
  b: number | null,
  dir: 'asc' | 'desc',
): number {
  // nulls always sort last regardless of direction
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  return dir === 'asc' ? a - b : b - a;
}

export function sortMovements(list: Movement[], sort: SortKey): Movement[] {
  const out = [...list];
  switch (sort) {
    case 'relevance':
      return out; // preserve incoming (Fuse) order
    case 'az':
      return out.sort((a, b) => a.caliber.localeCompare(b.caliber));
    case 'cost-asc':
      return out.sort((a, b) => priceMid(a) - priceMid(b));
    case 'cost-desc':
      return out.sort((a, b) => priceMid(b) - priceMid(a));
    case 'diameter-asc':
      return out.sort((a, b) => numCompare(a.diameterMm, b.diameterMm, 'asc'));
    case 'diameter-desc':
      return out.sort((a, b) => numCompare(a.diameterMm, b.diameterMm, 'desc'));
    case 'height-asc':
      return out.sort((a, b) => numCompare(a.heightMm, b.heightMm, 'asc'));
    case 'height-desc':
      return out.sort((a, b) => numCompare(a.heightMm, b.heightMm, 'desc'));
    case 'power-desc':
      return out.sort((a, b) =>
        numCompare(a.powerReserveHours, b.powerReserveHours, 'desc'),
      );
    case 'beat-desc':
      return out.sort((a, b) =>
        numCompare(a.beatRateVph, b.beatRateVph, 'desc'),
      );
    case 'availability':
      return out.sort(
        (a, b) =>
          AVAILABILITY_ORDER[a.availability] -
          AVAILABILITY_ORDER[b.availability],
      );
    default:
      return out;
  }
}

/**
 * Apply all predicates then sort. `searchOrder`, when provided, is the id order
 * from Fuse; it both restricts the set (search match) and, for sort:'relevance',
 * orders it.
 */
export function applyFilters(
  movements: Movement[],
  state: FilterState,
  searchOrder: string[] | null,
): Movement[] {
  let list = movements;
  if (searchOrder) {
    const rank = new Map(searchOrder.map((id, i) => [id, i]));
    list = movements.filter((m) => rank.has(m.id));
    if (state.sort === 'relevance') {
      list = [...list].sort(
        (a, b) => (rank.get(a.id) ?? 0) - (rank.get(b.id) ?? 0),
      );
    }
  }
  const filtered = list.filter((m) => passesExcept(m, state, null));
  return state.sort === 'relevance' && searchOrder
    ? filtered
    : sortMovements(filtered, state.sort);
}

export interface FacetCount {
  value: string;
  count: number;
}

/**
 * For a multi-select dimension, count movements that pass all OTHER dimensions
 * (so each option shows how many results it would yield). `searchOrder`
 * restricts the universe when a search is active.
 */
export function facetCounts(
  movements: Movement[],
  state: FilterState,
  dimension: FilterDimension,
  valueOf: (m: Movement) => string[],
  searchOrder: string[] | null,
): Map<string, number> {
  const counts = new Map<string, number>();
  const universe = searchOrder
    ? movements.filter((m) => searchOrder.includes(m.id))
    : movements;
  for (const m of universe) {
    if (!passesExcept(m, state, dimension)) continue;
    for (const v of valueOf(m)) {
      counts.set(v, (counts.get(v) ?? 0) + 1);
    }
  }
  return counts;
}

// ── URL (de)serialization ────────────────────────────────────────────────────
const NUM = (v: string | null): number | null => {
  if (v == null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
const LIST = (v: string | null): string[] =>
  v ? v.split(',').filter(Boolean) : [];

export function filtersFromSearchParams(p: URLSearchParams): FilterState {
  const s = emptyFilters();
  s.search = p.get('q') ?? '';
  s.types = LIST(p.get('type')) as MovementType[];
  s.complications = LIST(p.get('comp')) as Complication[];
  s.compCountMin = NUM(p.get('compMin'));
  s.compCountMax = NUM(p.get('compMax'));
  s.diameterMin = NUM(p.get('diaMin'));
  s.diameterMax = NUM(p.get('diaMax'));
  s.heightMin = NUM(p.get('htMin'));
  s.heightMax = NUM(p.get('htMax'));
  s.beatRates = LIST(p.get('beat'));
  s.powerReserveMin = NUM(p.get('prMin'));
  s.powerReserveMax = NUM(p.get('prMax'));
  s.jewelsMin = NUM(p.get('jMin'));
  s.jewelsMax = NUM(p.get('jMax'));
  s.hacking = (p.get('hack') as TriState) || 'any';
  s.handWinding = (p.get('wind') as TriState) || 'any';
  s.dateWindows = LIST(p.get('date'));
  s.costTiers = LIST(p.get('tier'))
    .map(Number)
    .filter((n) => n >= 1 && n <= 5) as CostTier[];
  s.availabilities = LIST(p.get('avail')) as Availability[];
  s.brands = LIST(p.get('brand'));
  s.countries = LIST(p.get('country'));
  s.handHour = NUM(p.get('hH'));
  s.handMinute = NUM(p.get('hM'));
  s.handSecond = NUM(p.get('hS'));
  s.sort = (p.get('sort') as SortKey) || 'az';
  return s;
}

export function filtersToSearchParams(s: FilterState): URLSearchParams {
  const p = new URLSearchParams();
  const setList = (k: string, v: (string | number)[]) => {
    if (v.length) p.set(k, v.join(','));
  };
  const setNum = (k: string, v: number | null) => {
    if (v != null) p.set(k, String(v));
  };
  if (s.search) p.set('q', s.search);
  setList('type', s.types);
  setList('comp', s.complications);
  setNum('compMin', s.compCountMin);
  setNum('compMax', s.compCountMax);
  setNum('diaMin', s.diameterMin);
  setNum('diaMax', s.diameterMax);
  setNum('htMin', s.heightMin);
  setNum('htMax', s.heightMax);
  setList('beat', s.beatRates);
  setNum('prMin', s.powerReserveMin);
  setNum('prMax', s.powerReserveMax);
  setNum('jMin', s.jewelsMin);
  setNum('jMax', s.jewelsMax);
  if (s.hacking !== 'any') p.set('hack', s.hacking);
  if (s.handWinding !== 'any') p.set('wind', s.handWinding);
  setList('date', s.dateWindows);
  setList('tier', s.costTiers);
  setList('avail', s.availabilities);
  setList('brand', s.brands);
  setList('country', s.countries);
  setNum('hH', s.handHour);
  setNum('hM', s.handMinute);
  setNum('hS', s.handSecond);
  if (s.sort !== 'az') p.set('sort', s.sort);
  return p;
}

/** Count of active filters (for the "Reset" affordance / chip bar). */
export function activeFilterCount(s: FilterState): number {
  const d = emptyFilters();
  let n = 0;
  if (s.search) n++;
  n += s.types.length + s.complications.length + s.beatRates.length;
  n += s.dateWindows.length + s.costTiers.length + s.availabilities.length;
  n += s.brands.length + s.countries.length;
  if (s.compCountMin !== d.compCountMin || s.compCountMax !== d.compCountMax)
    n++;
  if (s.diameterMin !== d.diameterMin || s.diameterMax !== d.diameterMax) n++;
  if (s.heightMin !== d.heightMin || s.heightMax !== d.heightMax) n++;
  if (
    s.powerReserveMin !== d.powerReserveMin ||
    s.powerReserveMax !== d.powerReserveMax
  )
    n++;
  if (s.jewelsMin !== d.jewelsMin || s.jewelsMax !== d.jewelsMax) n++;
  if (s.hacking !== 'any') n++;
  if (s.handWinding !== 'any') n++;
  if (s.handHour != null || s.handMinute != null || s.handSecond != null) n++;
  return n;
}
