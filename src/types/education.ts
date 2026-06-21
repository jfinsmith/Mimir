// Educational content model (the "Education" section). Authored/curated prose +
// sourced facts, rendered by a single data-driven article page.

export type EduCategory = 'style' | 'movement' | 'origin';

export interface EduExample {
  name: string;
  note: string;
}

export interface EduPriceTiers {
  entry: string;
  mid: string;
  highEnd: string;
}

export interface EduArticle {
  slug: string;
  category: EduCategory;
  title: string;
  tagline: string;
  /** Origins / history, as paragraphs. */
  history: string[];
  popularity: string;
  priceTiers: EduPriceTiers;
  iconicExamples: EduExample[];
  /** Concrete visual/functional differentiators (also drive the diagrams). */
  identifyingFeatures: string[];
  goodToKnow: string[];
  sources: string[];
}

// ── Brands ───────────────────────────────────────────────────────────────────

export type BrandStatus = 'established' | 'up-and-coming';

/** The positioning dimensions plotted on the brand's sliding scales. */
export type BrandDimension =
  | 'cost'
  | 'value'
  | 'resale'
  | 'depreciation'
  | 'popularity'
  | 'heritage'
  | 'finishing'
  | 'innovation';

/** A 1–10 enthusiast-consensus rating with a short justification. */
export interface BrandScaleValue {
  value: number;
  note: string;
}

export interface EduBrand {
  slug: string;
  name: string;
  country: string;
  founded: number | null;
  status: BrandStatus;
  /** Owner / holding group, or "Independent". */
  parentGroup: string | null;
  tagline: string;
  history: string[];
  positioning: string;
  priceBand: { entry: string; flagship: string };
  scales: Record<BrandDimension, BrandScaleValue>;
  iconicModels: EduExample[];
  signature: string[];
  goodToKnow: string[];
  /** In-house vs sourced movements. */
  movementSourcing: string;
  sources: string[];
}
