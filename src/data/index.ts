// Barrel for the shipped, build-time dataset. The whole catalog is static —
// no backend, no fetch (Guardrail #4).
export { movements, movementsById } from './movements';
export { parts, partsById } from './parts';
export { families, familiesById } from './families';
export { glossary } from './glossary';
export type { GlossaryTerm } from './glossary';
export { eduArticles, eduBySlug } from './education';
