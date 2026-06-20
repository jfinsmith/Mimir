// Minimal glossary seed (the Learn page, Phase 6, expands this). Terms here back
// the "verify before you buy" literacy goals in Section 10.

export interface GlossaryTerm {
  term: string;
  short: string;
  body: string;
}

export const glossary: GlossaryTerm[] = [
  {
    term: 'Ligne (‴)',
    short: 'Old French unit for movement diameter.',
    body: '1 ligne ≈ 2.2558mm. A "12‴" movement is ≈ 27.07mm. Still used on spec sheets alongside mm.',
  },
  {
    term: 'Beat rate (vph)',
    short: 'Vibrations per hour of the balance.',
    body: 'Common rates: 21,600 (6 bps), 28,800 (8 bps), 36,000 (10 bps). Higher = smoother sweep. Quartz movements have no beat rate; they use a 32,768 Hz crystal.',
  },
  {
    term: 'Hacking',
    short: 'Seconds hand stops when the crown is pulled.',
    body: 'Lets you set the time to the second. The classic Miyota 8215 does NOT hack; the Seiko NH35 does.',
  },
  {
    term: 'Dial feet',
    short: 'Small posts under the dial that locate it on the movement.',
    body: 'Their clock positions must match the movement, OR you use a "feetless" dial mounted with glue/dial dots. Feet positions differ between calibers — a key fitment check.',
  },
  {
    term: 'Casing diameter',
    short: 'Movement diameter including its spacer/ring.',
    body: 'This (not the bare movement Ø) is what must fit the case opening. If the opening is larger, you add a movement ring/spacer.',
  },
  {
    term: 'Hand bore',
    short: 'The hole diameter of each hand.',
    body: 'Stored hour/minute/second in mm. Hour and minute must match the movement exactly; the seconds bore has a tiny tolerance. Mismatched hands simply will not seat.',
  },
  {
    term: 'Stem & crown',
    short: 'The shaft and knob you set the time with.',
    body: 'The stem is caliber-specific (it engages the keyless works). The crown screws onto the stem and seats into the case tube — so crown/tube threads must also match your case, not just the movement.',
  },
  {
    term: 'Crown position',
    short: 'Where the crown sits on the case (clock position).',
    body: 'Given as a decimal hour, e.g. 3.0, 3.8, 4.1. The case crown must line up with a position the movement supports, or the stem won’t reach the keyless works.',
  },
  {
    term: 'Complication',
    short: 'Any function beyond plain hours/minutes/seconds.',
    body: 'Date, day-date, GMT, chronograph, moonphase, power-reserve, etc. More complications usually mean a thicker, pricier, harder-to-service movement.',
  },
  {
    term: 'Mecaquartz',
    short: 'Quartz timekeeping + a mechanical chronograph.',
    body: 'The time is quartz-regulated, but the chronograph is a real mechanical module with crisp, snappy pushers (e.g. Seiko VK63). Popular for chrono mods.',
  },
  {
    term: 'Clone vs genuine',
    short: 'Same footprint, different maker.',
    body: 'A clone (e.g. Sellita SW200-1 or Seagull ST2130 for the ETA 2824-2) shares dimensions, dial feet and stem, so parts interchange — but finishing, tolerances and price differ. MIMIR models these as a shared family.',
  },
  {
    term: 'Cost drivers',
    short: 'Why one movement costs 10× another.',
    body: 'Origin (Swiss vs Japanese vs Chinese), finishing and adjustment, jewel count, complications, beat rate, and brand. The cost tier ($–$$$$$) is derived from the typical street price midpoint.',
  },
];
