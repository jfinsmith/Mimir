import { describe, it, expect } from 'vitest';
import {
  evaluateFit,
  FIT_STATUS_RANK,
  compareFitStatus,
  type FitStatus,
} from './fitment';
import { makeMovement, makePart } from '@/test/factories';

// Canonical seed-ish movements used across the mandatory cases.
const nh35 = makeMovement({
  id: 'seiko-nh35',
  caliber: 'NH35',
  family: 'seiko-nh3x',
  casingDiameterMm: 29.4,
  heightWithHandsMm: 7.55,
  handSizes: { hour: 1.5, minute: 0.9, second: 0.21 },
  dialFeet: ['5:30', '10:30'],
  feetlessDialsCommon: true,
  crownPositions: ['3.0', '3.8', '4.1'],
  dateWindowPosition: '3',
});

const nh36 = makeMovement({
  id: 'seiko-nh36',
  caliber: 'NH36',
  family: 'seiko-nh3x',
  complications: ['hours', 'minutes', 'central-seconds', 'day-date'],
  casingDiameterMm: 29.4,
  handSizes: { hour: 1.5, minute: 0.9, second: 0.21 },
  dialFeet: ['5:30', '10:30'],
  feetlessDialsCommon: true,
});

const miyota8215 = makeMovement({
  id: 'miyota-8215',
  caliber: '8215',
  family: 'miyota-82xx',
  casingDiameterMm: 30.3,
  handSizes: { hour: 1.5, minute: 1.0, second: 0.17 },
  dialFeet: ['5:30', '10:30'],
  feetlessDialsCommon: false,
});

const sw200 = makeMovement({
  id: 'sellita-sw200-1',
  caliber: 'SW200-1',
  family: 'eta-2824-clones',
  casingDiameterMm: 27.0,
  handSizes: { hour: 1.5, minute: 0.9, second: 0.25 },
  dialFeet: ['1:00', '5:00'],
  feetlessDialsCommon: false,
  dateWindowPosition: '3',
});

describe('Fitment engine — MANDATORY cases (Section 6)', () => {
  it('NH35 + a case tagged fitsFamilies:[seiko-nh3x] → direct', () => {
    const part = makePart({
      category: 'case',
      fitsFamilies: ['seiko-nh3x'],
      movementOpeningMm: 29.4,
      internalDepthMm: 8.5,
      crownPosition: '3.8',
      dateAperturePosition: '3',
    });
    const v = evaluateFit(nh35, part);
    expect(v.status).toBe('direct');
    expect(v.reasons.length).toBeGreaterThan(0);
  });

  it('NH35 hands (1.50/0.90/0.21) on Miyota 8215 (1.50/1.00/0.17) → incompatible (minute bore)', () => {
    const nh35Hands = makePart({
      category: 'hands',
      fitsFamilies: ['seiko-nh3x'],
      handBore: { hour: 1.5, minute: 0.9, second: 0.21 },
    });
    const v = evaluateFit(miyota8215, nh35Hands);
    expect(v.status).toBe('incompatible');
    expect(v.reasons.join(' ')).toMatch(/minute/i);
    expect(v.reasons.join(' ')).toMatch(/0\.9/);
    expect(v.reasons.join(' ')).toMatch(/1(\.0+)?/);
  });

  it('ETA-2824-feet dial on Sellita SW200-1 → direct (documented drop-in)', () => {
    const dial = makePart({
      category: 'dial',
      fitsFamilies: ['eta-2824-clones'],
      dialFeet: ['1:00', '5:00'],
      feetless: false,
      dateWindowPosition: '3',
    });
    const v = evaluateFit(sw200, dial);
    expect(v.status).toBe('direct');
  });

  it('28.5mm-opening case + NH35 (casing ~29.4) → incompatible', () => {
    const part = makePart({ category: 'case', movementOpeningMm: 28.5 });
    const v = evaluateFit(nh35, part);
    expect(v.status).toBe('incompatible');
    expect(v.reasons.join(' ')).toMatch(/28\.5/);
  });

  it('31mm-opening case + NH35 → with-spacer (+ requiredExtra)', () => {
    const part = makePart({ category: 'case', movementOpeningMm: 31 });
    const v = evaluateFit(nh35, part);
    expect(v.status).toBe('with-spacer');
    expect(v.requiredExtras.join(' ')).toMatch(/spacer|ring/i);
  });

  it('Feetless NH35 dial on NH36 → direct (same family, feetless)', () => {
    const dial = makePart({
      category: 'dial',
      fitsFamilies: ['seiko-nh3x'],
      feetless: true,
    });
    const v = evaluateFit(nh36, dial);
    expect(v.status).toBe('direct');
  });
});

