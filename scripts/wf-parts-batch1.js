export const meta = {
  name: 'mimir-parts-batch1',
  description: 'Research + adversarially verify real, sourced watch-modding parts for MIMIR',
  phases: [
    { title: 'Research', detail: 'one lane per ecosystem/category' },
    { title: 'Verify', detail: 'adversarially verify each part vs a real source' },
  ],
};

// ── Shared reference handed to every research agent ──────────────────────────
const FAMILIES = [
  'seiko-nh3x (NH34/35/36/38)',
  'seiko-7sxx (7S26/7S36)',
  'seiko-4rxx (4R35/36/…)',
  'seiko-6rxx (6R15/35/…)',
  'seiko-nh7x (NH70/72 skeleton)',
  'miyota-82xx (8215/821A/8205/…)',
  'miyota-9xxx (9015/9039/9019/9132/9075)',
  'miyota-91xx (9100/9122)',
  'dixmont-dgxx (DG2813/DG5833)',
  'eta-2824-clones (2824-2/SW200/ST2130/PT5000)',
  'eta-2892-clones (2892-A2/SW300)',
  'valjoux-7750-clones (7750/7753/7754/SW500)',
  'unitas-6497-clones (6497/6498/ST36)',
  'ronda-5xx (515/715/…)',
  'ronda-503x (5030.D chrono)',
  'seagull-st19 (ST1901 chrono)',
];

const PART_CATEGORIES = [
  'case', 'dial', 'hands', 'crystal', 'stem-crown', 'spacer-ring', 'bezel', 'gasket', 'rotor',
];

const PREAMBLE = `You are researching REAL, currently-or-recently-sold watch-modding PARTS for a
hobbyist-watchmaker catalog (MIMIR). Output STRICT data — every number must come
from a real product/spec page you actually consulted.

ABSOLUTE GUARDRAILS:
- NEVER fabricate a dimension. If a spec is not stated on a real page, set it to null.
- Each part MUST carry at least one real source URL in "references" (vendor product
  page, manufacturer spec, or a reputable mod-community spec page). No source → do
  not include the part.
- Set "dataConfidence" honestly: "high" only when a dimension/fitment is confirmed
  by a manufacturer/vendor spec (or two independent sources); "medium" for a single
  decent listing; "low" for hearsay. (high REQUIRES a reference.)
- Do NOT invent product names. Use the real product/SKU name.

THE SINGLE MOST IMPORTANT FIELD IS FITMENT. A part's compatibility is driven by:
- "fitsFamilies": array of MIMIR family ids the product explicitly fits. Use ONLY
  these ids (left of the paren):
${FAMILIES.map((f) => '    • ' + f).join('\n')}
  A Seiko mod hand set with 1.50/0.90/0.21 bores fits seiko-nh3x AND seiko-7sxx AND
  seiko-4rxx AND seiko-6rxx (same bores/footprint) — list all that apply.
- "fitsMovements": specific movement ids only when a single caliber is named
  (e.g. seiko-nh35, eta-2824-2, miyota-8215). Prefer fitsFamilies; leave [] if unsure.
- For HANDS, also fill "handBore" {hour,minute,second,chronographSweep?} in mm — this
  is what decides hand compatibility. Real bore standards: Seiko NH/7S/4R/6R =
  1.50/0.90/0.21; ETA 2824/SW200 = 1.50/0.90/0.25; ETA 2892 = 1.50/0.90/0.20;
  Valjoux 7750 = 2.00/1.20 (subdials ~0.20, sweep ~0.20); Miyota 82xx = 1.50/1.00;
  Miyota 9xxx = 1.52/1.00/0.17; Ronda 5xx = 1.20/0.70/0.20; Unitas 6497 = 2.00/1.15/0.27.
  Only record bores you can corroborate.
- For CASES, fill movementOpeningMm (the movement seat Ø), internalDepthMm,
  caseDiameterMm, crownPosition (clock pos like "3" or "3.8"), dateAperturePosition,
  crystalSeatDiameterMm, lugWidthMm — whatever the listing states.
- For DIALS, fill dialDiameterMm, dialFeet (clock positions array, [] if feetless),
  feetless (boolean), dateWindowPosition.
- For CRYSTAL, fill crystalDiameterMm, crystalType (flat|domed|double-domed|box),
  material (sapphire|mineral|acrylic).
- For STEM/CROWN, fill stemForCalibers (movement ids/families), crownThread,
  crownSizeMm, tubeThread.

CONVENTIONS:
- "id": kebab-case slug, unique, descriptive, e.g. "case-skx007-nh35",
  "hands-nh3x-plongeur", "crystal-skx-sapphire-dd", "stem-eta2824".
- "category": one of ${PART_CATEGORIES.join(' | ')}.
- Clock positions as "3", "4.5", "10:30" (decimal hours or h:mm). No words.
- "commonVendors": real shops (namokiMODS, DLW, CrystalTimes, Lucius Atelier,
  Cousins UK, Otto Frei, Esslinger, AliExpress, etc.).
- Prices in USD (single unit) low/high; null if not listed.
- Return 4–7 parts for your lane.`;

