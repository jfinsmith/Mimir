// ─────────────────────────────────────────────────────────────────────────────
// Build Planner cross-checks — pure. Beyond the movement↔part fitment checks
// (delegated to lib/fitment), a real build also needs part↔part checks the
// fitment engine can't see with only a movement + one part:
//   • dial Ø vs case (does the dial sit under the crystal seat?)
//   • crystal Ø vs case crystal seat
// Plus a running cost estimate and a "missing pieces" list.
// ─────────────────────────────────────────────────────────────────────────────

import type { Movement, Part, PartCategory } from '@/types';
import { evaluateFit, type FitStatus } from './fitment';

export type CheckStatus = 'ok' | 'warn' | 'fail' | 'unknown';

export interface BuildCheck {
  id: string;
  label: string;
  status: CheckStatus;
  reasons: string[];
}

export interface ResolvedBuild {
  movement: Movement | null;
  parts: Partial<Record<PartCategory, Part>>;
}

const FIT_TO_CHECK: Record<FitStatus, CheckStatus> = {
  direct: 'ok',
  'with-spacer': 'warn',
  'needs-modification': 'warn',
  'check-clearance': 'warn',
  incompatible: 'fail',
  unknown: 'unknown',
};

/** The most severe status wins, for a build-level rollup. */
const SEVERITY: Record<CheckStatus, number> = {
  ok: 0,
  unknown: 1,
  warn: 2,
  fail: 3,
};

export function rollupStatus(checks: BuildCheck[]): CheckStatus {
  return checks.reduce<CheckStatus>(
    (worst, c) => (SEVERITY[c.status] > SEVERITY[worst] ? c.status : worst),
    'ok',
  );
}

const TOL = 0.2;

function midpoint(lo: number | null, hi: number | null): number {
  if (lo != null && hi != null) return (lo + hi) / 2;
  return lo ?? hi ?? 0;
}

// ── part ↔ part checks ───────────────────────────────────────────────────────
function checkDialCase(dial: Part, kase: Part): BuildCheck {
  const reasons: string[] = [];
  const seat = kase.crystalSeatDiameterMm ?? null;
  const dia = dial.dialDiameterMm ?? null;
  if (dia != null && seat != null) {
    if (dia <= seat + TOL) {
      reasons.push(`Dial Ø ${dia}mm fits the case crystal seat (${seat}mm).`);
      return { id: 'dial-case', label: 'Dial ↔ Case', status: 'ok', reasons };
    }
    reasons.push(
      `Dial Ø ${dia}mm exceeds the case crystal seat ${seat}mm — won't sit flat.`,
    );
    return { id: 'dial-case', label: 'Dial ↔ Case', status: 'fail', reasons };
  }
  if (
    dia != null &&
    kase.movementOpeningMm != null &&
    dia < kase.movementOpeningMm
  ) {
    reasons.push(
      `Dial Ø ${dia}mm is smaller than the case opening ${kase.movementOpeningMm}mm — verify it covers the movement.`,
    );
    return { id: 'dial-case', label: 'Dial ↔ Case', status: 'warn', reasons };
  }
  reasons.push(
    'Dial Ø or case crystal-seat Ø unknown — verify the dial sits in the case.',
  );
  return { id: 'dial-case', label: 'Dial ↔ Case', status: 'warn', reasons };
}

function checkCrystalCase(crystal: Part, kase: Part): BuildCheck {
  const reasons: string[] = [];
  const c = crystal.crystalDiameterMm ?? null;
  const seat = kase.crystalSeatDiameterMm ?? null;
  if (c != null && seat != null) {
    if (Math.abs(c - seat) <= 0.1) {
      reasons.push(`Crystal Ø ${c}mm matches the case seat ${seat}mm.`);
      return {
        id: 'crystal-case',
        label: 'Crystal ↔ Case',
        status: 'ok',
        reasons,
      };
    }
    reasons.push(
      `Crystal Ø ${c}mm ≠ case seat ${seat}mm — pick a crystal sized to the seat.`,
    );
    return {
      id: 'crystal-case',
      label: 'Crystal ↔ Case',
      status: 'fail',
      reasons,
    };
  }
  reasons.push(
    'Crystal Ø or case seat Ø unknown — match the crystal to the case seat.',
  );
  return {
    id: 'crystal-case',
    label: 'Crystal ↔ Case',
    status: 'warn',
    reasons,
  };
}

const SLOT_LABEL: Partial<Record<PartCategory, string>> = {
  case: 'Case',
  dial: 'Dial',
  hands: 'Hands',
  crystal: 'Crystal',
  'stem-crown': 'Stem / crown',
  'spacer-ring': 'Spacer / ring',
};

/** All pairwise checks for the current selection. */
export function computeBuildChecks(build: ResolvedBuild): BuildCheck[] {
  const checks: BuildCheck[] = [];
  const { movement, parts } = build;

  if (movement) {
    for (const cat of Object.keys(parts) as PartCategory[]) {
      const part = parts[cat];
      if (!part) continue;
      const v = evaluateFit(movement, part);
      checks.push({
        id: `mv-${cat}`,
        label: `${movement.caliber} ↔ ${SLOT_LABEL[cat] ?? cat}`,
        status: FIT_TO_CHECK[v.status],
        reasons: [
          ...v.reasons,
          ...v.warnings.map((w) => `⚠ ${w}`),
          ...v.requiredExtras.map((e) => `needs: ${e}`),
        ],
      });
    }
  }

  if (parts.dial && parts.case)
    checks.push(checkDialCase(parts.dial, parts.case));
  if (parts.crystal && parts.case)
    checks.push(checkCrystalCase(parts.crystal, parts.case));

  return checks;
}

export interface CostLine {
  label: string;
  usd: number;
}
export interface BuildCost {
  lines: CostLine[];
  total: number;
}

export function runningCost(build: ResolvedBuild): BuildCost {
  const lines: CostLine[] = [];
  if (build.movement) {
    lines.push({
      label: build.movement.caliber,
      usd: midpoint(build.movement.priceUsdLow, build.movement.priceUsdHigh),
    });
  }
  for (const cat of Object.keys(build.parts) as PartCategory[]) {
    const part = build.parts[cat];
    if (!part) continue;
    lines.push({
      label: part.name,
      usd: midpoint(part.priceUsdLow, part.priceUsdHigh),
    });
  }
  return { lines, total: lines.reduce((sum, l) => sum + l.usd, 0) };
}

/** Recommended-but-missing slots and conditional gaps (e.g. needs a spacer). */
export function missingPieces(build: ResolvedBuild): string[] {
  const out: string[] = [];
  if (!build.movement) {
    out.push('Pick a base movement to start.');
    return out;
  }
  const core: [PartCategory, string][] = [
    ['case', 'case'],
    ['dial', 'dial'],
    ['hands', 'hand set'],
  ];
  for (const [cat, label] of core) {
    if (!build.parts[cat]) out.push(`No ${label} selected.`);
  }
  if (build.parts.case && !build.parts.crystal) {
    out.push('No crystal selected.');
  }

  // Conditional: case needs a spacer but none chosen.
  if (build.parts.case) {
    const v = evaluateFit(build.movement, build.parts.case);
    const needsSpacer = v.requiredExtras.some((e) => /spacer|ring/i.test(e));
    if (needsSpacer && !build.parts['spacer-ring']) {
      out.push(
        'Case opening is larger than the movement — add a spacer / movement ring.',
      );
    }
  }
  return out;
}
