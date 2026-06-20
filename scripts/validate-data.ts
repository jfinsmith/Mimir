/* eslint-disable no-console */
// ─────────────────────────────────────────────────────────────────────────────
// DATA VALIDATOR — `npm run validate:data`. Runs in CI and pre-build.
//
// Stage 1: zod structural validation (shapes, enums, slug/clock formats).
// Stage 2: cross-field / cross-record business rules (Section 8). These are the
//          checks that catch "build-ruining" contradictions a schema can't:
//          cost-tier drift, quartz-with-a-beat-rate, a family member whose hand
//          sizes contradict the family, dangling references, missing citations.
//
// Exits non-zero if any ERROR is found; WARN-level findings print but pass.
// ─────────────────────────────────────────────────────────────────────────────

import type { z } from 'zod';
import { familySchema, movementSchema, partSchema } from '@/lib/schema';
import { priceToTier } from '@/lib/cost';
import { movements } from '@/data/movements';
import { parts } from '@/data/parts';
import { families } from '@/data/families';
import { MECHANICAL_TYPES } from '@/types';
import type { HandSizes, Movement } from '@/types';

const errors: string[] = [];
const warnings: string[] = [];
const err = (ctx: string, msg: string) => errors.push(`[${ctx}] ${msg}`);
const warn = (ctx: string, msg: string) => warnings.push(`[${ctx}] ${msg}`);

// ── Stage 1: structural (zod) ────────────────────────────────────────────────
function structural<T>(
  label: string,
  items: T[],
  schema: z.ZodType<unknown>,
  idOf: (t: T) => string,
): void {
  for (const item of items) {
    const res = schema.safeParse(item);
    if (!res.success) {
      for (const issue of res.error.issues) {
        const path = issue.path.join('.') || '(root)';
        err(`${label}:${idOf(item)}`, `${path} — ${issue.message}`);
      }
    }
  }
}

structural('movement', movements, movementSchema, (m) => m.id);
structural('part', parts, partSchema, (p) => p.id);
structural('family', families, familySchema, (f) => f.id);

// ── Duplicate ids ─────────────────────────────────────────────────────────────
function checkDuplicateIds(label: string, ids: string[]): void {
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) err(label, `duplicate id "${id}"`);
    seen.add(id);
  }
}
checkDuplicateIds(
  'movement',
  movements.map((m) => m.id),
);
checkDuplicateIds(
  'part',
  parts.map((p) => p.id),
);
checkDuplicateIds(
  'family',
  families.map((f) => f.id),
);

const movementIds = new Set(movements.map((m) => m.id));
const familyIds = new Set(families.map((f) => f.id));

// ── Cost tier is derived, never hand-entered ─────────────────────────────────
for (const m of movements) {
  if (m.priceUsdLow == null && m.priceUsdHigh == null) {
    err(
      `movement:${m.id}`,
      'has no price but a cached costTier — cannot derive tier',
    );
    continue;
  }
  const derived = priceToTier(m.priceUsdLow, m.priceUsdHigh);
  if (m.costTier !== derived) {
    err(
      `movement:${m.id}`,
      `cached costTier ${m.costTier} ≠ priceToTier(${m.priceUsdLow}, ${m.priceUsdHigh}) = ${derived}`,
    );
  }
  if (
    m.priceUsdLow != null &&
    m.priceUsdHigh != null &&
    m.priceUsdLow > m.priceUsdHigh
  ) {
    err(
      `movement:${m.id}`,
      `priceUsdLow ${m.priceUsdLow} > priceUsdHigh ${m.priceUsdHigh}`,
    );
  }
}

// ── Quartz vs mechanical rate fields ─────────────────────────────────────────
for (const m of movements) {
  const isMechanical = (MECHANICAL_TYPES as readonly string[]).includes(m.type);
  if (isMechanical) {
    if (m.quartzFrequencyHz != null) {
      err(
        `movement:${m.id}`,
        `mechanical (${m.type}) must not have quartzFrequencyHz (${m.quartzFrequencyHz})`,
      );
    }
    if (m.beatRateVph == null)
      warn(`movement:${m.id}`, `mechanical movement has no beatRateVph`);
  } else {
    if (m.beatRateVph != null) {
      err(
        `movement:${m.id}`,
        `non-mechanical (${m.type}) must not have beatRateVph (${m.beatRateVph})`,
      );
    }
    if (m.type === 'quartz' && m.quartzFrequencyHz == null) {
      warn(`movement:${m.id}`, `quartz movement has no quartzFrequencyHz`);
    }
  }
}

