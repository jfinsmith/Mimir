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
