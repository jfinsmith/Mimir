// ─────────────────────────────────────────────────────────────────────────────
// THE FITMENT ENGINE — pure, exhaustively tested. Given a Movement and a Part,
// returns a structured verdict explaining whether the part fits and why.
//
// Bugs here mislead a hobbyist into buying the wrong $40 part, so every rule is
// encoded explicitly and cited in the reason string. See Section 6 of the brief.
//
// Combining precedence (most severe wins):
//   incompatible > needs-modification > with-spacer > check-clearance > direct
// ─────────────────────────────────────────────────────────────────────────────

import type { HandSizes, Movement, Part } from '@/types';

export type FitStatus =
  | 'direct'
  | 'with-spacer'
  | 'needs-modification'
  | 'check-clearance'
  | 'incompatible'
  | 'unknown';

export interface FitVerdict {
  status: FitStatus;
  reasons: string[]; // specific rules that drove the status
  warnings: string[]; // non-blocking cautions (e.g. clearance/data unknown)
  requiredExtras: string[]; // e.g. ['movement ring/spacer']
}

/** Severity rank used to COMBINE checks within one verdict (higher = worse). */
export const FIT_STATUS_RANK: Record<FitStatus, number> = {
  unknown: 0,
  direct: 1,
  'check-clearance': 2,
  'with-spacer': 3,
  'needs-modification': 4,
  incompatible: 5,
};

/** Order for DISPLAYING a parts list best-fit-first (distinct from severity). */
const FIT_STATUS_DISPLAY_ORDER: readonly FitStatus[] = [
  'direct',
  'with-spacer',
  'needs-modification',
  'check-clearance',
  'incompatible',
  'unknown',
];

export const FIT_STATUS_LABEL: Record<FitStatus, string> = {
  direct: 'Direct fit',
  'with-spacer': 'Fits with spacer',
  'needs-modification': 'Needs modification',
  'check-clearance': 'Check clearance',
  incompatible: 'Incompatible',
  unknown: 'Unknown',
};

/** Sort comparator: best fit first, incompatible/unknown last. */
export function compareFitStatus(a: FitStatus, b: FitStatus): number {
  return (
    FIT_STATUS_DISPLAY_ORDER.indexOf(a) - FIT_STATUS_DISPLAY_ORDER.indexOf(b)
  );
}

// ── Tolerances (mm) ──────────────────────────────────────────────────────────
const CASE_OPENING_TOL_MM = 0.2; // within this, opening ≈ casing → snug fit
const HAND_SECOND_TOL_MM = 0.02; // second/sweep bore tolerance
const DEPTH_CAUTION_MM = 0.3; // clearance under this → "tight, verify"
const EPS = 1e-6; // float-equality slack for "exact" bores/positions

// ── Internal accumulator ─────────────────────────────────────────────────────
interface Finding {
  status: FitStatus;
  reason: string;
}
interface Acc {
  findings: Finding[];
  warnings: string[];
  extras: string[];
}

export function evaluateFit(movement: Movement, part: Part): FitVerdict {
  const acc: Acc = { findings: [], warnings: [], extras: [] };

  // Strongest signal first: an explicit maker listing starts us at `direct`.
  // Category checks below can still downgrade it (e.g. a too-small opening).
  const explicitTarget = explicitFitTarget(movement, part);
  const explicit = explicitTarget !== null;
  if (explicit) {
    acc.findings.push({
      status: 'direct',
      reason: `Maker lists this ${part.category} as fitting ${explicitTarget}.`,
    });
  }

  switch (part.category) {
    case 'hands':
      checkHands(movement, part, acc, explicit);
      break;
    case 'case':
      checkCase(movement, part, acc, explicit);
      break;
    case 'dial':
      checkDial(movement, part, acc, explicit);
      break;
    case 'stem-crown':
      checkStemCrown(movement, part, acc, explicit);
      break;
    case 'crystal':
      checkCrystal(movement, part, acc, explicit);
      break;
    case 'spacer-ring':
    case 'bezel':
    case 'gasket':
    case 'rotor':
      checkGeneric(movement, part, acc, explicit);
      break;
  }

  return assemble(acc);
}

function assemble(acc: Acc): FitVerdict {
  const status = acc.findings.reduce<FitStatus>(
    (s, f) => (FIT_STATUS_RANK[f.status] > FIT_STATUS_RANK[s] ? f.status : s),
    'unknown',
  );

  let reasons: string[];
  if (status === 'unknown') {
    reasons = [];
  } else if (status === 'direct') {
    reasons = acc.findings
      .filter((f) => f.status === 'direct')
      .map((f) => f.reason);
  } else {
    // Show every substantive issue (check-clearance and worse); drop the
    // plain "direct" confirmations so an incompatible verdict reads cleanly.
    reasons = acc.findings
      .filter(
        (f) => FIT_STATUS_RANK[f.status] >= FIT_STATUS_RANK['check-clearance'],
      )
      .map((f) => f.reason);
  }

  return {
    status,
    reasons: dedupe(reasons),
    warnings: dedupe(acc.warnings),
    requiredExtras: dedupe(acc.extras),
  };
}

