// Display formatters for spec values. Centralized so the detail and compare
// views render identical strings.

import type { HandSizes, Movement } from '@/types';

export const DASH = '—';

export const fmtMm = (n: number | null | undefined): string =>
  n == null ? DASH : `${n} mm`;

export const fmtNum = (n: number | null | undefined, suffix = ''): string =>
  n == null ? DASH : `${n}${suffix}`;

export const fmtBool = (b: boolean | null | undefined): string =>
  b == null ? DASH : b ? 'Yes' : 'No';

export const fmtList = (a: string[] | null | undefined): string => {
  if (a == null) return DASH;
  return a.length ? a.join(', ') : 'None';
};

export const fmtHands = (h: HandSizes): string => {
  const part = (n: number | null | undefined) => (n == null ? DASH : String(n));
  const base = `${part(h.hour)} / ${part(h.minute)} / ${part(h.second)} mm`;
  return h.chronographSweep != null
    ? `${base} (+${h.chronographSweep} chrono)`
    : base;
};

export const fmtPriceRange = (lo: number | null, hi: number | null): string => {
  if (lo == null && hi == null) return DASH;
  if (lo != null && hi != null) return `$${lo}–${hi}`;
  return `$${lo ?? hi}`;
};

export const fmtRate = (m: Movement): string => {
  if (m.beatRateVph != null) return `${m.beatRateVph.toLocaleString()} vph`;
  if (m.quartzFrequencyHz != null)
    return `${m.quartzFrequencyHz.toLocaleString()} Hz (quartz)`;
  return DASH;
};

/** ligne ≈ mm / 2.2558 — shown alongside a mm diameter. */
export const ligneFromMm = (mm: number | null): string =>
  mm == null ? DASH : `${(mm / 2.2558).toFixed(2)}‴`;