describe('Fitment engine — HANDS rules', () => {
  it('exact H/M match + second within ±0.02mm → not incompatible', () => {
    const hands = makePart({
      category: 'hands',
      fitsFamilies: ['seiko-nh3x'],
      handBore: { hour: 1.5, minute: 0.9, second: 0.2 }, // 0.20 vs 0.21 = 0.01
    });
    const v = evaluateFit(nh35, hands);
    expect(v.status).not.toBe('incompatible');
  });

  it('second bore beyond ±0.02mm → incompatible', () => {
    const hands = makePart({
      category: 'hands',
      handBore: { hour: 1.5, minute: 0.9, second: 0.25 }, // 0.25 vs 0.21 = 0.04
    });
    const v = evaluateFit(nh35, hands);
    expect(v.status).toBe('incompatible');
    expect(v.reasons.join(' ')).toMatch(/second/i);
  });

  it('absorbs source bore rounding (0.89 ≈ 0.90 minute) → not incompatible', () => {
    const ccBores = makeMovement({
      handSizes: { hour: 1.5, minute: 0.89, second: 0.21 },
    });
    const hands = makePart({
      category: 'hands',
      handBore: { hour: 1.5, minute: 0.9, second: 0.21 },
    });
    expect(evaluateFit(ccBores, hands).status).not.toBe('incompatible');
  });

  it('unknown hand bore → check-clearance with a warning (not a fit)', () => {
    const blindMovement = makeMovement({
      handSizes: { hour: null, minute: null, second: null },
    });
    const hands = makePart({
      category: 'hands',
      handBore: { hour: 1.5, minute: 0.9, second: 0.21 },
    });
    const v = evaluateFit(blindMovement, hands);
    expect(v.status).toBe('check-clearance');
    expect(v.warnings.length).toBeGreaterThan(0);
  });

  it('chronograph sweep bore mismatch → incompatible', () => {
    const chrono = makeMovement({
      complications: ['hours', 'minutes', 'chronograph', 'date'],
      handSizes: {
        hour: 1.5,
        minute: 0.9,
        second: 0.25,
        chronographSweep: 0.2,
      },
    });
    const hands = makePart({
      category: 'hands',
      handBore: { hour: 1.5, minute: 0.9, second: 0.25, chronographSweep: 0.3 },
    });
    const v = evaluateFit(chrono, hands);
    expect(v.status).toBe('incompatible');
    expect(v.reasons.join(' ')).toMatch(/chrono|chrono|sweep/i);
  });
});

