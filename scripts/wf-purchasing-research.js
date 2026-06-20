export const meta = {
  name: 'mimir-purchasing-research',
  description: 'Heavy research on helping users buy the CORRECT watch movement/part: precise search operators, retailer deep-links, anti-counterfeit, UX',
  phases: [
    { title: 'Research', detail: '7 parallel lanes (operators, marketplaces, retailers, ID, trust, UX, legal)' },
    { title: 'Synthesize', detail: 'consolidate into a concrete MIMIR feature design' },
    { title: 'Critique', detail: 'adversarial review for fabrication / stale URL schemes / gaps' },
  ],
};

const MIMIR_CONTEXT = `MIMIR is a STATIC, client-side React+TS web app (no backend, no scraping, no
hot-linked images) cataloguing watch MOVEMENTS and modding PARTS for hobbyist
watchmakers. It already stores structured data per item:
- Movement: caliber (e.g. "NH35"), aliases (["7S26 upgrade","SII NH35A"]), brand,
  family id, baseCaliber, stemPartNo, complications, dimensions, commonVendors[].
- Part: name, category (case/dial/hands/crystal/stem-crown/spacer-ring/bezel/...),
  brand, fitsFamilies[]/fitsMovements[], handBore {hour,minute,second}, case opening,
  crystal Ø, etc., commonVendors[], references[].
The goal: help the user BUY THE CORRECT ITEM. Because the app is static, the
realistic mechanism is generating PRECISE, copy-ready SEARCH QUERIES and DEEP-LINK
URLs (built by PURE functions from the fields above) plus buying guidance — NOT a
live store. Everything must be implementable client-side with no API keys.`;

const RESEARCH_SCHEMA = {
  type: 'object',
  required: ['lane', 'techniques', 'notes'],
  properties: {
    lane: { type: 'string' },
    techniques: {
      type: 'array',
      items: {
        type: 'object',
        required: ['name', 'what', 'howTo', 'example', 'caveats'],
        properties: {
          name: { type: 'string' },
          what: { type: 'string' },
          howTo: { type: 'string' },
          example: { type: 'string', description: 'a CONCRETE query string or URL template, with {placeholders}' },
          appliesTo: { type: 'string' },
          caveats: { type: 'string' },
          confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
          sources: { type: 'array', items: { type: 'string' } },
        },
      },
    },
    notes: { type: 'string' },
  },
};

const SYNTHESIS_SCHEMA = {
  type: 'object',
  required: ['bestPractices', 'queryTemplates', 'featureDesign', 'risks', 'openQuestions'],
  properties: {
    bestPractices: {
      type: 'array',
      items: {
        type: 'object',
        required: ['category', 'practice', 'why'],
        properties: { category: { type: 'string' }, practice: { type: 'string' }, why: { type: 'string' } },
      },
    },
    queryTemplates: {
      type: 'array',
      items: {
        type: 'object',
        required: ['target', 'kind', 'urlTemplate', 'fields', 'example', 'caveat'],
        properties: {
          target: { type: 'string', description: 'e.g. Google exact, eBay BIN, Cousins UK, AliExpress' },
          kind: { type: 'string', enum: ['search', 'deeplink', 'lookup'] },
          urlTemplate: { type: 'string' },
          fields: { type: 'array', items: { type: 'string' }, description: 'which Movement/Part fields feed it' },
          example: { type: 'string' },
          caveat: { type: 'string' },
        },
      },
    },
    featureDesign: {
      type: 'object',
      required: ['summary', 'pureFunctions', 'dataModelAdditions', 'uiSurfaces', 'guardrails'],
      properties: {
        summary: { type: 'string' },
        pureFunctions: {
          type: 'array',
          items: {
            type: 'object',
            required: ['name', 'signature', 'purpose'],
            properties: { name: { type: 'string' }, signature: { type: 'string' }, purpose: { type: 'string' } },
          },
        },
        dataModelAdditions: { type: 'array', items: { type: 'string' } },
        uiSurfaces: { type: 'array', items: { type: 'string' } },
        guardrails: { type: 'array', items: { type: 'string' } },
      },
    },
    risks: { type: 'array', items: { type: 'string' } },
    openQuestions: { type: 'array', items: { type: 'string' } },
  },
};

const CRITIQUE_SCHEMA = {
  type: 'object',
  required: ['verdict', 'gaps', 'fabricationOrStaleUrlRisks', 'mustVerify', 'recommendation'],
  properties: {
    verdict: { type: 'string', enum: ['solid', 'needs-work'] },
    gaps: { type: 'array', items: { type: 'string' } },
    fabricationOrStaleUrlRisks: { type: 'array', items: { type: 'string' } },
    mustVerify: { type: 'array', items: { type: 'string' } },
    recommendation: { type: 'string' },
  },
};

