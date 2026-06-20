import type { HandSizes, ImageRef, SourceRef } from './common';
import type {
  CrystalMaterial,
  CrystalType,
  DataConfidence,
  PartCategory,
} from './enums';

/**
 * A modding part. Only the fields relevant to `category` are populated; the
 * fitment engine reads whichever apply. `fitsMovements`/`fitsFamilies` are the
 * strongest fit signal — an explicit list published by the maker.
 */
export interface Part {
  id: string;
  category: PartCategory;
  name: string;
  brand: string | null;

  // ── Fitment hooks (strongest signal first) ───────────────────────────────
  fitsMovements: string[]; // explicit movement ids the maker lists
  fitsFamilies: string[]; // family ids (e.g. 'seiko-nh3x')

  // ── CASE ─────────────────────────────────────────────────────────────────
  movementOpeningMm?: number | null; // internal opening for movement (+ ring)
  internalDepthMm?: number | null;
  caseDiameterMm?: number | null; // external
  crownPosition?: string | null; // '3.0' | '3.8' | '4.1' | '4.0'
  dateAperturePosition?: string | null;
  crystalSeatDiameterMm?: number | null;
  lugWidthMm?: number | null;

  // ── DIAL ─────────────────────────────────────────────────────────────────
  dialDiameterMm?: number | null;
  dialFeet?: string[] | null; // positions present; [] if feetless
  feetless?: boolean;
  // (dial date window position lives in `dateWindowPosition` below, shared)

  // ── HANDS ────────────────────────────────────────────────────────────────
  handBore?: HandSizes; // must match movement.handSizes
  handStyle?: string | null;

  // ── CRYSTAL ──────────────────────────────────────────────────────────────
  crystalDiameterMm?: number | null;
  crystalType?: CrystalType;
  material?: CrystalMaterial | null;

  // ── STEM / CROWN ─────────────────────────────────────────────────────────
  stemForCalibers?: string[];
  crownThread?: string | null;
  crownSizeMm?: number | null;
  tubeThread?: string | null;

  // ── Shared (dial + case apertures) ───────────────────────────────────────
  dateWindowPosition?: string | null;

  // ── Commerce / meta ──────────────────────────────────────────────────────
  priceUsdLow: number | null;
  priceUsdHigh: number | null;
  commonVendors: string[];
  images: ImageRef[];
  references: SourceRef[];
  notes: string;
  dataConfidence: DataConfidence;
}
