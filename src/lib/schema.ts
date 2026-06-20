// ─────────────────────────────────────────────────────────────────────────────
// Runtime schemas (zod) for every data entity. These enforce STRUCTURE (shapes,
// enums, slug/clock-position formats). Cross-record / cross-field business rules
// (cost-tier consistency, quartz vs beat-rate, family hand-size contradictions,
// referential integrity, …) live in scripts/validate-data.ts.
//
// Keep enums in lockstep with src/types/enums.ts (imported here, single source).
// ─────────────────────────────────────────────────────────────────────────────

import { z } from 'zod';
import {
  AVAILABILITIES,
  COMPLICATIONS,
  CRYSTAL_MATERIALS,
  CRYSTAL_TYPES,
  DATA_CONFIDENCES,
  MOVEMENT_TYPES,
  PART_CATEGORIES,
} from '@/types';

// ── Format predicates (reused by the validator) ──────────────────────────────
const HOUR_DECIMAL = /^(0?[1-9]|1[0-2])(\.\d+)?$/; // '3', '4.5', '3.8', '12'
const HOUR_MINUTE = /^(0?[1-9]|1[0-2]):[0-5]\d$/; // '5:30', '10:30'
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isClockPosition(s: string): boolean {
  const t = s.trim();
  return HOUR_DECIMAL.test(t) || HOUR_MINUTE.test(t);
}
export function isSlug(s: string): boolean {
  return SLUG.test(s);
}

// ── Primitives ───────────────────────────────────────────────────────────────
const slug = z
  .string()
  .refine(isSlug, { message: 'must be a kebab-case slug' });
const clockPosition = z
  .string()
  .refine(isClockPosition, { message: 'malformed clock position' });
const nullablePosMm = z.number().positive().nullable();
const nullableNonNegUsd = z.number().nonnegative().nullable();

export const handSizesSchema = z.object({
  hour: nullablePosMm,
  minute: nullablePosMm,
  second: nullablePosMm,
  chronographSweep: nullablePosMm.optional(),
});

export const imageRefSchema = z.object({
  src: z.string(),
  alt: z.string(),
  credit: z.string().nullable(),
  sourceUrl: z.string().url().nullable(),
  license: z.string().nullable(),
});

export const sourceRefSchema = z.object({
  label: z.string().min(1),
  url: z.string().url(),
});

export const costTierSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
]);

// ── Movement ─────────────────────────────────────────────────────────────────
export const movementSchema = z
  .object({
    id: slug,
    caliber: z.string().min(1),
    aliases: z.array(z.string()),
    brand: z.string().min(1),
    family: slug,
    baseCaliber: z.string().nullable(),
    type: z.enum(MOVEMENT_TYPES),
    complications: z.array(z.enum(COMPLICATIONS)),
    jewels: z.number().int().nonnegative().nullable(),
    ligne: z.string().nullable(),
    diameterMm: nullablePosMm,
    casingDiameterMm: nullablePosMm,
    heightMm: nullablePosMm,
    heightWithHandsMm: nullablePosMm,
    handSizes: handSizesSchema,
    dialFeet: z.array(clockPosition).nullable(),
    feetlessDialsCommon: z.boolean(),
    crownPositions: z.array(clockPosition).nullable(),
    dateWindowPosition: clockPosition.nullable(),
    stemPartNo: z.string().nullable(),
    beatRateVph: z.number().positive().nullable(),
    quartzFrequencyHz: z.number().positive().nullable(),
    hacking: z.boolean().nullable(),
    handWinding: z.boolean().nullable(),
    powerReserveHours: z.number().positive().nullable(),
    batteryCell: z.string().nullable(),
    batteryLifeMonths: z.number().positive().nullable(),
    priceUsdLow: nullableNonNegUsd,
    priceUsdHigh: nullableNonNegUsd,
    costTier: costTierSchema.nullable(), // null = price unknown
    availability: z.enum(AVAILABILITIES),
    commonVendors: z.array(z.string()),
    manufactureCountry: z.string().nullable(),
    yearIntroduced: z.number().int().nullable(),
    notes: z.string(),
    images: z.array(imageRefSchema),
    references: z.array(sourceRefSchema),
    dataConfidence: z.enum(DATA_CONFIDENCES),
  })
  .strict();

// ── Part ─────────────────────────────────────────────────────────────────────
export const partSchema = z
  .object({
    id: slug,
    category: z.enum(PART_CATEGORIES),
    name: z.string().min(1),
    brand: z.string().nullable(),
    fitsMovements: z.array(z.string()),
    fitsFamilies: z.array(z.string()),
    // CASE
    movementOpeningMm: nullablePosMm.optional(),
    internalDepthMm: nullablePosMm.optional(),
    caseDiameterMm: nullablePosMm.optional(),
    crownPosition: clockPosition.nullable().optional(),
    dateAperturePosition: clockPosition.nullable().optional(),
    crystalSeatDiameterMm: nullablePosMm.optional(),
    lugWidthMm: nullablePosMm.optional(),
    // DIAL
    dialDiameterMm: nullablePosMm.optional(),
    dialFeet: z.array(clockPosition).nullable().optional(),
    feetless: z.boolean().optional(),
    // HANDS
    handBore: handSizesSchema.optional(),
    handStyle: z.string().nullable().optional(),
    // CRYSTAL
    crystalDiameterMm: nullablePosMm.optional(),
    crystalType: z.enum(CRYSTAL_TYPES).optional(),
    material: z.enum(CRYSTAL_MATERIALS).nullable().optional(),
    // STEM / CROWN
    stemForCalibers: z.array(z.string()).optional(),
    crownThread: z.string().nullable().optional(),
    crownSizeMm: nullablePosMm.optional(),
    tubeThread: z.string().nullable().optional(),
    // SHARED
    dateWindowPosition: clockPosition.nullable().optional(),
    // COMMERCE / META
    priceUsdLow: nullableNonNegUsd,
    priceUsdHigh: nullableNonNegUsd,
    commonVendors: z.array(z.string()),
    images: z.array(imageRefSchema),
    references: z.array(sourceRefSchema),
    notes: z.string(),
    dataConfidence: z.enum(DATA_CONFIDENCES),
  })
  .strict();

// ── Family ───────────────────────────────────────────────────────────────────
export const familySchema = z
  .object({
    id: slug,
    label: z.string().min(1),
    members: z.array(slug),
    sharedHandSizes: handSizesSchema.nullable(),
    sharedDialFeet: z.array(clockPosition).nullable(),
    sharedDiameterMm: nullablePosMm,
    notes: z.string(),
  })
  .strict();