// ── Category checks ──────────────────────────────────────────────────────────

function checkHands(m: Movement, p: Part, acc: Acc, explicit: boolean): void {
  const ph = p.handBore;
  const mh = m.handSizes;

  if (!ph) {
    acc.warnings.push(
      `Hand bore sizes not listed for "${p.name}" — verify against ${m.caliber}.`,
    );
    if (!explicit) {
      acc.findings.push({
        status: 'check-clearance',
        reason: `Cannot verify hand fit: part lists no bore sizes.`,
      });
    }
    return;
  }

  const mismatches: string[] = [];
  let anyUnknown = false;

  // Hour & minute: must be EXACT.
  for (const key of ['hour', 'minute'] as const) {
    const mv = mh[key];
    const pv = ph[key];
    if (mv == null || pv == null) {
      anyUnknown = true;
      continue;
    }
    if (Math.abs(mv - pv) > EPS) {
      mismatches.push(
        `${cap(key)} bore mismatch: hands need ${pv}mm but ${m.caliber} ${key} pinion is ${mv}mm.`,
      );
    }
  }

  // Second: tolerance ±0.02mm.
  {
    const mv = mh.second;
    const pv = ph.second;
    if (mv == null || pv == null) {
      anyUnknown = true;
    } else if (Math.abs(mv - pv) > HAND_SECOND_TOL_MM + EPS) {
      mismatches.push(
        `Second bore mismatch: hands need ${pv}mm but ${m.caliber} seconds pinion is ${mv}mm (tolerance ±${HAND_SECOND_TOL_MM}mm).`,
      );
    }
  }

  // Chronograph sweep, when the movement is a chronograph.
  if (m.complications.includes('chronograph')) {
    const mv = mh.chronographSweep ?? null;
    const pv = ph.chronographSweep ?? null;
    if (mv == null || pv == null) {
      acc.warnings.push(
        `Chronograph sweep-hand bore not fully specified — verify against ${m.caliber}.`,
      );
    } else if (Math.abs(mv - pv) > HAND_SECOND_TOL_MM + EPS) {
      mismatches.push(
        `Chronograph sweep bore mismatch: hands need ${pv}mm but ${m.caliber} sweep pinion is ${mv}mm.`,
      );
    }
  }

  if (mismatches.length > 0) {
    for (const msg of mismatches) {
      acc.findings.push({ status: 'incompatible', reason: msg });
    }
    return;
  }
  if (anyUnknown) {
    acc.findings.push({
      status: 'check-clearance',
      reason: `Some hand bores are unknown — verify the hand stack fits ${m.caliber}.`,
    });
    acc.warnings.push(`Verify unknown hand bore(s) before buying.`);
    return;
  }
  acc.findings.push({
    status: 'direct',
    reason: `Hand bores match ${m.caliber} (H ${ph.hour} / M ${ph.minute} / S ${ph.second}mm).`,
  });
}

