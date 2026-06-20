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
    label:
      'Miyota 82xx (8215 / 821A / 8205 / 8200 / 82S7 / 8315 / 8245 / 82S5)',
    members: [
      'miyota-8215',
      'miyota-821a',
      'miyota-8205',
      'miyota-8200',
      'miyota-82s7',
      'miyota-8315',
      'miyota-8245',
      'miyota-82s5',
    ],
    sharedHandSizes: { hour: 1.5, minute: 1.0, second: 0.17 },
    sharedDialFeet: ['5:30', '10:30'],
    sharedDiameterMm: 26.0,
    notes:
      'Note the 1.00mm MINUTE bore — different from the NH3x (0.90mm), so NH-spec hands do NOT fit. Mostly non-hacking.',
  },
  {
    id: 'miyota-9xxx',
    label: 'Miyota 9xxx (9015 / 9039 / 9019 / 9132 / 9075 GMT / 9011)',
    members: [
      'miyota-9015',
      'miyota-9039',
      'miyota-9019',
      'miyota-9132',
      'miyota-9075',
      'miyota-9011',
    ],
    sharedHandSizes: { hour: 1.52, minute: 1.0, second: 0.17 },
    sharedDialFeet: null,
    sharedDiameterMm: 26.0,
    notes:
      'Thin high-beat (28,800) family. Hand bores (1.52/1.00/0.17, per Caliber Corner) are close to the 82xx, but it is NOT interchangeable — the stem offset differs (≈1.53mm). The 9075 is a true traveller GMT.',
  },
  {
    id: 'eta-2824-clones',
    label:
      'ETA 2824-2 footprint (2824-2 / 2801-2 / 2834-2 / 2836-2 / SW200-1 / SW210-1 / SW216-1 / SW220-1 / SW240-1 / ST2130 / PT5000 / STP1-11 / Hangzhou 6300)',
    members: [
      'eta-2824-2',
      'eta-2801-2',
      'eta-2834-2',
      'eta-2836-2',
      'sellita-sw200-1',
      'sellita-sw210-1',
      'sellita-sw216-1',
      'sellita-sw220-1',
      'sellita-sw240-1',
      'seagull-st2130',
      'hkpt-pt5000',
      'stp-1-11',
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
    label:
      'ETA 2892-A2 footprint (2892-A2 / 2893-2 GMT / 2895-2 / 2897 / SW300-1 / SW330-2 / Soprod A10)',
    members: [
      'eta-2892-a2',
      'eta-2893-2',
      'eta-2895-2',
      'eta-2897',
      'sellita-sw300-1',
      'sellita-sw330-2',
      'soprod-a10',
    ],
    sharedHandSizes: { hour: 1.5, minute: 0.9, second: null }, // second bore varies by variant (0.20 vs 0.25)
    sharedDialFeet: null,
    sharedDiameterMm: 25.6,
    notes:
      'Thin (3.6mm) premium base. Sellita SW300-1 is the 2892 analog. A common modular base for adding complications.',
  },
  {
    id: 'valjoux-7750-clones',
    label:
      'Valjoux 7750 footprint (7750 / 7751 / 7753 / 7754 GMT / SW500 / SW510)',
    members: [
      'eta-7750',
      'eta-7751',
      'eta-7753',
      'eta-7754',
      'sellita-sw500',
      'sellita-sw510',
    ],
    sharedHandSizes: { hour: 2.0, minute: 1.2, second: null }, // Caliber Corner: 2.0/1.2 main bores; sub/sweep bores vary
    sharedDialFeet: null,
    sharedDiameterMm: 30.0,
    notes:
      'Cam-actuated chronograph workhorse — tall (7.9mm), large 2.0/1.2mm main hand bores. 7751 adds full calendar + moonphase; 7754 adds GMT; Sellita SW500/SW510 are 7750-compatible.',
  },
  {
    id: 'ronda-5xx',
    label: 'Ronda 5xx quartz (515 / 515.24H / 715 / 513)',
    members: ['ronda-515', 'ronda-515-24h', 'ronda-715', 'ronda-513'],
    sharedHandSizes: { hour: 1.2, minute: 0.7, second: 0.2 },
    sharedDialFeet: null,
    sharedDiameterMm: 26.0,
    notes:
      'Swiss quartz workhorse family. Smaller hand bores than the mechanicals. The 515.24H adds a 24-hour GMT hand (1.60mm bore).',
  },
  {
    id: 'ronda-503x',
    label: 'Ronda 50xx quartz chronographs (5030.D / 5040.B / 5021.D)',
    members: ['ronda-5030d', 'ronda-5021-d'],
    sharedHandSizes: null, // hand bores unverified
    sharedDialFeet: null,
    sharedDiameterMm: null,
    notes:
      '3-eye / 4-eye quartz chronographs popular in microbrands. Date at 4:30. Distinct from the 5xx three-handers.',
  },
  {
    id: 'seagull-st19',
    label: 'Seagull ST19 chronograph (ST1901 / ST1903)',
    members: ['seagull-st1901', 'seagull-st1903'],
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
    label: 'Seagull ST16 budget autos (ST16 / ST1612)',
    members: ['seagull-st16', 'seagull-st1612'],
    sharedHandSizes: null,
    sharedDialFeet: null,
    sharedDiameterMm: null,
    notes:
      'Common budget automatic family (date / day-date variants). Verify specs per individual variant.',
  },
  {
    id: 'seiko-vk-mecaquartz',
    label: 'Seiko/TMI VK mecaquartz (VK63 / VK64 / VK67 / VK68)',
    members: ['seiko-vk63', 'seiko-vk67', 'seiko-vk68'],
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
    label: 'Seiko 6R-series (6R15 / 6R35 / 6R55 / 6R64 GMT)',
    members: ['seiko-6r15', 'seiko-6r35', 'seiko-6r55', 'seiko-6r64'],
    sharedHandSizes: { hour: 1.5, minute: 0.9, second: 0.21 },
    sharedDialFeet: null,
    sharedDiameterMm: 27.4,
    notes:
      'In-house higher-grade Seiko 27.4mm autos (6R35 ≈ 70h reserve). Same footprint/hands as the 4R/NH, but used in OEM Seiko cases.',
  },
  {
    id: 'seiko-nh7x',
    label: 'Seiko NH7x skeleton (NH70 / NH72)',
    members: ['seiko-nh70', 'seiko-nh72'],
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
    label: 'Miyota OS-series quartz chronographs (OS20 / OS10)',
    members: ['miyota-os20', 'miyota-0s10'],
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
    label: 'Dixmont Guangzhou (DG2813 / DG5833 / DG3804)',
    members: ['dixmont-dg2813', 'dixmont-dg5833', 'dixmont-dg3804'],
    sharedHandSizes: null,
    sharedDialFeet: null,
    sharedDiameterMm: 26.0,
    notes:
      'Very inexpensive Chinese autos on a Miyota-8200-style base (NOT 2824 clones). Widely used in open-heart/skeleton homages with feetless dials.',
  },
  {
    id: 'eta-2671',
    label: "ETA 2671 (ladies' automatic)",
    members: ['eta-2671'],
    sharedHandSizes: null,
    sharedDialFeet: null,
    sharedDiameterMm: 17.2,
    notes:
      "Small (~17.2mm / 7.75‴) ladies' automatic with date — for compact builds.",
  },
  {
    id: 'eta-c07',
    label: 'ETA C07 (Powermatic 80)',
    members: ['eta-c07-111'],
    sharedHandSizes: null,
    sharedDialFeet: null,
    sharedDiameterMm: null,
    notes:
      'ETA Powermatic 80: ~80h reserve, slowed 21,600 vph, synthetic escapement. 2824-derived footprint (Tissot/Hamilton/Certina).',
  },
  {
    id: 'eta-9xx-quartz',
    label: 'ETA 9-series quartz (955.112 / 956.112)',
    members: ['eta-955-112', 'eta-956-112'],
    sharedHandSizes: null,
    sharedDialFeet: null,
    sharedDiameterMm: null,
    notes:
      'Swiss 3-hand + date quartz workhorse, widely used in mid-range watches.',
  },
  {
    id: 'eta-g10-quartz',
    label: 'ETA G10 quartz chronograph (G10.211)',
    members: ['eta-g10-211'],
    sharedHandSizes: null,
    sharedDialFeet: null,
    sharedDiameterMm: null,
    notes:
      'Swiss quartz chronograph (small running seconds + central chrono); a microbrand staple.',
  },
  {
    id: 'ronda-76x',
    label: 'Ronda 76x quartz chronograph (763)',
    members: ['ronda-763'],
    sharedHandSizes: null,
    sharedDialFeet: null,
    sharedDiameterMm: null,
    notes:
      'Swiss quartz chronograph family (3-eye). Smaller hand bores than the mechanicals.',
  },
  {
    id: 'seiko-7txx',
    label: 'Seiko 7T quartz chronograph (7T92)',
    members: ['seiko-7t92'],
    sharedHandSizes: null,
    sharedDialFeet: null,
    sharedDiameterMm: null,
    notes: 'Seiko/TMI quartz chronograph (1/1-sec), date; the 7T-series.',
  },
  {
    id: 'seagull-st28',
    label: 'Seagull ST28 power-reserve auto (TY2806)',
    members: ['seagull-ty2806'],
    sharedHandSizes: null,
    sharedDialFeet: null,
    sharedDiameterMm: null,
    notes: 'Tianjin Seagull automatic with a power-reserve indicator + date.',
  },
  {
    id: 'ljp-g100',
    label: 'La Joux-Perret G100',
    members: ['la-joux-perret-g100'],
    sharedHandSizes: null,
    sharedDialFeet: null,
    sharedDiameterMm: null,
    notes:
      'Modern Swiss automatic, ~68h reserve, date, 28,800 vph — popular in enthusiast microbrands.',
  },
  {
    id: 'eta-2000',
    label: 'ETA 2000-1 (small automatic)',
    members: ['eta-2000-1'],
    sharedHandSizes: null,
    sharedDialFeet: null,
    sharedDiameterMm: 19.4,
    notes: 'Small (~19.4mm / 8.75‴) automatic with date — for compact builds.',
  },
  {
    id: 'eta-quartz-chrono',
    label: 'ETA 251 quartz chronograph (251.471)',
    members: ['eta-251-471'],
    sharedHandSizes: null,
    sharedDialFeet: null,
    sharedDiameterMm: null,
    notes: 'High-accuracy (thermocompensated) Swiss quartz chronograph.',
  },
  {
    id: 'eta-80x-quartz',
    label: 'ETA 80x quartz (805.111)',
    members: ['eta-805-111'],
    sharedHandSizes: null,
    sharedDialFeet: null,
    sharedDiameterMm: null,
    notes: 'Basic Swiss 3-hand + date quartz (FlatLine family).',
  },
  {
    id: 'sellita-sw290',
    label: 'Sellita SW290 chronograph',
    members: ['sellita-sw290-1'],
    sharedHandSizes: null,
    sharedDialFeet: null,
    sharedDiameterMm: null,
    notes: 'Sellita automatic chronograph (SW300-based with a chrono module).',
  },
  {
    id: 'sellita-sw1000',
    label: 'Sellita SW1000 (small automatic)',
    members: ['sellita-sw1000-1'],
    sharedHandSizes: null,
    sharedDialFeet: null,
    sharedDiameterMm: null,
    notes: 'Small (~20mm / 9‴) Swiss automatic with date — for compact builds.',
  },
  {
    id: 'seiko-vd-quartz',
    label: 'Seiko VD quartz chronograph (VD53)',
    members: ['seiko-vd53'],
    sharedHandSizes: null,
    sharedDialFeet: null,
    sharedDiameterMm: null,
    notes: 'Seiko/TMI quartz chronograph (VD-series), date.',
  },
  {
    id: 'ronda-mecano',
    label: 'Ronda Mecano (R150)',
    members: ['ronda-mecano-r150'],
    sharedHandSizes: null,
    sharedDialFeet: null,
    sharedDiameterMm: null,
    notes:
      "Ronda's own Swiss MECHANICAL automatic (Mecano line), date, 28,800 vph.",
  },
  {
    id: 'hangzhou-64xx',
    label: 'Hangzhou 64xx GMT (6460)',
    members: ['hangzhou-6460'],
    sharedHandSizes: null,
    sharedDialFeet: null,
    sharedDiameterMm: null,
    notes: 'Chinese automatic GMT (24-hour) + date.',
  },
  {
    id: 'hangzhou-5xxx',
    label: 'Hangzhou 5000A (thin automatic)',
    members: ['hangzhou-5000a'],
    sharedHandSizes: null,
    sharedDialFeet: null,
    sharedDiameterMm: null,
    notes: 'Thin Chinese automatic (ETA 2892-style), date.',
  },
  {
    id: 'ronda-10xx',
    label: 'Ronda 10xx quartz (1069)',
    members: ['ronda-1069'],
    sharedHandSizes: null,
    sharedDialFeet: null,
    sharedDiameterMm: null,
    notes: 'Slim Swiss 3-hand + date quartz (Powertech family).',
  },
];

/** id → family lookup. */
export const familiesById: Record<string, MovementFamily> = Object.fromEntries(
  families.map((f) => [f.id, f]),
);
