import type { FilterState } from '@/lib/filters';
import { activeFilterCount } from '@/lib/filters';
import {
  AVAILABILITY_LABEL,
  COMPLICATION_LABEL,
  TYPE_LABEL,
} from '@/lib/labels';
import type { Availability, Complication, MovementType } from '@/types';

interface ChipDef {
  key: string;
  label: string;
  clear: () => void;
}

export function ActiveFilterChips({
  filters,
  patch,
  reset,
}: {
  filters: FilterState;
  patch: (partial: Partial<FilterState>) => void;
  reset: () => void;
}) {
  if (activeFilterCount(filters) === 0) return null;

  const chips: ChipDef[] = [];
  const without = <T,>(list: T[], v: T) => list.filter((x) => x !== v);

  if (filters.search)
    chips.push({
      key: 'q',
      label: `“${filters.search}”`,
      clear: () => patch({ search: '' }),
    });

  for (const t of filters.types)
    chips.push({
      key: `type-${t}`,
      label: TYPE_LABEL[t as MovementType],
      clear: () => patch({ types: without(filters.types, t) }),
    });

  for (const cmp of filters.complications)
    chips.push({
      key: `comp-${cmp}`,
      label: COMPLICATION_LABEL[cmp as Complication],
      clear: () =>
        patch({ complications: without(filters.complications, cmp) }),
    });

  for (const tier of filters.costTiers)
    chips.push({
      key: `tier-${tier}`,
      label: tier === 0 ? 'Unknown price' : `${'$'.repeat(tier)} tier`,
      clear: () => patch({ costTiers: without(filters.costTiers, tier) }),
    });

  for (const b of filters.beatRates)
    chips.push({
      key: `beat-${b}`,
      label: b === 'quartz' ? 'Quartz' : `${Number(b).toLocaleString()} vph`,
      clear: () => patch({ beatRates: without(filters.beatRates, b) }),
    });

  for (const d of filters.dateWindows)
    chips.push({
      key: `date-${d}`,
      label: d === 'none' ? 'No date' : `Date @ ${d}`,
      clear: () => patch({ dateWindows: without(filters.dateWindows, d) }),
    });

  for (const a of filters.availabilities)
    chips.push({
      key: `avail-${a}`,
      label: AVAILABILITY_LABEL[a as Availability],
      clear: () =>
        patch({ availabilities: without(filters.availabilities, a) }),
    });

  for (const b of filters.brands)
    chips.push({
      key: `brand-${b}`,
      label: b,
      clear: () => patch({ brands: without(filters.brands, b) }),
    });

  for (const ct of filters.countries)
    chips.push({
      key: `country-${ct}`,
      label: ct,
      clear: () => patch({ countries: without(filters.countries, ct) }),
    });

  const range = (
    key: string,
    label: string,
    a: number | null,
    b: number | null,
    clear: () => void,
  ) => {
    if (a == null && b == null) return;
    chips.push({
      key,
      label: `${label} ${a ?? '…'}–${b ?? '…'}`,
      clear,
    });
  };
  range('dia', 'Ø', filters.diameterMin, filters.diameterMax, () =>
    patch({ diameterMin: null, diameterMax: null }),
  );
  range('ht', 'Height', filters.heightMin, filters.heightMax, () =>
    patch({ heightMin: null, heightMax: null }),
  );
  range('pr', 'Reserve', filters.powerReserveMin, filters.powerReserveMax, () =>
    patch({ powerReserveMin: null, powerReserveMax: null }),
  );
  range('j', 'Jewels', filters.jewelsMin, filters.jewelsMax, () =>
    patch({ jewelsMin: null, jewelsMax: null }),
  );
  range('cc', 'Complications', filters.compCountMin, filters.compCountMax, () =>
    patch({ compCountMin: null, compCountMax: null }),
  );

  if (filters.hacking !== 'any')
    chips.push({
      key: 'hack',
      label: `Hacking: ${filters.hacking}`,
      clear: () => patch({ hacking: 'any' }),
    });
  if (filters.handWinding !== 'any')
    chips.push({
      key: 'wind',
      label: `Hand-wind: ${filters.handWinding}`,
      clear: () => patch({ handWinding: 'any' }),
    });
  if (
    filters.handHour != null ||
    filters.handMinute != null ||
    filters.handSecond != null
  )
    chips.push({
      key: 'hands',
      label: `Hands ${filters.handHour ?? '·'}/${filters.handMinute ?? '·'}/${filters.handSecond ?? '·'}`,
      clear: () =>
        patch({ handHour: null, handMinute: null, handSecond: null }),
    });

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((ch) => (
        <button
          key={ch.key}
          type="button"
          onClick={ch.clear}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-2 px-2 py-0.5 text-xs text-ink hover:border-fit-incompatible hover:text-fit-incompatible"
        >
          {ch.label}
          <span aria-hidden>×</span>
        </button>
      ))}
      <button
        type="button"
        onClick={reset}
        className="text-xs text-ink-muted underline hover:text-ink"
      >
        Reset all
      </button>
    </div>
  );
}