const RESEARCH_SCHEMA = {
  type: 'object',
  required: ['parts'],
  properties: {
    parts: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'category', 'name', 'fitsMovements', 'fitsFamilies', 'commonVendors', 'references', 'notes', 'dataConfidence'],
        properties: {
          id: { type: 'string' },
          category: { type: 'string', enum: PART_CATEGORIES },
          name: { type: 'string' },
          brand: { type: ['string', 'null'] },
          fitsMovements: { type: 'array', items: { type: 'string' } },
          fitsFamilies: { type: 'array', items: { type: 'string' } },
          movementOpeningMm: { type: ['number', 'null'] },
          internalDepthMm: { type: ['number', 'null'] },
          caseDiameterMm: { type: ['number', 'null'] },
          crownPosition: { type: ['string', 'null'] },
          dateAperturePosition: { type: ['string', 'null'] },
          crystalSeatDiameterMm: { type: ['number', 'null'] },
          lugWidthMm: { type: ['number', 'null'] },
          dialDiameterMm: { type: ['number', 'null'] },
          dialFeet: { type: ['array', 'null'], items: { type: 'string' } },
          feetless: { type: ['boolean', 'null'] },
          handBore: {
            type: ['object', 'null'],
            properties: {
              hour: { type: ['number', 'null'] },
              minute: { type: ['number', 'null'] },
              second: { type: ['number', 'null'] },
              chronographSweep: { type: ['number', 'null'] },
            },
          },
          handStyle: { type: ['string', 'null'] },
          crystalDiameterMm: { type: ['number', 'null'] },
          crystalType: { type: ['string', 'null'] },
          material: { type: ['string', 'null'] },
          stemForCalibers: { type: ['array', 'null'], items: { type: 'string' } },
          crownThread: { type: ['string', 'null'] },
          crownSizeMm: { type: ['number', 'null'] },
          tubeThread: { type: ['string', 'null'] },
          dateWindowPosition: { type: ['string', 'null'] },
          priceUsdLow: { type: ['number', 'null'] },
          priceUsdHigh: { type: ['number', 'null'] },
          commonVendors: { type: 'array', items: { type: 'string' } },
          references: {
            type: 'array',
            items: {
              type: 'object',
              required: ['label', 'url'],
              properties: { label: { type: 'string' }, url: { type: 'string' } },
            },
          },
          notes: { type: 'string' },
          dataConfidence: { type: 'string', enum: ['high', 'medium', 'low'] },
        },
      },
    },
  },
};

const VERIFY_SCHEMA = {
  type: 'object',
  required: ['id', 'verdict', 'confidence', 'notes'],
  properties: {
    id: { type: 'string' },
    verdict: { type: 'string', enum: ['confirmed', 'corrected', 'refuted'] },
    confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
    corrections: { type: ['object', 'null'] },
    notes: { type: 'string' },
  },
};

