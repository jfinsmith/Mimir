// Fuzzy search over movements (Fuse.js). Returns an id order so the catalog can
// both restrict the result set and offer a "relevance" sort.

import Fuse from 'fuse.js';
import type { Movement } from '@/types';

export function buildMovementFuse(movements: Movement[]): Fuse<Movement> {
  return new Fuse(movements, {
    includeScore: true,
    threshold: 0.4,
    ignoreLocation: true,
    keys: [
      { name: 'caliber', weight: 3 },
      { name: 'aliases', weight: 2 },
      { name: 'brand', weight: 2 },
      { name: 'family', weight: 1 },
      { name: 'notes', weight: 0.5 },
    ],
  });
}

/** Ordered list of matching movement ids (best first), or null when query empty. */
export function searchOrder(
  fuse: Fuse<Movement>,
  query: string,
): string[] | null {
  const q = query.trim();
  if (!q) return null;
  return fuse.search(q).map((r) => r.item.id);
}