const LANES = [
  { key: 'search-operators', t: `Research SEARCH-ENGINE precision/"forced" search techniques and how to encode them into URLs. Cover: exact-match double quotes; site:; intitle:/intext:/allintitle:; exclusion (-term); OR / parentheses; numeric ranges; Google Shopping (tbm=shop) and tbs filters; Bing and DuckDuckGo equivalents and their search-URL parameters (q=, &tbs=, etc.); proper URL-encoding of quotes/spaces. State which operators still work in 2025-2026 and engine differences. Give CONCRETE url templates with {placeholders} for searching an exact watch caliber/part number.` },
  { key: 'marketplace-deeplinks', t: `Research how to build DEEP-LINK SEARCH URLs for major marketplaces so a user lands on the right filtered results: eBay (sch/i.html?_nkw=, _sacat category, LH_ItemCondition, LH_BIN, _sop sort, aspect/item-specifics filters), Amazon (s?k=&rh=), AliExpress (search URL params), Etsy, Chrono24 (for whole watches/movements). Give current URL templates with {placeholders}, note how to URL-encode multi-word/quoted queries, and CAVEAT how brittle each scheme is (params change). Mention buyer-protection params where relevant.` },
  { key: 'specialist-retailers', t: `Research SPECIALIST watch parts/movement retailers and exactly how to search each precisely (by caliber, by manufacturer part number, by case reference): Cousins UK, Otto Frei, Esslinger, Jules Borel (cross-reference), HKEDmonton, Namoki MODS, DLW (dlwwatches), CrystalTimes, Lucius Atelier, WatchGecko/other mod shops, Caliber Corner (for cross-ref). For each: what identifiers they index on, and any URL search pattern if known. Note which sell GENUINE vs aftermarket, and regional availability.` },
  { key: 'correct-part-identification', t: `Research BEST PRACTICES for ensuring you order the CORRECT part (this is the core user need). Cover: matching by caliber AND sub-variant/execution; hand BORE sizes (hour/minute/second mm) as the decisive hand spec; dial foot positions vs feetless; case reference numbers; date wheel/date overlay; genuine ETA vs clone vs "ETA-compatible"; Seiko part-number coding and cross-reference (Casker, Seiko part catalogs); ETA/Ronda technical data sheets; movement variant suffixes. Explain cross-reference tools/databases watchmakers actually use, and how an app could prompt the user to confirm the right discriminators before buying.` },
  { key: 'counterfeit-trust', t: `Research avoiding COUNTERFEIT / wrong / scam parts and vetting sellers, since "correct item" includes "authentic & as-described". Cover: fake ETA/Sellita/Rolex/Seiko parts and "franken" parts; red flags in marketplace listings (price too low, stock photos, vague titles, new seller, no returns); how to vet AliExpress/eBay sellers (feedback, returns, buyer protection); what to verify from listing photos (engravings, finish); genuine-part serial/packaging checks; reputable-vendor lists. Provide a concrete checklist a user could be shown.` },
  { key: 'ux-patterns', t: `Research UX/PRODUCT PATTERNS for "where to buy" / "find this item" in catalog or aggregator apps that DON'T hold inventory and DON'T scrape. Cover: query-builder buttons that open precise searches in a new tab; "copy exact search string" to clipboard; multi-retailer compare rows; per-item vendor link lists; disclaimers ("verify before buying"); how price-comparison/affiliate sites surface outbound links; accessibility and opening external links safely. Cite real examples. Recommend concrete UI components for MIMIR detail pages and the Build Planner.` },
  { key: 'legal-affiliate-technical', t: `Research LEGAL/ETHICAL/TECHNICAL considerations for outbound buy-links from a STATIC client-side SPA. Cover: affiliate programs and whether they're feasible without a backend (eBay Partner Network, Amazon Associates, AliExpress portals, Skimlinks/Sovrn) and their link formats; FTC/affiliate DISCLOSURE requirements; rel="nofollow sponsored" and target/rel="noopener noreferrer"; link-rot mitigation (prefer search URLs over volatile product URLs); privacy (no trackers, no PII in query strings); robots/ToS limits on deep-linking; and whether building search URLs (vs scraping) is acceptable. Be concrete about what is safe to ship.` },
];

phase('Research');
const lanes = (
  await parallel(
    LANES.map((lane) => () =>
      agent(`${MIMIR_CONTEXT}\n\nLANE: ${lane.t}\n\nReturn 5-9 techniques. Every "example" must be a concrete, real query string or URL template (use {placeholders} like {caliber}, {partNo}). Cite real sources. Be honest with "confidence" and flag anything you could not verify.`, {
        schema: RESEARCH_SCHEMA,
        agentType: 'general-purpose',
        label: `research:${lane.key}`,
        phase: 'Research',
      }),
    ),
  )
).filter(Boolean);

log(`Research done: ${lanes.length}/${LANES.length} lanes returned.`);

phase('Synthesize');
const synthesis = await agent(
  `${MIMIR_CONTEXT}\n\nYou are the lead designer. Below are research findings from ${lanes.length} lanes (JSON).\n` +
    `Consolidate them into (1) a prioritized best-practices list, (2) a concrete set of QUERY/DEEP-LINK URL TEMPLATES keyed to the Movement/Part fields that feed them, (3) a concrete MIMIR feature design — PURE functions (name + TS signature + purpose) that build the URLs/queries, any data-model additions, the UI surfaces (detail page, Build Planner, parts), and the guardrails (static-only, no scraping, disclosure, safe external links, link-rot resilience), (4) risks, (5) open product questions for the maintainer.\n` +
    `Favor robust SEARCH urls over brittle product urls. Do not invent retailer URL schemes you are unsure of — mark those to verify.\n\nFINDINGS:\n${JSON.stringify(lanes, null, 2)}`,
  { schema: SYNTHESIS_SCHEMA, agentType: 'general-purpose', label: 'synthesize', phase: 'Synthesize' },
);

phase('Critique');
const critique = await agent(
  `You are an adversarial reviewer. Critically review this proposed design for helping users buy the correct watch part from a STATIC client-side app. Identify: gaps/missing angles; any URL templates or retailer schemes that look FABRICATED, guessed, or likely STALE (and must be verified against a live page before shipping); over-engineering; and anything that violates the static/no-scraping/no-tracking constraints. Give a final recommendation.\n\nMIMIR CONTEXT:\n${MIMIR_CONTEXT}\n\nPROPOSED DESIGN (JSON):\n${JSON.stringify(synthesis, null, 2)}`,
  { schema: CRITIQUE_SCHEMA, agentType: 'general-purpose', label: 'critique', phase: 'Critique' },
);

return { lanes, synthesis, critique };