describe('Fitment engine — CASE rules', () => {
  it('opening equal within ±0.2mm → direct', () => {
    const part = makePart({ category: 'case', movementOpeningMm: 29.5 });
    expect(evaluateFit(nh35, part).status).toBe('direct');
  });

  it('crown position not supported → incompatible', () => {
    const part = makePart({
      category: 'case',
      movementOpeningMm: 29.4,
      crownPosition: '4.0',
    });
    const v = evaluateFit(nh35, part);
    expect(v.status).toBe('incompatible');
    expect(v.reasons.join(' ')).toMatch(/crown/i);
  });

  it('date aperture position mismatch → needs-modification', () => {
    const part = makePart({
      category: 'case',
      movementOpeningMm: 29.4,
      dateAperturePosition: '4.5',
    });
    const v = evaluateFit(nh35, part);
    expect(v.status).toBe('needs-modification');
  });

  it('internal depth shallower than hand stack → incompatible', () => {
    const part = makePart({
      category: 'case',
      movementOpeningMm: 29.4,
      internalDepthMm: 6.0, // < heightWithHands 7.55
    });
    expect(evaluateFit(nh35, part).status).toBe('incompatible');
  });

  it('explicit family fit but opening too small → still incompatible (downgrade)', () => {
    const part = makePart({
      category: 'case',
      fitsFamilies: ['seiko-nh3x'],
      movementOpeningMm: 27.0,
    });
    expect(evaluateFit(nh35, part).status).toBe('incompatible');
  });

  it('precedence: with-spacer opening + bad crown → incompatible wins', () => {
    const part = makePart({
      category: 'case',
      movementOpeningMm: 31,
      crownPosition: '4.0',
    });
    expect(evaluateFit(nh35, part).status).toBe('incompatible');
  });
});

describe('Fitment engine — DIAL rules', () => {
  it('feet differ but feetless dials common → needs-modification + extra', () => {
    const dial = makePart({
      category: 'dial',
      dialFeet: ['1:00', '7:00'],
      feetless: false,
    });
    const v = evaluateFit(nh35, dial); // nh35.feetlessDialsCommon = true
    expect(v.status).toBe('needs-modification');
    expect(v.requiredExtras.join(' ')).toMatch(/feet|feetless|glue/i);
  });

  it('feet differ and feetless uncommon → incompatible', () => {
    const dial = makePart({
      category: 'dial',
      dialFeet: ['1:00', '7:00'],
      feetless: false,
    });
    const v = evaluateFit(miyota8215, dial); // feetlessDialsCommon = false
    expect(v.status).toBe('incompatible');
  });
});

describe('Fitment engine — STEM/CROWN + fallbacks', () => {
  it('stem listed for the caliber → direct', () => {
    const stem = makePart({
      category: 'stem-crown',
      stemForCalibers: ['seiko-nh35'],
    });
    expect(evaluateFit(nh35, stem).status).toBe('direct');
  });

  it('stem listed only for other calibers → incompatible', () => {
    const stem = makePart({
      category: 'stem-crown',
      stemForCalibers: ['eta-2824-2'],
    });
    expect(evaluateFit(nh35, stem).status).toBe('incompatible');
  });

  it('part with no usable data and no explicit fit → unknown', () => {
    const gasket = makePart({ category: 'gasket' });
    expect(evaluateFit(nh35, gasket).status).toBe('unknown');
  });

  it('every non-unknown verdict carries at least one reason or warning', () => {
    const cases = [
      evaluateFit(nh35, makePart({ category: 'case', movementOpeningMm: 31 })),
      evaluateFit(
        nh35,
        makePart({ category: 'case', movementOpeningMm: 28.5 }),
      ),
    ];
    for (const v of cases) {
      expect(v.reasons.length + v.warnings.length).toBeGreaterThan(0);
    }
  });
});

describe('Fit status ordering', () => {
  it('ranks incompatible as the most severe', () => {
    expect(FIT_STATUS_RANK.incompatible).toBeGreaterThan(
      FIT_STATUS_RANK['needs-modification'],
    );
    expect(FIT_STATUS_RANK.direct).toBeGreaterThan(FIT_STATUS_RANK.unknown);
  });

  it('compareFitStatus sorts best-first', () => {
    const sorted = (
      ['incompatible', 'direct', 'with-spacer'] as FitStatus[]
    ).sort(compareFitStatus);
    expect(sorted[0]).toBe('direct');
    expect(sorted[sorted.length - 1]).toBe('incompatible');
  });
});
