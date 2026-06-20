/* eslint-disable no-console */
// `npm run check:images` — reports which movements/parts still render the
// generated SVG placeholder (no license-clean image supplied). Phase 6 wires the
// manual ingestion pipeline; this just surfaces coverage. Never fetches anything.

import { movements } from '@/data/movements';
import { parts } from '@/data/parts';

const placeholderMovements = movements.filter((m) => m.images.length === 0);
const placeholderParts = parts.filter((p) => p.images.length === 0);

console.log('');
console.log('MIMIR image coverage');
console.log('─'.repeat(72));
console.log(
  `Movements: ${movements.length - placeholderMovements.length}/${movements.length} have an image (${placeholderMovements.length} on placeholder)`,
);
console.log(
  `Parts:     ${parts.length - placeholderParts.length}/${parts.length} have an image (${placeholderParts.length} on placeholder)`,
);

if (placeholderMovements.length > 0) {
  console.log('\nMovements on placeholder:');
  for (const m of placeholderMovements)
    console.log(`  · ${m.id} (${m.caliber})`);
}
if (placeholderParts.length > 0) {
  console.log('\nParts on placeholder:');
  for (const p of placeholderParts) console.log(`  · ${p.id}`);
}
console.log(
  '\nTo add an image: drop a license-clean file in public/movements/<id>/ and fill the\n`images: [{ src, alt, credit, sourceUrl, license }]` field. See README → Images.\n',
);
