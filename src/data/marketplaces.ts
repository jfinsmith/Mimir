// ─────────────────────────────────────────────────────────────────────────────
// Region + marketplace configuration for the buy-link builders (lib/buyLinks.ts).
// The locale-specific HOSTS live here so a region change is a data edit, not code.
// Only stable, verified hosts/params are encoded; brittle deep-link params are
// kept minimal (the keyword query is the durable core; Google is the fallback).
// ─────────────────────────────────────────────────────────────────────────────

export type RegionId = 'us' | 'uk' | 'eu' | 'au';

export interface Region {
  id: RegionId;
  label: string;
}

export const REGIONS: readonly Region[] = [
  { id: 'us', label: 'US' },
  { id: 'uk', label: 'UK' },
  { id: 'eu', label: 'EU' },
  { id: 'au', label: 'AU' },
];

export const DEFAULT_REGION: RegionId = 'us';

export function isRegionId(s: string): s is RegionId {
  return REGIONS.some((r) => r.id === s);
}

export interface RegionConfig {
  ebayHost: string;
  amazonHost: string;
  googleHost: string;
  /** ISO country for Etsy's ship_to filter. */
  etsyShipTo: string;
}

/** Per-region hosts. eBay/Amazon/Google have real locale domains; AliExpress and
 *  Chrono24 are global and handled directly in the builders. */
export const REGION_CONFIG: Record<RegionId, RegionConfig> = {
  us: {
    ebayHost: 'www.ebay.com',
    amazonHost: 'www.amazon.com',
    googleHost: 'www.google.com',
    etsyShipTo: 'US',
  },
  uk: {
    ebayHost: 'www.ebay.co.uk',
    amazonHost: 'www.amazon.co.uk',
    googleHost: 'www.google.co.uk',
    etsyShipTo: 'GB',
  },
  eu: {
    ebayHost: 'www.ebay.de',
    amazonHost: 'www.amazon.de',
    googleHost: 'www.google.de',
    etsyShipTo: 'DE',
  },
  au: {
    ebayHost: 'www.ebay.com.au',
    amazonHost: 'www.amazon.com.au',
    googleHost: 'www.google.com.au',
    etsyShipTo: 'AU',
  },
};

/** Marketplace names (as they appear, case-insensitively, in commonVendors[]). */
export const MARKETPLACE_NAMES = [
  'ebay',
  'amazon',
  'aliexpress',
  'etsy',
  'chrono24',
] as const;
export type MarketplaceName = (typeof MARKETPLACE_NAMES)[number];

/** Global hosts for the region-agnostic marketplaces. */
export const ALIEXPRESS_HOST = 'www.aliexpress.com';
export const CHRONO24_HOST = 'www.chrono24.com';
export const ETSY_HOST = 'www.etsy.com';
