// Education helpers — category metadata + the "from our catalog" matcher that
// links each article back to live movements/parts. Pure (catalog injectable).

import type {
  Complication,
  EduArticle,
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
