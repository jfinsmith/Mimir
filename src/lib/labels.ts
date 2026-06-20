// Human-friendly display labels for enum values. Single source so the catalog,
// filters, detail and compare views stay consistent.

import type {
  Availability,
  Complication,
  MovementType,
  PartCategory,
} from '@/types';

export const PART_CATEGORY_LABEL: Record<PartCategory, string> = {
  case: 'Case',
  dial: 'Dial',
  hands: 'Hands',
  crystal: 'Crystal',
  'stem-crown': 'Stem / crown',
  'spacer-ring': 'Spacer / ring',
  bezel: 'Bezel',
  gasket: 'Gasket',
  rotor: 'Rotor',
};

/** Display order for grouping parts by category. */
export const PART_CATEGORY_ORDER: PartCategory[] = [
  'case',
  'dial',
  'hands',
  'crystal',
  'stem-crown',
  'spacer-ring',
  'bezel',
  'gasket',
  'rotor',
];

export const TYPE_LABEL: Record<MovementType, string> = {
  automatic: 'Automatic',
  manual: 'Manual wind',
  quartz: 'Quartz',
  mecaquartz: 'Mecaquartz',
  'spring-drive': 'Spring Drive',
  kinetic: 'Kinetic',
  solar: 'Solar',
};

export const COMPLICATION_LABEL: Record<Complication, string> = {
  hours: 'Hours',
  minutes: 'Minutes',
  'central-seconds': 'Central seconds',
  'small-seconds': 'Small seconds',
  date: 'Date',
  day: 'Day',
  'day-date': 'Day-date',
  gmt: 'GMT',
  chronograph: 'Chronograph',
  'power-reserve-indicator': 'Power reserve',
  moonphase: 'Moonphase',
  'open-heart': 'Open heart',
  skeleton: 'Skeleton',
  'world-time': 'World time',
  alarm: 'Alarm',
  '24-hour': '24-hour',
};

export const AVAILABILITY_LABEL: Record<Availability, string> = {
  common: 'Common',
  moderate: 'Moderate',
  scarce: 'Scarce',
  discontinued: 'Discontinued',
};

/** Complications worth showing as chips (drops base hours/minutes). */
export function displayComplications(comps: Complication[]): Complication[] {
  const hidden = new Set<Complication>(['hours', 'minutes']);
  return comps.filter((c) => !hidden.has(c));
}
