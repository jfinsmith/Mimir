import type { MovementFamily } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Movement families — the fitment backbone. A case/dial/hands part can target a
// family id and inherit to every member. `sharedHandSizes` is the authority the
// data validator checks each member against (a contradiction fails the build).
//
// `sharedHandSizes` is only set where the family-standard bores are verified;
// `sharedDialFeet` is left null wherever exact clock positions are unverified
// (no guessing — those builds lean on feetless dials / maker fitment lists).
// ─────────────────────────────────────────────────────────────────────────────

export const families: MovementFamily[] = [
  {
    id: 'seiko-nh3x',
    label: 'Seiko NH-series (NH34 / NH35 / NH36 / NH38)',
    members: ['seiko-nh34', 'seiko-nh35', 'seiko-nh36', 'seiko-nh38'],
    sharedHandSizes: { hour: 1.5, minute: 0.9, second: 0.21 },
    sharedDialFeet: null, // exact feet positions unverified; aftermarket dials are usually feetless
    sharedDiameterMm: 27.4,
    notes:
      'Interchangeable footprint, hand sizes and dial feet across the NH3x. Aftermarket dials are commonly feetless (glue-mount). The hobbyist default platform.',
  },
  {
    id: 'miyota-82xx',
    label: 'Miyota 82xx (8215 / 821A / 8205 / 8200 / 82S7)',
    members: [
      'miyota-8215',
      'miyota-821a',
      'miyota-8205',
      'miyota-8200',
      'miyota-82s7',
    ],
    sharedHandSizes: { hour: 1.5, minute: 1.0, second: 0.17 },
    sharedDialFeet: ['5:30', '10:30'],
    sharedDiameterMm: 26.0,
    notes:
      'Note the 1.00mm MINUTE bore — different from the NH3x (0.90mm), so NH-spec hands do NOT fit. Mostly non-hacking.',
  },
  {
    id: 'miyota-9xxx',
    label: 'Miyota 9xxx (9015 / 9039)',
    members: ['miyota-9015', 'miyota-9039'],
    sharedHandSizes: { hour: 1.5, minute: 0.9, second: 0.25 },
    sharedDialFeet: null,
    sharedDiameterMm: 26.0,
    notes:
      'Thin high-beat (28,800) family. NOT interchangeable with the 82xx — the stem offset differs (≈1.53mm) and hand bores differ (0.90/0.25 vs 1.00/0.17).',
  },
  {
    id: 'eta-2824-clones',
    label:
      'ETA 2824-2 footprint (2824-2 / 2801-2 / 2836-2 / SW200-1 / SW220-1 / ST2130 / PT5000 / Hangzhou 6300)',
    members: [
      'eta-2824-2',
      'eta-2801-2',
      'eta-2836-2',
      'sellita-sw200-1',
      'sellita-sw220-1',
      'seagull-st2130',
      'hkpt-pt5000',
      'hangzhou-6300',
    ],
    sharedHandSizes: { hour: 1.5, minute: 0.9, second: 0.25 },
    sharedDialFeet: null, // "2824 feet" — exact positions unverified in seed sources
    sharedDiameterMm: 25.6,
    notes:
      'Sellita SW200-1 and Seagull ST2130 are drop-in clones of the ETA 2824-2: shared 25.6mm footprint, dial feet, hand sizes and stem.',
  },
  {
    id: 'eta-2892-clones',
    label: 'ETA 2892-A2 footprint (2892-A2 / SW300-1 / Soprod A10)',
    members: ['eta-2892-a2', 'sellita-sw300-1', 'soprod-a10'],
    sharedHandSizes: { hour: 1.5, minute: 0.9, second: 0.2 }, // table flags second bore "verify"
    sharedDialFeet: null,
    sharedDiameterMm: 25.6,
    notes:
      'Thin (3.6mm) premium base. Sellita SW300-1 is the 2892 analog. A common modular base for adding complications.',
  },
  {
    id: 'valjoux-7750-clones',
    label: 'Valjoux 7750 footprint (7750 / 7751 / Sellita SW500)',
    members: ['eta-7750', 'eta-7751', 'sellita-sw500'],
    sharedHandSizes: { hour: 1.5, minute: 0.9, second: 0.25 }, // 7750 verified; 7751/SW500 left null (compatible)
    sharedDialFeet: null,
    sharedDiameterMm: 30.0,
    notes:
      'Cam-actuated chronograph workhorse — tall (7.9mm). The 7751 adds a full calendar + moonphase; Sellita SW500 is 7750-compatible (footprint, feet, stem).',
  },
  {
    id: 'ronda-5xx',
    label: 'Ronda 5xx quartz (515 / 515.24H / 715)',
    members: ['ronda-515', 'ronda-515-24h', 'ronda-715'],
    sharedHandSizes: { hour: 1.2, minute: 0.7, second: 0.2 },
    sharedDialFeet: null,
    sharedDiameterMm: 26.0,
    notes:
      'Swiss quartz workhorse family. Smaller hand bores than the mechanicals. The 515.24H adds a 24-hour GMT hand (1.60mm bore).',
  },
  {
    id: 'ronda-503x',
    label: 'Ronda 50xx quartz chronographs (5030.D / 5040.B)',
    members: ['ronda-5030d'],
    sharedHandSizes: null, // hand bores unverified
    sharedDialFeet: null,
    sharedDiameterMm: null,
    notes:
      '3-eye / 4-eye quartz chronographs popular in microbrands. Date at 4:30. Distinct from the 5xx three-handers.',
  },
  {
    id: 'seagull-st19',
    label: 'Seagull ST19 chronograph (ST1901)',
    members: ['seagull-st1901'],
    sharedHandSizes: null,
    sharedDialFeet: null,
    sharedDiameterMm: 31.3,
    notes:
      'Column-wheel manual chronograph, Venus 175 lineage. 2-register (running seconds @9, 30-min @3).',
  },
  {
    id: 'unitas-6497-clones',
    label: 'Unitas/ETA 6497 family (6497-1 / 6498-1 / Seagull ST36)',
    members: ['eta-6497-1', 'eta-6498-1', 'seagull-st36'],
    sharedHandSizes: { hour: 2.0, minute: 1.15, second: 0.27 },
    sharedDialFeet: null,
    sharedDiameterMm: 36.6,
    notes:
      'Large (16.5‴) manual movements for 44mm+ "Marina" builds. 6497 = small-seconds @9 (Lépine); 6498 = small-seconds @6 (Savonnette). Seagull ST36 is the budget clone.',
  },
  {
    id: 'seagull-st16',
    label: 'Seagull ST16 budget autos (TY2718 family)',
    members: ['seagull-st16'],
    sharedHandSizes: null,
    sharedDialFeet: null,
    sharedDiameterMm: null,
    notes:
      'Common budget automatic family (date / day-date variants). Verify specs per individual variant.',
  },
  {
    id: 'seiko-vk-mecaquartz',
    label: 'Seiko/TMI VK mecaquartz (VK63 / VK64 / VK67)',
    members: ['seiko-vk63', 'seiko-vk67'],
    sharedHandSizes: null,
    sharedDialFeet: null,
    sharedDiameterMm: null,
    notes:
      'Mecaquartz: quartz timekeeping with a snap-action mechanical chronograph. A modder favourite for crisp pusher feel.',
  },
  {
    id: 'seiko-vh-quartz',
    label: 'Seiko/TMI VH quartz (VH31)',
    members: ['seiko-vh31'],
    sharedHandSizes: null,
    sharedDialFeet: null,
    sharedDiameterMm: null,
    notes:
      'Sweeping-seconds quartz (hand steps at ~4 Hz for a near-mechanical sweep). Fits some NH-style cases — verify footprint.',
  },
  {
    id: 'seiko-7sxx',
    label: 'Seiko 7S-series (7S26 / 7S36)',
    members: ['seiko-7s26', 'seiko-7s36'],
    sharedHandSizes: { hour: 1.5, minute: 0.9, second: 0.21 },
    sharedDialFeet: null,
    sharedDiameterMm: 27.4,
    notes:
      'The original SKX / Seiko 5 engine; non-hacking, non-handwinding. Shares the 27.4mm footprint and 1.5/0.9/0.21 hands with the 4R/6R/NH lineage (largely dial/hand-interchangeable).',
  },
  {
    id: 'seiko-4rxx',
    label: 'Seiko 4R-series (4R34 / 4R35 / 4R36)',
    members: ['seiko-4r34', 'seiko-4r35', 'seiko-4r36'],
    sharedHandSizes: { hour: 1.5, minute: 0.9, second: 0.21 },
    sharedDialFeet: null,
    sharedDiameterMm: 27.4,
    notes:
      'Hacking + hand-winding successor to the 7S; the SRPD / "5 Sports" engine (4R34 is the caller GMT). Unbranded export equivalents are the TMI NH35/NH36/NH34.',
  },
  {
    id: 'seiko-6rxx',
    label: 'Seiko 6R-series (6R15 / 6R35)',
    members: ['seiko-6r15', 'seiko-6r35'],
    sharedHandSizes: { hour: 1.5, minute: 0.9, second: 0.21 },
    sharedDialFeet: null,
    sharedDiameterMm: 27.4,
    notes:
      'In-house higher-grade Seiko 27.4mm autos (6R35 ≈ 70h reserve). Same footprint/hands as the 4R/NH, but used in OEM Seiko cases.',
  },
  {
    id: 'seiko-nh7x',
    label: 'Seiko NH7x skeleton (NH70)',
    members: ['seiko-nh70'],
    sharedHandSizes: null,
    sharedDialFeet: null,
    sharedDiameterMm: 27.4,
    notes:
      'Open-worked / skeletonised NH-family auto (no date). Paired with skeleton dials; shares the NH3x footprint and stem.',
  },
  {
    id: 'miyota-91xx',
    label: 'Miyota 91xx premium (9100)',
    members: ['miyota-9100'],
    sharedHandSizes: null,
    sharedDialFeet: null,
    sharedDiameterMm: 30.2,
    notes:
      'Premium 28,800 multifunction (power-reserve + day + month + 24h + date) on a larger 30.2mm footprint than the 90xx three-handers.',
  },
  {
    id: 'miyota-6pxx',
    label: 'Miyota 6Pxx quartz moonphase (6P00)',
    members: ['miyota-6p00'],
    sharedHandSizes: null,
    sharedDialFeet: null,
    sharedDiameterMm: 23.3,
    notes:
      'Multifunction quartz with day, date, 24-hour and MOONPHASE. A popular budget moonphase platform in microbrands.',
  },
  {
    id: 'miyota-osxx',
    label: 'Miyota OS-series quartz chronographs (OS20)',
    members: ['miyota-os20'],
    sharedHandSizes: null,
    sharedDialFeet: null,
    sharedDiameterMm: 30.8,
    notes:
      'Inexpensive quartz chronographs (small running seconds + central chrono hand). Very common in affordable chrono homages.',
  },
  {
    id: 'miyota-quartz',
    label: 'Miyota basic quartz (2035)',
    members: ['miyota-2035'],
    sharedHandSizes: null,
    sharedDialFeet: ['7:00', '11:00'],
    sharedDiameterMm: null,
    notes:
      'The ubiquitous low-cost 3-hand quartz. Rectangular movement; feetless aftermarket dials are common.',
  },
  {
    id: 'seagull-st25xx',
    label: 'Seagull ST25xx multifunction (ST2502 / ST2528)',
    members: ['seagull-st2502', 'seagull-st2528'],
    sharedHandSizes: null,
    sharedDialFeet: null,
    sharedDiameterMm: 30.4,
    notes:
      'Tianjin Seagull multifunction autos on the ST25 base. ST2502 = open-heart flywheel; ST2528 = small-seconds + big date + MOONPHASE.',
  },
  {
    id: 'ronda-7xx',
    label: 'Ronda 7xx quartz multifunction (706.B)',
    members: ['ronda-706b'],
    sharedHandSizes: null,
    sharedDialFeet: null,
    sharedDiameterMm: 23.9,
    notes:
      'Swiss multifunction quartz; the 706.B adds a MOONPHASE plus day/date by hand. Smaller hand bores than the mechanicals.',
  },
  {
    id: 'peseux-7001',
    label: 'Peseux / ETA 7001 (7001)',
    members: ['eta-7001'],
    sharedHandSizes: null,
    sharedDialFeet: null,
    sharedDiameterMm: 23.3,
    notes:
      'Thin (2.5mm) hand-wound with small-seconds at 6 — a favourite for slim dress builds.',
  },
  {
    id: 'dixmont-dgxx',
    label: 'Dixmont Guangzhou DG2813 (DG2813)',
    members: ['dixmont-dg2813'],
    sharedHandSizes: null,
    sharedDialFeet: null,
    sharedDiameterMm: 26.0,
    notes:
      'Very inexpensive Chinese auto on a Miyota-8200-style base (NOT a 2824 clone). Widely used in open-heart/skeleton homages with feetless dials.',
  },
];

/** id → family lookup. */
export const familiesById: Record<string, MovementFamily> = Object.fromEntries(
  families.map((f) => [f.id, f]),
);
