// Education helpers — category metadata + the "from our catalog" matcher that
// links each article back to live movements/parts. Pure (catalog injectable).

import type {
  BrandDimension,
  Complication,
  EduArticle,
  EduBrand,
  EduCategory,
  Movement,
  Part,
} from '@/types';
import { movements as ALL_MOVEMENTS, parts as ALL_PARTS } from '@/data';

export const EDU_CATEGORIES: {
  id: EduCategory;
  label: string;
  blurb: string;
}[] = [
  {
    id: 'style',
    label: 'Watch styles',
    blurb:
      'Divers, dress, pilot, field, chronographs, GMTs and more — what defines each one and how to tell them apart.',
  },
  {
    id: 'movement',
    label: 'Movements',
    blurb:
      'How a watch actually keeps time: automatic, manual, quartz, mecaquartz, solar and kinetic — and why it matters.',
  },
  {
    id: 'origin',
    label: 'Origins & houses',
    blurb:
      'The great watchmaking traditions — Swiss, German, Japanese, American, Chinese and Russian/Soviet.',
  },
];

export const EDU_CATEGORY_LABEL: Record<EduCategory, string> = {
  style: 'Style',
  movement: 'Movement',
  origin: 'Origin',
};

export interface EduMatches {
  movements: Movement[];
  parts: Part[];
}

// Country signal for origin articles (manufactureCountry is free-text).
const COUNTRY_RE: Record<string, RegExp> = {
  swiss: /switz/i,
  german: /german/i,
  japanese: /japan/i,
  american: /usa|united states|america/i,
  chinese: /china/i,
  russian: /russia|ussr|soviet/i,
};

// Complications that stand in for a style (the strongest in-catalog signal).
const STYLE_COMPLICATIONS: Record<string, Complication[]> = {
  chronograph: ['chronograph'],
  racing: ['chronograph'],
  gmt: ['gmt', 'world-time', '24-hour'],
  skeleton: ['skeleton', 'open-heart'],
};

// Case-name/notes keywords for case-defined styles.
const STYLE_CASE_RE: Record<string, RegExp> = {
  diver:
    /div|skx|srpd|turtle|\bsub\b|samurai|willard|62mas|seamaster|fathom|ploprof/i,
  dress: /dress|slim|sub-?40|\b38\s?mm\b|classic|coin.?edge/i,
  pilot: /pilot|flieger|marina|\bww\b/i,
  field: /field|explorer|khaki|military/i,
  racing: /racing|panda|tachy|carrera|daytona/i,
  skeleton: /skeleton|openwork|open.?heart|exhibition/i,
};

/** Catalog items that exemplify an article's subject. */
export function eduMatches(
  article: EduArticle,
  src?: { movements?: Movement[]; parts?: Part[] },
): EduMatches {
  const movements = src?.movements ?? ALL_MOVEMENTS;
  const parts = src?.parts ?? ALL_PARTS;

  if (article.category === 'movement') {
    return {
      movements: movements.filter((m) => m.type === article.slug),
      parts: [],
    };
  }

  if (article.category === 'origin') {
    const re = COUNTRY_RE[article.slug];
    return {
      movements: re
        ? movements.filter(
            (m) =>
              m.manufactureCountry != null && re.test(m.manufactureCountry),
          )
        : [],
      parts: [],
    };
  }

  // style
  const comps = STYLE_COMPLICATIONS[article.slug];
  const mv = comps
    ? movements.filter((m) => comps.some((c) => m.complications.includes(c)))
    : [];
  const re = STYLE_CASE_RE[article.slug];
  const pt = re
    ? parts.filter(
        (p) => p.category === 'case' && (re.test(p.name) || re.test(p.notes)),
      )
    : [];
  return { movements: mv, parts: pt };
}

// ── Brands ───────────────────────────────────────────────────────────────────

/** The sliding-scale dimensions on a brand page (left → right semantics). */
export const BRAND_DIMENSIONS: {
  id: BrandDimension;
  label: string;
  left: string;
  right: string;
}[] = [
  {
    id: 'cost',
    label: 'Price level',
    left: 'Affordable',
    right: 'Ultra-luxury',
  },
  { id: 'value', label: 'Value for money', left: 'Poor', right: 'Exceptional' },
  { id: 'resale', label: 'Resale value', left: 'Weak', right: 'Strong' },
  {
    id: 'depreciation',
    label: 'Depreciation',
    left: 'Holds value',
    right: 'Drops fast',
  },
  { id: 'popularity', label: 'Popularity', left: 'Niche', right: 'Iconic' },
  { id: 'heritage', label: 'Heritage', left: 'Young', right: 'Storied' },
  {
    id: 'finishing',
    label: 'Finishing',
    left: 'Industrial',
    right: 'Exquisite',
  },
  {
    id: 'innovation',
    label: 'Innovation',
    left: 'Traditional',
    right: 'Cutting-edge',
  },
];

/** Movements in the catalog made by this brand (sparse — only catalogued makers). */
export function brandMovements(brand: EduBrand, src?: Movement[]): Movement[] {
  const movements = src ?? ALL_MOVEMENTS;
  const base = (brand.name.split('(')[0] ?? '').trim().toLowerCase();
  if (base.length < 3) return [];
  return movements.filter((m) => m.brand.toLowerCase().includes(base));
}