// ── Date complication implies a date window position (warn) ───────────────────
for (const m of movements) {
  const hasDate =
    m.complications.includes('date') || m.complications.includes('day-date');
  if (hasDate && m.dateWindowPosition == null) {
    warn(
      `movement:${m.id}`,
      `has a date complication but dateWindowPosition is null`,
    );
  }
}

// ── dataConfidence: 'high' requires references ────────────────────────────────
for (const m of movements) {
  if (m.dataConfidence === 'high' && m.references.length === 0) {
    err(`movement:${m.id}`, `dataConfidence 'high' but no references`);
  }
}
for (const p of parts) {
  if (p.dataConfidence === 'high' && p.references.length === 0) {
    err(`part:${p.id}`, `dataConfidence 'high' but no references`);
  }
}

// ── Referential integrity (families ↔ movements) ─────────────────────────────
for (const m of movements) {
  if (!familyIds.has(m.family)) {
    err(
      `movement:${m.id}`,
      `family "${m.family}" does not exist in families.ts`,
    );
  }
}
for (const f of families) {
  for (const memberId of f.members) {
    if (!movementIds.has(memberId)) {
      err(`family:${f.id}`, `member "${memberId}" is not a known movement`);
      continue;
    }
    const member = movements.find((m) => m.id === memberId)!;
    if (member.family !== f.id) {
      err(
        `family:${f.id}`,
        `member "${memberId}" lists family "${member.family}", not "${f.id}"`,
      );
    }
  }
}

// ── Family member hand sizes must not contradict the family (build-ruining) ───
function handMismatch(a: HandSizes, b: HandSizes): string | null {
  for (const key of ['hour', 'minute', 'second'] as const) {
    const av = a[key];
    const bv = b[key];
    if (av != null && bv != null && Math.abs(av - bv) > 1e-9) {
      return `${key} bore ${bv} ≠ family ${av}`;
    }
  }
  return null;
}
for (const f of families) {
  if (!f.sharedHandSizes) continue;
  for (const memberId of f.members) {
    const member: Movement | undefined = movements.find(
      (m) => m.id === memberId,
    );
    if (!member) continue; // already reported above
    const mismatch = handMismatch(f.sharedHandSizes, member.handSizes);
    if (mismatch) {
      err(
        `family:${f.id}`,
        `member "${memberId}" hand sizes contradict the family: ${mismatch}`,
      );
    }
  }
}

// ── Part fit references (warn — a part may list a not-yet-seeded caliber) ─────
for (const p of parts) {
  for (const mid of p.fitsMovements) {
    if (!movementIds.has(mid))
      warn(
        `part:${p.id}`,
        `fitsMovements references unknown movement "${mid}"`,
      );
  }
  for (const fid of p.fitsFamilies) {
    if (!familyIds.has(fid))
      warn(`part:${p.id}`, `fitsFamilies references unknown family "${fid}"`);
  }
}

// ── Report ───────────────────────────────────────────────────────────────────
console.log('');
console.log(
  `MIMIR data validation — ${movements.length} movements, ${parts.length} parts, ${families.length} families`,
);
console.log('─'.repeat(72));

if (warnings.length > 0) {
  console.log(`\n${warnings.length} warning(s):`);
  for (const w of warnings) console.log(`  ⚠ ${w}`);
}

if (errors.length > 0) {
  console.log(`\n${errors.length} error(s):`);
  for (const e of errors) console.log(`  ✖ ${e}`);
  console.log('\n✖ validate:data FAILED\n');
  process.exit(1);
}

console.log(`\n✔ validate:data passed (${warnings.length} warning(s))\n`);
process.exit(0);
