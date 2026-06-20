import type { HandSizes } from './common';

/**
 * The fitment backbone. Many fitment facts (hand sizes, dial feet, footprint)
 * are shared across a family, so a case/dial/hands part can target a *family*
 * and inherit to every member. The data validator FAILS if a member's
 * handSizes contradicts `sharedHandSizes` — that mismatch is exactly the kind
 * of error that ruins a build.
 */
export interface MovementFamily {
  id: string; // 'seiko-nh3x'
  label: string; // 'Seiko NH-series (NH34/35/36/38)'
  members: string[]; // movement ids
  sharedHandSizes: HandSizes | null;
  sharedDialFeet: string[] | null;
  sharedDiameterMm: number | null;
  notes: string;
}