function checkCase(m: Movement, p: Part, acc: Acc, explicit: boolean): void {
  // ── Opening vs movement casing diameter (the primary determinant) ─────────
  const opening = p.movementOpeningMm ?? null;
  const usingBareDia = m.casingDiameterMm == null && m.diameterMm != null;
  const casing = m.casingDiameterMm ?? m.diameterMm ?? null;

  if (opening != null && casing != null) {
    if (usingBareDia) {
      acc.warnings.push(
        `${m.caliber} casing Ø unknown; comparing against bare movement Ø ${casing}mm — allow for a spacer.`,
      );
    }
    const diff = opening - casing;
    if (Math.abs(diff) <= CASE_OPENING_TOL_MM) {
      acc.findings.push({
        status: 'direct',
        reason: `Case opening ${opening}mm matches ${m.caliber} casing Ø ${casing}mm.`,
      });
    } else if (diff > CASE_OPENING_TOL_MM) {
      acc.findings.push({
        status: 'with-spacer',
        reason: `Case opening ${opening}mm is larger than ${m.caliber} casing Ø ${casing}mm — needs a movement ring/spacer.`,
      });
      acc.extras.push('movement ring/spacer');
    } else {
      acc.findings.push({
        status: 'incompatible',
        reason: `Case opening ${opening}mm < ${m.caliber} casing Ø ${casing}mm — movement won't fit.`,
      });
    }
  } else {
    acc.warnings.push(
      `Case opening or ${m.caliber} casing Ø unknown — verify the movement seats.`,
    );
    if (!explicit) {
      acc.findings.push({
        status: 'check-clearance',
        reason: `Cannot confirm the movement seats: case opening or casing Ø unknown.`,
      });
    }
  }

  // ── Crown position ────────────────────────────────────────────────────────
  if (p.crownPosition != null) {
    if (m.crownPositions != null && m.crownPositions.length > 0) {
      if (
        m.crownPositions.some((cp) => clockEq(cp, p.crownPosition as string))
      ) {
        acc.findings.push({
          status: 'direct',
          reason: `Case crown at ${p.crownPosition} is supported by ${m.caliber}.`,
        });
      } else {
        acc.findings.push({
          status: 'incompatible',
          reason: `Case crown at ${p.crownPosition}; ${m.caliber} supports ${m.crownPositions.join('/')}.`,
        });
      }
    } else {
      acc.warnings.push(
        `${m.caliber} crown positions unknown — verify crown alignment at ${p.crownPosition}.`,
      );
    }
  }

  // ── Date aperture ─────────────────────────────────────────────────────────
  if (p.dateAperturePosition != null) {
    if (movementHasDate(m)) {
      if (m.dateWindowPosition != null) {
        if (!clockEq(p.dateAperturePosition, m.dateWindowPosition)) {
          acc.findings.push({
            status: 'needs-modification',
            reason: `Case date aperture at ${p.dateAperturePosition} but ${m.caliber} dates at ${m.dateWindowPosition} — needs a date-aligned/custom dial or a different movement variant.`,
          });
          acc.extras.push('date-aligned or no-date dial');
        }
      } else {
        acc.warnings.push(
          `${m.caliber} date position unknown — verify it aligns with the case aperture at ${p.dateAperturePosition}.`,
        );
      }
    } else {
      acc.warnings.push(
        `Case has a date aperture at ${p.dateAperturePosition} but ${m.caliber} has no date — use a solid dial or expect a blank window.`,
      );
    }
  }

  // ── Internal depth vs hand stack ──────────────────────────────────────────
  if (p.internalDepthMm != null && m.heightWithHandsMm != null) {
    const margin = p.internalDepthMm - m.heightWithHandsMm;
    if (margin < 0) {
      acc.findings.push({
        status: 'incompatible',
        reason: `Case internal depth ${p.internalDepthMm}mm < ${m.caliber} hand-stack height ${m.heightWithHandsMm}mm.`,
      });
    } else if (margin < DEPTH_CAUTION_MM) {
      acc.findings.push({
        status: 'check-clearance',
        reason: `Tight: only ${margin.toFixed(2)}mm between case depth and ${m.caliber} hand stack — verify crystal clearance.`,
      });
      acc.warnings.push(
        `Hand-stack clearance is tight — verify crystal height.`,
      );
    }
  } else if (p.internalDepthMm != null || m.heightWithHandsMm != null) {
    acc.warnings.push(
      `Case depth or ${m.caliber} hand-stack height unknown — verify crystal/caseback clearance.`,
    );
  }
}

function checkDial(m: Movement, p: Part, acc: Acc, explicit: boolean): void {
  // ── Feet basis ────────────────────────────────────────────────────────────
  if (p.feetless === true) {
    acc.findings.push({
      status: 'direct',
      reason: `Feetless dial — mounts with dial dots/glue; no feet alignment needed.`,
    });
  } else if (p.dialFeet != null && m.dialFeet != null) {
    if (sameFeet(p.dialFeet, m.dialFeet)) {
      acc.findings.push({
        status: 'direct',
        reason: `Dial feet ${listFeet(p.dialFeet)} match ${m.caliber}.`,
      });
    } else if (m.feetlessDialsCommon) {
      acc.findings.push({
        status: 'needs-modification',
        reason: `Dial feet ${listFeet(p.dialFeet)} don't match ${m.caliber} feet ${listFeet(m.dialFeet)} — remove feet and mount feetless (common for this family).`,
      });
      acc.extras.push('feetless dial or feet removal');
    } else {
      acc.findings.push({
        status: 'incompatible',
        reason: `Dial feet ${listFeet(p.dialFeet)} don't match ${m.caliber} feet ${listFeet(m.dialFeet)}, and feetless mounting is uncommon for ${m.caliber}.`,
      });
    }
  } else {
    acc.warnings.push(
      `Dial feet not specified — verify they match ${m.caliber}${m.dialFeet ? ` (${listFeet(m.dialFeet)})` : ''}.`,
    );
    if (!explicit) {
      acc.findings.push({
        status: 'check-clearance',
        reason: `Cannot verify dial feet against ${m.caliber}.`,
      });
    }
  }

  // ── Date window alignment ─────────────────────────────────────────────────
  const dialWin = p.dateWindowPosition ?? null;
  if (dialWin != null) {
    if (movementHasDate(m) && m.dateWindowPosition != null) {
      if (!clockEq(dialWin, m.dateWindowPosition)) {
        acc.findings.push({
          status: 'needs-modification',
          reason: `Dial date window at ${dialWin} but ${m.caliber} dates at ${m.dateWindowPosition}.`,
        });
      }
    } else if (!movementHasDate(m)) {
      acc.warnings.push(
        `Dial has a date window at ${dialWin} but ${m.caliber} has no date — the window will read blank.`,
      );
    } else {
      acc.warnings.push(
        `${m.caliber} date position unknown — verify alignment with the dial window at ${dialWin}.`,
      );
    }
  } else if (movementHasDate(m)) {
    acc.warnings.push(
      `Dial has no date window; ${m.caliber}'s date will sit hidden (fine for a no-date look).`,
    );
  }
}

