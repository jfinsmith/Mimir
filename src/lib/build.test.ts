import { describe, it, expect } from 'vitest';
import {
  canUsePart,
  computeBuildChecks,
  missingPieces,
  partOptionsForSlot,
  rollupStatus,
  runningCost,
  type ResolvedBuild,
} from './build';
import { makeMovement, makePart } from '@/test/factories';

const nh35 = makeMovement({
  id: 'seiko-nh35',
  caliber: 'NH35',
  family: 'seiko-nh3x',
  casingDiameterMm: 29.4,
  handSizes: { hour: 1.5, minute: 0.9, second: 0.21 },
});

describe('computeBuildChecks', () => {
  it('maps a direct movement↔case fit to an OK check', () => {
    const build: ResolvedBuild = {
      movement: nh35,
      parts: {
        case: makePart({
          category: 'case',
          fitsFamilies: ['seiko-nh3x'],
          movementOpeningMm: 29.4,
        }),
      },
    };
    const checks = computeBuildChecks(build);
    const caseCheck = checks.find((c) => c.id === 'mv-case');
    expect(caseCheck?.status).toBe('ok');
  });

  it('flags a dial too large for the case crystal seat', () => {
    const build: ResolvedBuild = {
      movement: nh35,
      parts: {
        case: makePart({ category: 'case', crystalSeatDiameterMm: 30 }),
        dial: makePart({
          category: 'dial',
          dialDiameterMm: 40,
          feetless: true,
        }),
      },
    };
    const dialCase = computeBuildChecks(build).find(
      (c) => c.id === 'dial-case',
    );
    expect(dialCase?.status).toBe('fail');
  });

  it('passes a crystal sized to the case seat', () => {
    const build: ResolvedBuild = {
      movement: nh35,
      parts: {
        case: makePart({ category: 'case', crystalSeatDiameterMm: 31.5 }),
        crystal: makePart({ category: 'crystal', crystalDiameterMm: 31.5 }),
      },
    };
    const cc = computeBuildChecks(build).find((c) => c.id === 'crystal-case');
    expect(cc?.status).toBe('ok');
  });

  it('rollup reports the most severe status', () => {
    expect(
      rollupStatus([
        { id: 'a', label: '', status: 'ok', reasons: [] },
        { id: 'b', label: '', status: 'fail', reasons: [] },
        { id: 'c', label: '', status: 'warn', reasons: [] },
      ]),
    ).toBe('fail');
  });
});

describe('runningCost', () => {
  it('sums movement + part price midpoints', () => {
    const build: ResolvedBuild = {
      movement: makeMovement({ priceUsdLow: 30, priceUsdHigh: 50 }), // 40
      parts: {
        case: makePart({ category: 'case', priceUsdLow: 20, priceUsdHigh: 40 }), // 30
      },
    };
    expect(runningCost(build).total).toBe(70);
  });
});

describe('partOptionsForSlot / canUsePart', () => {
  // Seiko-bore hands (fit NH35) vs Miyota-bore hands (1.00 minute → incompatible).
  const seikoHands = makePart({
    id: 'hands-seiko',
    name: 'Seiko hands',
    category: 'hands',
    handBore: { hour: 1.5, minute: 0.9, second: 0.21 },
  });
  const miyotaHands = makePart({
    id: 'hands-miyota',
    name: 'Miyota hands',
    category: 'hands',
    handBore: { hour: 1.5, minute: 1.0, second: 0.17 },
  });

  it('marks a certainly-incompatible part as blocked', () => {
    const opts = partOptionsForSlot(nh35, [miyotaHands, seikoHands]);
    const miyota = opts.find((o) => o.part.id === 'hands-miyota');
    const seiko = opts.find((o) => o.part.id === 'hands-seiko');
    expect(miyota?.blocked).toBe(true); // 1.00mm minute bore ≠ NH35 0.90mm
    expect(seiko?.blocked).toBe(false);
  });

  it('sorts best-fit first and blocked (incompatible) last', () => {
    const opts = partOptionsForSlot(nh35, [miyotaHands, seikoHands]);
    expect(opts[0]?.part.id).toBe('hands-seiko');
    expect(opts[opts.length - 1]?.blocked).toBe(true);
  });

  it('blocks nothing and stays alphabetical when no movement is chosen', () => {
    const opts = partOptionsForSlot(null, [miyotaHands, seikoHands]);
    expect(opts.every((o) => !o.blocked && o.verdict === null)).toBe(true);
    expect(opts.map((o) => o.part.name)).toEqual([
      'Miyota hands',
      'Seiko hands',
    ]);
  });

  it('canUsePart guards incompatible parts (and allows all with no movement)', () => {
    expect(canUsePart(nh35, miyotaHands)).toBe(false);
    expect(canUsePart(nh35, seikoHands)).toBe(true);
    expect(canUsePart(null, miyotaHands)).toBe(true);
  });
});

describe('missingPieces', () => {
  it('asks for a movement first', () => {
    expect(missingPieces({ movement: null, parts: {} })[0]).toMatch(
      /movement/i,
    );
  });

  it('lists missing core slots', () => {
    const out = missingPieces({ movement: nh35, parts: {} });
    expect(out.join(' ')).toMatch(/case/);
    expect(out.join(' ')).toMatch(/dial/);
    expect(out.join(' ')).toMatch(/hand/);
  });

  it('warns when a too-large case has no spacer', () => {
    const out = missingPieces({
      movement: nh35,
      parts: { case: makePart({ category: 'case', movementOpeningMm: 31 }) },
    });
    expect(out.join(' ')).toMatch(/spacer/i);
  });
});
