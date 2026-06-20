// ─────────────────────────────────────────────────────────────────────────────
// BUY-LINK BUILDERS — PURE. Turn a Movement/Part (+ region) into precise, copy-
// ready search queries and deep-link URLs that land the user on the RIGHT item.
// MIMIR holds no inventory, scrapes nothing, and earns nothing from these links;
// every URL is something the user could have typed.
//
// Discipline (mirrors lib/cost.ts / lib/fitment.ts):
//  • One encoder (encodeQ = encodeURIComponent exactly once) — no %2522, straight
//    quotes only. eBay/marketplaces avoid '+'/comma-OR so they share it safely.
//  • Only VERIFIED retailer schemes emit native deep-links; unverified vendors
//    degrade to a precise Google `site:{host}` search (worse-but-working).
//  • Prefer durable SEARCH urls over brittle product urls.
//  • Whole-watch vendors are never offered for a loose PART (wrong-fitment trap).
//  • Affiliate seam: links are plain today; withAffiliate() is the single future
//    hook (currently identity) so monetization is a later config change, not a
//    rewrite.
// ─────────────────────────────────────────────────────────────────────────────

import type { Movement, Part, PartCategory } from '@/types';
import {
  ALIEXPRESS_HOST,
  CHRONO24_HOST,
  ETSY_HOST,
  MARKETPLACE_NAMES,
  REGION_CONFIG,
  type RegionId,
} from '@/data/marketplaces';
import { normalizeVendorName, vendorEntry } from '@/data/vendors';
import type { ResolvedBuild } from './build';

export type BuyLinkKind = 'search' | 'deeplink' | 'lookup';

export interface BuyLink {
  id: string;
  label: string;
  url: string;
  kind: BuyLinkKind;
  /** The raw query string, for a "copy exact search" chip. */
  copyString?: string;
  /** A short caveat shown next to the link (keyword match, whole-watch source…). */
  note?: string;
}

// ── Encoding (the one helper) ────────────────────────────────────────────────
export function encodeQ(raw: string): string {
  return encodeURIComponent(raw);
}

/** Single future monetization hook. Identity today (neutral, no affiliate). */
function withAffiliate(url: string): string {
  return url;
}

// ── Query strings ────────────────────────────────────────────────────────────
function isMovement(item: Movement | Part): item is Movement {
  return 'caliber' in item;
}

/** Quoted OR-group of a caliber + its real aliases, for Google-family engines. */
export function buildAliasGroup(
  caliber: string,
  aliases: string[],
  max = 3,
): string {
  const tokens = [caliber, ...aliases].slice(0, max + 1);
  return '(' + tokens.map((t) => `"${t}"`).join(' OR ') + ')';
}

/** The human-readable exact-search string used for copy chips + Google. */
export function buildQuery(item: Movement | Part): string {
  return isMovement(item) ? `"${item.caliber}" movement` : item.name;
}

/** Unquoted keyword for marketplaces (quotes over-restrict eBay/Amazon search). */
function keyword(item: Movement | Part): string {
  return isMovement(item) ? `${item.caliber} movement` : item.name;
}

// ── Builders ─────────────────────────────────────────────────────────────────
export interface GoogleOpts {
  shop?: boolean;
  genuineOnly?: boolean;
  siteHost?: string;
  useAliases?: boolean;
  extraTerm?: string;
}

export function buildGoogleSearch(
  item: Movement | Part,
  region: RegionId,
  opts: GoogleOpts = {},
): BuyLink {
  const cfg = REGION_CONFIG[region];
  let q =
    isMovement(item) && opts.useAliases
      ? `${buildAliasGroup(item.caliber, item.aliases)} movement`
      : buildQuery(item);
  if (opts.extraTerm) q += ` ${opts.extraTerm}`;
  if (opts.genuineOnly) q += ' -replica -fake -clone';
  if (opts.siteHost) q += ` site:${opts.siteHost}`;
  const path = opts.shop ? '/search?tbm=shop&q=' : '/search?q=';
  return {
    id: `google${opts.shop ? '-shop' : ''}${opts.siteHost ? '-' + opts.siteHost : ''}`,
    label: opts.shop
      ? 'Google Shopping'
      : opts.siteHost
        ? `Search ${opts.siteHost}`
        : 'Google',
    url: withAffiliate(`https://${cfg.googleHost}${path}${encodeQ(q)}`),
    kind: 'search',
    copyString: q,
  };
}

export interface EbayOpts {
  sold?: boolean;
  genuineOnly?: boolean;
}

