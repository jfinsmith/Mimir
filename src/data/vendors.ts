// ─────────────────────────────────────────────────────────────────────────────
// Vendor registry — normalizes the free-text commonVendors[] strings (which carry
// inconsistent names + parenthetical qualifiers, e.g. "Otto Frei (parts)",
// "eBay (complete watches only)", "Crystaltimes USA") into known hosts + the
// search-URL platform pattern.
//
// CONFIDENCE DISCIPLINE (per the design critique): only platforms marked
// 'verified' emit a native deep-link. Everything 'mustVerify'/'google-site'
// degrades to a precise Google `site:{host}` search — a worse-but-working link,
// never a guessed deep-link that might 404.
// ─────────────────────────────────────────────────────────────────────────────

export type VendorPlatform =
  | 'shopify' // /search?q=
  | 'bigcommerce' // /search.php?search_query=
  | 'woocommerce' // /?s=&post_type=product
  | 'cousins' // /search?SearchTerm=
  | 'google-site' // no usable native search → Google site: fallback
  | null;

export interface VendorEntry {
  /** Canonical display name. */
  name: string;
  /** Bare host (no scheme/path). */
  host: string;
  platform: VendorPlatform;
  /** 'verified' platforms emit native deep-links; others fall back to Google site:. */
  confidence: 'verified' | 'mustVerify';
  /** True for vendors that sell whole/complete watches, not loose parts. A parts
   *  search must NOT be routed here (it would surface wrong-fitment whole watches). */
  wholeWatchesOnly?: boolean;
}

// Keyed by normalized base name (lowercased, parentheticals stripped). Aliases
// are listed and folded in below.
const ENTRIES: VendorEntry[] = [
  {
    name: 'namokiMODS',
    host: 'www.namokimods.com',
    platform: 'shopify',
    confidence: 'verified',
  },
  {
    name: 'Esslinger',
    host: 'www.esslinger.com',
    platform: 'bigcommerce',
    confidence: 'verified',
  },
  {
    name: 'Cousins UK',
    host: 'www.cousinsuk.com',
    platform: 'cousins',
    confidence: 'verified',
  },
  // Likely-Shopify mod shops — host known, search pattern not live-verified → Google site: fallback.
  {
    name: 'DLW',
    host: 'www.dlwwatches.com',
    platform: 'google-site',
    confidence: 'mustVerify',
  },
  {
    name: 'Lucius Atelier',
    host: 'luciusatelier.com',
    platform: 'google-site',
    confidence: 'mustVerify',
  },
  {
    name: 'CrystalTimes',
    host: 'www.crystaltimes.net',
    platform: 'google-site',
    confidence: 'mustVerify',
  },
  {
    name: 'WatchGecko',
    host: 'www.watchgecko.com',
    platform: 'google-site',
    confidence: 'mustVerify',
  },
  {
    name: 'Jules Borel',
    host: 'www.julesborel.com',
    platform: 'google-site',
    confidence: 'mustVerify',
  },
  // Otto Frei: no reliable native search URL → Google site:.
  {
    name: 'Otto Frei',
    host: 'www.ofrei.com',
    platform: 'google-site',
    confidence: 'verified',
  },
  // Whole-watch sources (donor watches) — fine for movements, never for parts.
  {
    name: 'Chrono24',
    host: 'www.chrono24.com',
    platform: 'google-site',
    confidence: 'verified',
    wholeWatchesOnly: true,
  },
];

// Alias → canonical base name. Keys are normalized (lowercase).
const ALIASES: Record<string, string> = {
  namoki: 'namokimods',
  namokimods: 'namokimods',
  'namoki mods': 'namokimods',
  dlwwatches: 'dlw',
  dlw: 'dlw',
  'dlw watches': 'dlw',
  ofrei: 'otto frei',
  'otto frei': 'otto frei',
  lucius: 'lucius atelier',
  'lucius atelier': 'lucius atelier',
  crystaltimes: 'crystaltimes',
  'crystal times': 'crystaltimes',
  cousins: 'cousins uk',
  'cousins uk': 'cousins uk',
  esslinger: 'esslinger',
  borel: 'jules borel',
  'jules borel': 'jules borel',
  watchgecko: 'watchgecko',
  chrono24: 'chrono24',
};

const BY_BASE: Record<string, VendorEntry> = Object.fromEntries(
  ENTRIES.map((e) => [e.name.toLowerCase(), e]),
);

export interface NormalizedVendor {
  /** Cleaned display name (parentheticals removed). */
  display: string;
  /** Qualifier captured from a parenthetical, if any (e.g. "complete watches only"). */
  qualifier: string | null;
  wholeWatchesOnly: boolean;
}

const WHOLE_WATCH_RE = /complete watch|whole watch|watches only|donor/i;

/** Split "Otto Frei (parts)" → {display:'Otto Frei', qualifier:'parts'} and flag
 *  whole-watch-only sources from either the qualifier or the name. */
export function normalizeVendorName(raw: string): NormalizedVendor {
  const m = raw.match(/^([^(]+?)\s*\(([^)]*)\)\s*$/);
  const display = (m?.[1] ?? raw).trim();
  const qualifier = m ? (m[2] ?? '').trim() : null;
  const wholeWatchesOnly = WHOLE_WATCH_RE.test(raw);
  return { display, qualifier, wholeWatchesOnly };
}

/** Resolve a free-text vendor string to a registry entry, or null if unknown. */
export function vendorEntry(raw: string): VendorEntry | null {
  const { display } = normalizeVendorName(raw);
  const key = display.toLowerCase();
  const base = ALIASES[key] ?? key;
  return BY_BASE[base] ?? null;
}
