import { describe, it, expect } from 'vitest';
import {
  buildAliasGroup,
  buildBuyLinks,
  buildEbaySearch,
  buildGoogleSearch,
  buildMarketplaceSearch,
  buildQuery,
  buildShoppingList,
  buildSpecialistSearch,
  discriminatorChecklist,
  encodeQ,
} from './buyLinks';
import { makeMovement, makePart } from '@/test/factories';

const nh35 = makeMovement({
  id: 'seiko-nh35',
  caliber: 'NH35',
  aliases: ['NH35A', '7S26 upgrade'],
  family: 'seiko-nh3x',
  handSizes: { hour: 1.5, minute: 0.9, second: 0.21 },
  commonVendors: ['namokiMODS', 'eBay (complete watches only)'],
});

describe('encodeQ', () => {
  it('encodes quotes as %22 and spaces as %20, exactly once', () => {
    expect(encodeQ('"NH35" movement')).toBe('%22NH35%22%20movement');
    // no double-encoding
    expect(encodeQ('"NH35"')).not.toContain('%2522');
  });
});

describe('buildAliasGroup / buildQuery', () => {
  it('builds a quoted OR group capped at max', () => {
    expect(buildAliasGroup('NH35', ['NH35A', '7S26 upgrade'])).toBe(
      '("NH35" OR "NH35A" OR "7S26 upgrade")',
    );
  });
  it('quotes the caliber for movements; uses the name for parts', () => {
    expect(buildQuery(nh35)).toBe('"NH35" movement');
    expect(buildQuery(makePart({ name: 'CT Sapphire DD' }))).toBe(
      'CT Sapphire DD',
    );
  });
});

describe('buildGoogleSearch', () => {
  it('adds genuine-only operators and the alias group for movements', () => {
    const l = buildGoogleSearch(nh35, 'us', {
      genuineOnly: true,
      useAliases: true,
    });
    expect(l.url.startsWith('https://www.google.com/search?q=')).toBe(true);
    expect(l.copyString).toContain('("NH35" OR "NH35A"');
    expect(l.copyString).toContain('-replica -fake -clone');
  });
  it('honors region host and site: scoping', () => {
    const l = buildGoogleSearch(nh35, 'uk', { siteHost: 'cousinsuk.com' });
    expect(l.url.startsWith('https://www.google.co.uk/search?q=')).toBe(true);
    expect(l.copyString).toContain('site:cousinsuk.com');
  });
});

describe('buildEbaySearch', () => {
  it('uses the region host and a sold-comps filter', () => {
    expect(buildEbaySearch(nh35, 'us').url).toContain('www.ebay.com/sch/');
    expect(buildEbaySearch(nh35, 'uk').url).toContain('www.ebay.co.uk/sch/');
    const sold = buildEbaySearch(nh35, 'us', { sold: true });
    expect(sold.url).toContain('LH_Sold=1');
    expect(sold.url).toContain('LH_Complete=1');
  });
  it('never emits + or comma-OR (shares the single encoder)', () => {
    const url = buildEbaySearch(nh35, 'us').url;
    expect(url).not.toContain('+');
    expect(url).not.toContain('%2C'); // no comma-OR
  });
});

describe('buildSpecialistSearch', () => {
  it('emits a native deep-link for a verified platform', () => {
    const l = buildSpecialistSearch('namokiMODS', nh35, 'us');
    expect(l.url).toBe('https://www.namokimods.com/search?q=NH35%20movement');
    expect(l.kind).toBe('deeplink');
  });
  it('falls back to Google site: for an unverified platform', () => {
    const l = buildSpecialistSearch('DLW', nh35, 'us');
    expect(l.url).toContain('google.com/search?q=');
    expect(l.copyString).toContain('site:www.dlwwatches.com');
  });
  it('uses a Google keyword search (vendor name) for an unknown vendor', () => {
    const l = buildSpecialistSearch("Bob's Watch Parts", nh35, 'us');
    expect(l.url).toContain('google.com/search?q=');
    expect(l.copyString).toContain("Bob's Watch Parts");
  });
});

describe('buildMarketplaceSearch', () => {
  it('builds region-aware Amazon and global AliExpress/Etsy/Chrono24', () => {
    expect(buildMarketplaceSearch('amazon', nh35, 'uk')?.url).toContain(
      'www.amazon.co.uk/s?k=',
    );
    expect(buildMarketplaceSearch('aliexpress', nh35, 'us')?.url).toContain(
      'aliexpress.com/wholesale?SearchText=',
    );
    expect(buildMarketplaceSearch('etsy', nh35, 'uk')?.url).toContain(
      'ship_to=GB',
    );
    expect(buildMarketplaceSearch('chrono24', nh35, 'us')?.url).toContain(
      'chrono24.com',
    );
  });
});

describe('buildBuyLinks', () => {
  it('includes the vendor, eBay, sold-comps, Google + verify for a movement', () => {
    const links = buildBuyLinks(nh35, 'us');
    const ids = links.map((l) => l.id);
    expect(ids).toContain('vendor-www.namokimods.com');
    expect(ids).toContain('ebay');
    expect(ids).toContain('ebay-sold');
    expect(ids).toContain('google');
    expect(ids).toContain('calibercorner');
    // no duplicate URLs
    expect(new Set(links.map((l) => l.url)).size).toBe(links.length);
  });

  it('never routes a loose PART search to a whole-watch vendor', () => {
    const part = makePart({
      name: 'Generic dial',
      category: 'dial',
      commonVendors: ['Chrono24 (complete watches only)', 'namokiMODS'],
    });
    const links = buildBuyLinks(part, 'us');
    expect(links.some((l) => l.id === 'chrono24')).toBe(false);
    expect(links.some((l) => l.id === 'vendor-www.namokimods.com')).toBe(true);
    // parts get no sold-comps line (movements only)
    expect(links.some((l) => l.id === 'ebay-sold')).toBe(false);
  });
});

describe('discriminatorChecklist', () => {
  it('lists hand bores and flags unknowns as cautions', () => {
    const ok = discriminatorChecklist('hands', nh35);
    expect(ok.find((d) => d.label === 'Minute bore')?.value).toBe('0.9mm');
    expect(ok.every((d) => !d.caution)).toBe(true);

    const blind = discriminatorChecklist(
      'hands',
      makeMovement({ handSizes: { hour: null, minute: null, second: null } }),
    );
    expect(blind.every((d) => d.caution)).toBe(true);
  });
  it('returns nothing without a movement', () => {
    expect(discriminatorChecklist('hands', null)).toEqual([]);
  });
});

describe('buildShoppingList', () => {
  it('emits one query line per movement + part with a copy block', () => {
    const list = buildShoppingList(
      {
        movement: nh35,
        parts: { hands: makePart({ name: 'Sword hands' }) },
      },
      'us',
    );
    expect(list.lines).toHaveLength(2);
    expect(list.copyBlock).toContain('\n');
    expect(list.openLinks).toHaveLength(2);
  });
});