export function buildEbaySearch(
  item: Movement | Part,
  region: RegionId,
  opts: EbayOpts = {},
): BuyLink {
  const cfg = REGION_CONFIG[region];
  let q = keyword(item);
  if (opts.genuineOnly) q += ' -replica -fake';
  const params = [`_nkw=${encodeQ(q)}`];
  if (opts.sold) params.push('LH_Sold=1', 'LH_Complete=1', '_sop=13');
  else params.push('_sop=12');
  return {
    id: opts.sold ? 'ebay-sold' : 'ebay',
    label: opts.sold ? 'eBay — sold prices' : 'eBay',
    url: withAffiliate(
      `https://${cfg.ebayHost}/sch/i.html?${params.join('&')}`,
    ),
    kind: 'deeplink',
    copyString: q,
    note: opts.sold
      ? 'recent sold listings — price sanity check'
      : 'keyword match — confirm the exact variant',
  };
}

export function buildMarketplaceSearch(
  name: string,
  item: Movement | Part,
  region: RegionId,
): BuyLink | null {
  const cfg = REGION_CONFIG[region];
  const q = keyword(item);
  const enc = encodeQ(q);
  switch (name) {
    case 'ebay':
      return buildEbaySearch(item, region);
    case 'amazon':
      return {
        id: 'amazon',
        label: 'Amazon',
        url: withAffiliate(`https://${cfg.amazonHost}/s?k=${enc}`),
        kind: 'deeplink',
        copyString: q,
        note: 'keyword match — confirm the exact variant',
      };
    case 'aliexpress':
      return {
        id: 'aliexpress',
        label: 'AliExpress',
        url: withAffiliate(
          `https://${ALIEXPRESS_HOST}/wholesale?SearchText=${enc}`,
        ),
        kind: 'deeplink',
        copyString: q,
        note: 'keyword match — vet the seller before buying',
      };
    case 'etsy':
      return {
        id: 'etsy',
        label: 'Etsy',
        url: withAffiliate(
          `https://${ETSY_HOST}/search?q=${enc}&ship_to=${cfg.etsyShipTo}`,
        ),
        kind: 'deeplink',
        copyString: q,
        note: 'often vintage / NOS',
      };
    case 'chrono24':
      return {
        id: 'chrono24',
        label: 'Chrono24',
        url: withAffiliate(
          `https://${CHRONO24_HOST}/search/index.htm?query=${enc}&dosearch=true`,
        ),
        kind: 'deeplink',
        copyString: q,
        note: 'whole/donor watches',
      };
    default:
      return null;
  }
}

/** A specialist retailer link: native deep-link only when the platform pattern is
 *  verified; otherwise a precise Google site:{host} search. */
export function buildSpecialistSearch(
  vendorRaw: string,
  item: Movement | Part,
  region: RegionId,
): BuyLink {
  const { display } = normalizeVendorName(vendorRaw);
  const entry = vendorEntry(vendorRaw);
  if (!entry) {
    // Unknown vendor: Google search with the vendor name as a keyword term.
    return buildGoogleSearch(item, region, { extraTerm: display });
  }
  const q = keyword(item);
  const enc = encodeQ(q);
  if (entry.confidence === 'verified' && entry.platform !== 'google-site') {
    let url: string | null = null;
    switch (entry.platform) {
      case 'shopify':
        url = `https://${entry.host}/search?q=${enc}`;
        break;
      case 'bigcommerce':
        url = `https://${entry.host}/search.php?search_query=${enc}`;
        break;
      case 'woocommerce':
        url = `https://${entry.host}/?s=${enc}&post_type=product`;
        break;
      case 'cousins':
        url = `https://${entry.host}/search?SearchTerm=${enc}`;
        break;
    }
    if (url) {
      return {
        id: `vendor-${entry.host}`,
        label: entry.name,
        url: withAffiliate(url),
        kind: 'deeplink',
        copyString: q,
      };
    }
  }
  // Fallback: precise Google site: search (host known, search scheme unverified).
  const g = buildGoogleSearch(item, region, { siteHost: entry.host });
  return { ...g, id: `vendor-${entry.host}`, label: entry.name };
}

/** Spec-verification (not buy) links for a movement. */
export function buildVerifyLinks(m: Movement): BuyLink[] {
  return [
    {
      id: 'calibercorner',
      label: 'Caliber Corner',
      url: `https://calibercorner.com/?s=${encodeQ(m.caliber)}`,
      kind: 'lookup',
      note: 'verify specs',
    },
  ];
}

