import type { HandSizes, ImageRef, SourceRef } from './common';
import type {
  Availability,
  Complication,
  CostTier,
  DataConfidence,
  MovementType,
} from './enums';

/**
 * A watch movement (caliber). Every numeric field is either a verified value
 * (cited in `references`) or `null` — NEVER a guess (Guardrail #1).
 */
export interface Movement {
  id: string; // slug, e.g. 'seiko-nh35'
  caliber: string; // 'NH35' / 'NH35A'
  aliases: string[]; // ['7S26 upgrade','SII NH35A','TMI NH35']
  brand: string; // 'Seiko (SII/TMI)'
  family: string; // FK into families.ts, e.g. 'seiko-nh3x'
  baseCaliber: string | null; // clones reference their base, e.g. 'Venus 175'
  type: MovementType;
  complications: Complication[];
  jewels: number | null;

  // ── Physical / fitment-critical ──────────────────────────────────────────
  ligne: string | null; // e.g. "12'''"
  diameterMm: number | null; // movement outside diameter
  casingDiameterMm: number | null; // incl. dial spacer/ring — used vs case opening
  heightMm: number | null; // movement thickness (no hands)
  heightWithHandsMm: number | null; // top of hand stack — used vs case depth
  handSizes: HandSizes;
  dialFeet: string[] | null; // clock positions, e.g. ['5:30','10:30']; [] = none
  feetlessDialsCommon: boolean; // are glue-on (feetless) aftermarket dials common?
  crownPositions: string[] | null; // case crown positions served, e.g. ['3.0','3.8','4.1']
  dateWindowPosition: string | null; // '3' | '4.5' | '6' | null
  stemPartNo: string | null;

  // ── Performance ──────────────────────────────────────────────────────────
  beatRateVph: number | null; // mechanical only; null for quartz
  quartzFrequencyHz: number | null; // quartz only (e.g. 32768)
  hacking: boolean | null;
  handWinding: boolean | null;
  powerReserveHours: number | null;
  batteryCell: string | null; // quartz, e.g. '371 / SR920SW'
  batteryLifeMonths: number | null;

  // ── Commerce ─────────────────────────────────────────────────────────────
  priceUsdLow: number | null; // typical street/parts price (single unit)
  priceUsdHigh: number | null;
  costTier: CostTier | null; // DERIVED via lib/cost.ts; null = price unknown
  availability: Availability;
  commonVendors: string[];

  // ── Meta ─────────────────────────────────────────────────────────────────
  manufactureCountry: string | null;
  yearIntroduced: number | null;
  notes: string;
  images: ImageRef[];
  references: SourceRef[];
  dataConfidence: DataConfidence;
}