function checkStemCrown(
  m: Movement,
  p: Part,
  acc: Acc,
  explicit: boolean,
): void {
  const list = p.stemForCalibers;
  if (list && list.length > 0) {
    if (list.includes(m.id) || list.includes(m.family)) {
      acc.findings.push({
        status: 'direct',
        reason: `Stem listed for ${m.caliber}.`,
      });
    } else {
      acc.findings.push({
        status: 'incompatible',
        reason: `Stem listed for ${list.join(', ')}; not for ${m.caliber} — keyless works differ.`,
      });
    }
  } else if (!explicit) {
    acc.warnings.push(
      `Stem compatibility not specified for ${m.caliber} — verify the stem/part number.`,
    );
  }

  if (p.tubeThread != null || p.crownThread != null) {
    acc.warnings.push(
      `Crown tube/thread fit depends on the case tube — verify against your case.`,
    );
  }
}

function checkCrystal(
  _m: Movement,
  _p: Part,
  acc: Acc,
  explicit: boolean,
): void {
  // Crystal fit is a case↔crystal relationship (seat Ø) + hand-stack clearance,
  // neither of which is knowable from the movement alone — surfaced in the
  // Build Planner (Phase 5). _m/_p are kept for a future box-height clearance check.
  acc.warnings.push(
    `Crystal fit is set by the case crystal seat and hand-stack clearance — confirm in the Build Planner.`,
  );
  if (!explicit) {
    acc.findings.push({
      status: 'check-clearance',
      reason: `Crystal-to-movement fit can't be judged without the case (crystal seats in the case, not the movement).`,
    });
  }
}

function checkGeneric(m: Movement, p: Part, acc: Acc, explicit: boolean): void {
  if (!explicit) {
    acc.warnings.push(
      `No published fitment data for this ${p.category} against ${m.caliber}.`,
    );
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function explicitFitTarget(m: Movement, p: Part): string | null {
  if (p.fitsMovements.includes(m.id)) return m.caliber;
  if (p.fitsFamilies.includes(m.family)) return m.family;
  return null;
}

function movementHasDate(m: Movement): boolean {
  return (
    m.complications.includes('date') || m.complications.includes('day-date')
  );
}

function dedupe(arr: string[]): string[] {
  return [...new Set(arr)];
}

function cap(s: string): string {
  return s.length === 0 ? s : s[0]!.toUpperCase() + s.slice(1);
}

function listFeet(feet: string[]): string {
  return feet.length > 0 ? feet.join(' & ') : 'none';
}

function sameFeet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const na = a.map((s) => s.trim()).sort();
  const nb = b.map((s) => s.trim()).sort();
  return na.every((v, i) => v === nb[i]);
}

/** Parse a clock position ('3', '4.5', '10:30') to decimal hours, or null. */
function parseClock(s: string): number | null {
  const t = s.trim();
  if (/^\d+(\.\d+)?$/.test(t)) return parseFloat(t);
  const match = t.match(/^(\d+):(\d{1,2})$/);
  if (match && match[1] != null && match[2] != null) {
    return parseInt(match[1], 10) + parseInt(match[2], 10) / 60;
  }
  return null;
}

function clockEq(a: string, b: string): boolean {
  const pa = parseClock(a);
  const pb = parseClock(b);
  if (pa != null && pb != null) return Math.abs(pa - pb) < EPS;
  return a.trim() === b.trim();
}

/** Re-export for callers that build their own comparisons. */
export type { HandSizes };
