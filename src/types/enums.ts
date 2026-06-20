// ─────────────────────────────────────────────────────────────────────────────
// Shared enums / string-literal unions for the domain model.
// Keep these in lockstep with the zod enums in src/lib/schema.ts.
// ─────────────────────────────────────────────────────────────────────────────

export const MOVEMENT_TYPES = [
  'automatic',
  'manual',
  'quartz',
  'mecaquartz',
  'spring-drive',
  'kinetic',
  'solar',
] as const;
export type MovementType = (typeof MOVEMENT_TYPES)[number];

/** Movement types whose rate is a mechanical beat (vph), not a quartz crystal. */
export const MECHANICAL_TYPES = ['automatic', 'manual'] as const;

export const COMPLICATIONS = [
  'hours',
  'minutes',
  'central-seconds',
  'small-seconds',
  'date',
  'day',
  'day-date',
  'gmt',
  'chronograph',
  'power-reserve-indicator',
  'moonphase',
  'open-heart',
  'skeleton',
  'world-time',
  'alarm',
  '24-hour',
] as const;
export type Complication = (typeof COMPLICATIONS)[number];

/**
 * Complications that are "base timekeeping" and therefore excluded when we
 * count how *complicated* a movement is (see Movement filtering, Section 4).
 */
export const BASE_COMPLICATIONS = [
  'hours',
  'minutes',
  'central-seconds',
  'small-seconds',
] as const satisfies readonly Complication[];

export const PART_CATEGORIES = [
  'case',
  'dial',
  'hands',
  'crystal',
  'stem-crown',
  'spacer-ring',
  'bezel',
  'gasket',
  'rotor',
] as const;
export type PartCategory = (typeof PART_CATEGORIES)[number];

export const AVAILABILITIES = [
  'common',
  'moderate',
  'scarce',
  'discontinued',
] as const;
export type Availability = (typeof AVAILABILITIES)[number];

export const DATA_CONFIDENCES = ['high', 'medium', 'low'] as const;
export type DataConfidence = (typeof DATA_CONFIDENCES)[number];

export const CRYSTAL_TYPES = ['flat', 'domed', 'double-domed', 'box'] as const;
export type CrystalType = (typeof CRYSTAL_TYPES)[number];

export const CRYSTAL_MATERIALS = ['sapphire', 'mineral', 'acrylic'] as const;
export type CrystalMaterial = (typeof CRYSTAL_MATERIALS)[number];

/** Derived 1–5 cost tier (see lib/cost.ts). */
export type CostTier = 1 | 2 | 3 | 4 | 5;
