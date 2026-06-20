// Shared value objects used across Movement and Part.

import type { DataConfidence } from './enums';

/**
 * Hand bore diameters in **mm**. CANONICAL ORDER: hour / minute / second.
 * Retailers list these every which way ("150/90/21" ×100, or M/H/S order) —
 * always normalize to hour/minute/second-in-mm on ingest (see Section 8).
 * `null` means "unknown", which the fitment engine treats as a caution, not a fit.
 */
export interface HandSizes {
  hour: number | null;
  minute: number | null;
  second: number | null;
  /** Central chronograph sweep-hand bore, if this is a chronograph. */
  chronographSweep?: number | null;
}

export interface ImageRef {
  src: string;
  alt: string;
  credit: string | null;
  sourceUrl: string | null;
  license: string | null;
}

export interface SourceRef {
  label: string;
  url: string;
}

/** Anything carrying a confidence flag we surface in the UI. */
export interface Confident {
  dataConfidence: DataConfidence;
  references: SourceRef[];
}