/** The ordered list of buy/search links the <VendorLinks> row renders. */
export function buildBuyLinks(
  item: Movement | Part,
  region: RegionId,
): BuyLink[] {
  const out: BuyLink[] = [];
  const seen = new Set<string>();
  const push = (link: BuyLink | null) => {
    if (!link || seen.has(link.url)) return;
    seen.add(link.url);
    out.push(link);
  };

  // 1. The item's own commonVendors, in order.
  for (const raw of item.commonVendors) {
    const norm = normalizeVendorName(raw);
    const lower = norm.display.toLowerCase();
    const marketplace = MARKETPLACE_NAMES.find((m) => lower.includes(m));
    // Never route a loose PART search to a whole-watch source.
    if (norm.wholeWatchesOnly && !isMovement(item)) continue;
    if (marketplace) {
      const link = buildMarketplaceSearch(marketplace, item, region);
      if (link && norm.wholeWatchesOnly)
        link.note = 'whole/donor watches — not loose parts';
      push(link);
    } else {
      const entry = vendorEntry(raw);
      if (entry?.wholeWatchesOnly && !isMovement(item)) continue;
      push(buildSpecialistSearch(raw, item, region));
    }
  }

  // 2. Always offer eBay (keyword) + sold-comps for movements.
  push(buildEbaySearch(item, region));
  if (isMovement(item)) push(buildEbaySearch(item, region, { sold: true }));

  // 3. Google fallbacks (always work): genuine-only, then Shopping.
  push(
    buildGoogleSearch(item, region, {
      genuineOnly: true,
      useAliases: isMovement(item),
    }),
  );
  push(buildGoogleSearch(item, region, { shop: true }));

  // 4. Spec verification for movements.
  if (isMovement(item)) for (const v of buildVerifyLinks(item)) push(v);

  return out;
}

// ── Build Planner: shopping list export ──────────────────────────────────────
export interface ShoppingList {
  /** One copy-ready query line per filled slot + the movement. */
  lines: string[];
  /** The newline-joined block for a single "copy all" action. */
  copyBlock: string;
  /** One representative search link per item, for an "open each" action. */
  openLinks: BuyLink[];
  /** Items still missing data the buyer must confirm. */
  cautions: string[];
}

export function buildShoppingList(
  build: ResolvedBuild,
  region: RegionId,
): ShoppingList {
  const lines: string[] = [];
  const openLinks: BuyLink[] = [];
  const cautions: string[] = [];

  const add = (item: Movement | Part, label: string) => {
    lines.push(`${label}: ${buildQuery(item)}`);
    const g = buildGoogleSearch(item, region, {
      genuineOnly: true,
      useAliases: isMovement(item),
    });
    openLinks.push({ ...g, label });
  };

  if (build.movement) add(build.movement, build.movement.caliber);
  for (const cat of Object.keys(build.parts) as PartCategory[]) {
    const part = build.parts[cat];
    if (!part) continue;
    add(part, part.name);
    if (part.dataConfidence !== 'high')
      cautions.push(
        `${part.name}: ${part.dataConfidence} confidence — verify fitment.`,
      );
  }

  return { lines, copyBlock: lines.join('\n'), openLinks, cautions };
}

// ── Discriminator checklist ──────────────────────────────────────────────────
// The fields a buyer must confirm to get the CORRECT variant of a part for this
// movement. Built from the same fields the fitment engine reads; null surfaces
// as a caution (never guessed).

export interface Discriminator {
  label: string;
  value: string | null;
  caution: boolean;
}

const mm = (n: number | null): string | null => (n == null ? null : `${n}mm`);

export function discriminatorChecklist(
  category: PartCategory,
  m: Movement | null,
): Discriminator[] {
  if (!m) return [];
  const d = (label: string, value: string | null): Discriminator => ({
    label,
    value,
    caution: value == null,
  });
  switch (category) {
    case 'hands': {
      const h = m.handSizes;
      const items = [
        d('Hour bore', mm(h.hour)),
        d('Minute bore', mm(h.minute)),
        d('Second bore', mm(h.second)),
      ];
      if (m.complications.includes('chronograph'))
        items.push(d('Chrono sweep bore', mm(h.chronographSweep ?? null)));
      return items;
    }
    case 'dial':
      return [
        d(
          'Dial feet',
          m.dialFeet == null
            ? null
            : m.dialFeet.length === 0
              ? 'feetless'
              : m.dialFeet.join(' & '),
        ),
        d('Date window', m.dateWindowPosition),
        d('Casing Ø', mm(m.casingDiameterMm ?? m.diameterMm)),
      ];
    case 'case':
      return [
        d('Crown position', m.crownPositions?.join(' / ') ?? null),
        d('Casing Ø', mm(m.casingDiameterMm ?? m.diameterMm)),
        d('Date aperture', m.dateWindowPosition),
      ];
    case 'stem-crown':
      return [d('Stem part no.', m.stemPartNo), d('Caliber', m.caliber)];
    case 'crystal':
      return [
        d('Note', 'Crystal fit is set by the CASE seat, not the movement.'),
      ];
    default:
      return [d('Caliber', m.caliber)];
  }
}
