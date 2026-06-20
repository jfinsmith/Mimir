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
    label: 'Miyota 82xx (8215 / 821A / 8205)',
    members: ['miyota-8215', 'miyota-821a', 'miyota-8205'],
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
    label: 'ETA 2824-2 footprint (2824-2 / SW200-1 / ST2130)',
    members: ['eta-2824-2', 'sellita-sw200-1', 'seagull-st2130'],
    sharedHandSizes: { hour: 1.5, minute: 0.9, second: 0.25 },
    sharedDialFeet: null, // "2824 feet" — exact positions unverified in seed sources
    sharedDiameterMm: 25.6,
    notes:
      'Sellita SW200-1 and Seagull ST2130 are drop-in clones of the ETA 2824-2: shared 25.6mm footprint, dial feet, hand sizes and stem.',
  },
  {
    id: 'eta-2892-clones',
    label: 'ETA 2892-A2 footprint (2892-A2 / SW300-1)',
    members: ['eta-2892-a2', 'sellita-sw300-1'],
    sharedHandSizes: { hour: 1.5, minute: 0.9, second: 0.2 }, // table flags second bore "verify"
    sharedDialFeet: null,
    sharedDiameterMm: 25.6,
    notes:
      'Thin (3.6mm) premium base. Sellita SW300-1 is the 2892 analog. A common modular base for adding complications.',
  },
  {
    id: 'valjoux-7750-clones',
    label: 'Valjoux 7750 footprint (ETA 7750 / Sellita SW500)',
    members: ['eta-7750', 'sellita-sw500'],
    sharedHandSizes: { hour: 1.5, minute: 0.9, second: 0.25 }, // 7750 verified; SW500 left null (compatible)
    sharedDialFeet: null,
    sharedDiameterMm: 30.0,
    notes:
      'Cam-actuated tri-compax chronograph workhorse — tall (7.9mm). Sellita SW500 is 7750-compatible (footprint, feet, stem).',
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
    label: 'Unitas/ETA 6497 clones (Seagull ST36 / ST3600)',
    members: ['seagull-st36'],
    sharedHandSizes: null,
    sharedDialFeet: null,
    sharedDiameterMm: 36.6,
    notes:
      'Large (16.5‴) manual pocket-watch-style movement for 44mm+ "Marina" builds. Small-seconds @9 (6497) or @6 (6498 variant).',
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
    label: 'Seiko/TMI VK mecaquartz (VK63 / VK64)',
    members: ['seiko-vk63'],
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
];

/** id → family lookup. */
export const familiesById: Record<string, MovementFamily> = Object.fromEntries(
  families.map((f) => [f.id, f]),
);