const LANES = [
  { key: 'seiko-cases', t: `LANE: Seiko mod CASES for NH35/NH36 (and 7S/4R/6R — same footprint). Research real cases from namokiMODS, DLW (dlwwatches), CrystalTimes, Lucius Atelier: SKX007/SKX013 replacement cases, "SUB" sub-style, Turtle, Samurai, Willard/6105, 62MAS/SPB-style, Captain Willard. Fill movementOpeningMm, internalDepthMm, caseDiameterMm, crownPosition, dateAperturePosition, crystalSeatDiameterMm, lugWidthMm. fitsFamilies should include seiko-nh3x (+seiko-7sxx/4rxx/6rxx where the listing says so).` },
  { key: 'seiko-dials', t: `LANE: Seiko mod DIALS for NH35/NH36 (28.5mm). Real dials from namokiMODS, DLW, CrystalTimes, Lucius Atelier. Fill dialDiameterMm (usually 28.5), feetless (most aftermarket are glue-mount/feetless → dialFeet []), dateWindowPosition (3 or 4.5 or none). Note no-date vs date variants. fitsFamilies seiko-nh3x (+7sxx/4rxx/6rxx).` },
  { key: 'seiko-hands', t: `LANE: Seiko mod HAND SETS for NH35/NH36/7S/4R/6R (bore 1.50/0.90/0.21). Real sets from DLW, namokiMODS, CrystalTimes, Lucius Atelier: plongeur, sword, snowflake, lollipop/ball, mercedes, dauphine, cathedral, syringe. ALWAYS fill handBore {hour:1.5,minute:0.9,second:0.21} when the set is for this group. fitsFamilies seiko-nh3x, seiko-7sxx, seiko-4rxx, seiko-6rxx.` },
  { key: 'seiko-crystals-bezels', t: `LANE: Seiko mod CRYSTALS and BEZELS/inserts. CRYSTALS (category crystal) sapphire double-dome/flat for SKX/Sub/Turtle from CrystalTimes/namokiMODS — fill crystalDiameterMm, crystalType, material:sapphire. BEZELS (category bezel) 120-click bezels + bezel inserts for SKX/Turtle. These are case-relative so fitsFamilies may be [] (note the target case in name/notes).` },
  { key: 'seiko-stems-spacers-gaskets', t: `LANE: Seiko STEM/CROWN, SPACER-RING, GASKET. stem-crown: NH35/NH36 stems + screw-down crowns (fill stemForCalibers, crownThread, crownSizeMm, tubeThread). spacer-ring: movement holder rings/spacers to seat an NH35 (~28.5mm) in larger cases. gasket: caseback/crystal/crown gaskets. Vendors: namokiMODS, DLW, Cousins UK. fitsFamilies seiko-nh3x where applicable.` },
  { key: 'eta-2824-parts', t: `LANE: ETA 2824-2 / Sellita SW200 parts from Cousins UK, Otto Frei, Esslinger. HANDS sets (bore 1.50/0.90/0.25 — note the 0.25 seconds), DIALS for the 2824 footprint (28.5mm, feet or feetless), STEM (2824 stem, give part no in notes). fitsFamilies eta-2824-clones.` },
  { key: 'eta-2892-7750-hands', t: `LANE: ETA 2892-A2 and Valjoux 7750 HANDS/DIALS from Cousins UK / Otto Frei. 2892 hands bore 1.50/0.90/0.20 (fitsFamilies eta-2892-clones). 7750 CHRONOGRAPH hand sets: main 2.00/1.20, subdial + central sweep hands (fill handBore incl chronographSweep ~0.20; fitsFamilies valjoux-7750-clones). Include dials where listed.` },
  { key: 'unitas-marina', t: `LANE: Unitas/ETA 6497-6498 / Seagull ST36 "Marina" parts. CASES 44–47mm (movementOpeningMm ~36.6, crystalSeatDiameterMm, lugWidthMm), HANDS (bore 2.00/1.15, seconds ~0.27 for the sub at 9 on 6497), DIALS 37–38.5mm. Vendors AliExpress, Esslinger, Cousins UK. fitsFamilies unitas-6497-clones.` },
  { key: 'miyota-parts', t: `LANE: Miyota parts. HANDS for 82xx (bore 1.50/1.00 — note the 1.00 minute, NOT 0.90; fitsFamilies miyota-82xx) and 9xxx (1.52/1.00/0.17; fitsFamilies miyota-9xxx/miyota-91xx). DG2813/Miyota mod CASES (fitsFamilies dixmont-dgxx/miyota-82xx). Vendors DLW, AliExpress, Cousins. Emphasise the 82xx 1.00mm minute bore in notes (incompatible with Seiko 0.90 hands).` },
  { key: 'ronda-quartz-parts', t: `LANE: Ronda 5xx and general quartz parts. HANDS for Ronda 5xx (bore 1.20/0.70/0.20; fitsFamilies ronda-5xx) from Esslinger/Cousins. Quartz DIALS. Note small bores vs mechanicals.` },
  { key: 'universal-crystals-gaskets', t: `LANE: UNIVERSAL crystals, gaskets, spacers (case-relative, fitsFamilies usually []). Generic sapphire crystals by diameter (flat & double-dome, 28–34mm) from Esslinger/Cousins/CrystalTimes (crystalDiameterMm, crystalType, material). Case-back/crystal/crown GASKETS. Generic movement holder SPACER-RINGs by size. Put the size in the name.` },
  { key: 'eta-cases-rotors-crowns', t: `LANE: ETA dress CASES (generic 2824/2892 cases from Cousins UK — movementOpeningMm ~25.6, depth, crystalSeatDiameterMm, lugWidthMm; fitsFamilies eta-2824-clones/eta-2892-clones), custom ROTORS (category rotor; for NH35/Miyota — fitsFamilies seiko-nh3x/miyota-82xx), and CROWNS/tubes from namokiMODS/DLW/Cousins.` },
];

