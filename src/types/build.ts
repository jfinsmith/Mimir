import type { PartCategory } from './enums';

/**
 * A user's saved build (Build Planner, Phase 5). Persisted to localStorage.
 * We store only ids + a schema version so the dataset can evolve underneath
 * saved builds without breaking them.
 */
export interface Build {
  id: string;
  name: string;
  schemaVersion: 1;
  movementId: string | null;
  /** Selected part id per category slot (a build has at most one of each). */
  parts: Partial<Record<PartCategory, string>>;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  notes: string;
}
