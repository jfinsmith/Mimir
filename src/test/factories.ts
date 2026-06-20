// Hermetic test fixtures. Fitment/validator unit tests build Movements and
// Parts from these factories (NOT from the shipped seed data) so the tests
// don't drift when the catalog changes.

import type { HandSizes, Movement, Part } from '@/types';

export function makeHandSizes(partial: Partial<HandSizes> = {}): HandSizes {
  return { hour: 1.5, minute: 0.9, second: 0.21, ...partial };
}

/** A valid, neutral automatic movement (NH35-shaped). Override what you test. */
export function makeMovement(partial: Partial<Movement> = {}): Movement {
  const { handSizes, ...rest } = partial;
  return {
    id: 'test-movement',
    caliber: 'TEST',
    aliases: [],
    brand: 'Test Co.',
    family: 'test-family',
    baseCaliber: null,
    type: 'automatic',
    complications: ['hours', 'minutes', 'central-seconds', 'date'],
    jewels: 24,
    ligne: null,
    diameterMm: 27.4,
    casingDiameterMm: 29.4,
    heightMm: 5.32,
    heightWithHandsMm: 7.55,
    handSizes: handSizes ? makeHandSizes(handSizes) : makeHandSizes(),
    dialFeet: ['5:30', '10:30'],
    feetlessDialsCommon: true,
    crownPositions: ['3.0', '3.8', '4.1'],
    dateWindowPosition: '3',
    stemPartNo: null,
    beatRateVph: 21600,
    quartzFrequencyHz: null,
    hacking: true,
    handWinding: true,
    powerReserveHours: 41,
    batteryCell: null,
    batteryLifeMonths: null,
    priceUsdLow: 30,
    priceUsdHigh: 45,
    costTier: 2,
    availability: 'common',
    commonVendors: [],
    manufactureCountry: null,
    yearIntroduced: null,
    notes: '',
    images: [],
    references: [],
    dataConfidence: 'high',
    ...rest,
  };
}

/** A blank part. Set `category` and the fields relevant to it. */
export function makePart(partial: Partial<Part> = {}): Part {
  return {
    id: 'test-part',
    category: 'case',
    name: 'Test Part',
    brand: null,
    fitsMovements: [],
    fitsFamilies: [],
    priceUsdLow: null,
    priceUsdHigh: null,
    commonVendors: [],
    images: [],
    references: [],
    notes: '',
    dataConfidence: 'low',
    ...partial,
  };
}