phase('Research');
const compiled = await pipeline(
  LANES,
  (lane) =>
    agent(`${PREAMBLE}\n\n${lane.t}`, {
      schema: RESEARCH_SCHEMA,
      agentType: 'general-purpose',
      label: `research:${lane.key}`,
      phase: 'Research',
    }),
  (res) =>
    parallel(
      (res?.parts ?? []).map((part) => () =>
        agent(
          `You are ADVERSARIALLY verifying one researched watch-modding part. Be skeptical.\n\n` +
            `PART (JSON):\n${JSON.stringify(part, null, 2)}\n\n` +
            `Independently check, against a REAL source you fetch (a vendor product page, ` +
            `manufacturer spec, or reputable mod-community spec):\n` +
            `1. Does this product actually exist with this name?\n` +
            `2. Are the fitment claims (fitsFamilies/fitsMovements/handBore) correct? Hand-bore ` +
            `standards: Seiko NH/7S/4R/6R 1.50/0.90/0.21; ETA 2824 1.50/0.90/0.25; ETA 2892 ` +
            `1.50/0.90/0.20; Valjoux 7750 2.00/1.20; Miyota 82xx 1.50/1.00; Miyota 9xxx ` +
            `1.52/1.00/0.17; Ronda 5xx 1.20/0.70/0.20; Unitas 6497 2.00/1.15/0.27.\n` +
            `3. Are the key dimensions plausible/correct?\n\n` +
            `Return verdict "confirmed" if substantiated, "corrected" (with a "corrections" ` +
            `object of ONLY the fields to overwrite) if you found better values, or "refuted" ` +
            `if it cannot be substantiated at all (default to refuted when you find NO source). ` +
            `Never invent numbers; corrected values must come from a real page you cite in notes.`,
          {
            schema: VERIFY_SCHEMA,
            agentType: 'general-purpose',
            label: `verify:${part.id}`,
            phase: 'Verify',
          },
        ).then((v) => ({ ...part, _verify: v })),
      ),
    ),
);

const parts = compiled.flat().filter(Boolean);
log(`Compiled ${parts.length} parts (pre-codegen).`);
return { parts };
