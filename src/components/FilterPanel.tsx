import { useMemo, type ReactNode } from 'react';
import {
  AVAILABILITIES,
  COMPLICATIONS,
  MOVEMENT_TYPES,
  type Availability,
  type Complication,
  type CostTier,
  type Movement,
  type MovementType,
} from '@/types';
import {
  facetCounts,
  type FilterDimension,
  type FilterState,
} from '@/lib/filters';
import {
  AVAILABILITY_LABEL,
  COMPLICATION_LABEL,
  TYPE_LABEL,
} from '@/lib/labels';
import { CostGlyphs } from './atoms';

type Patch = (partial: Partial<FilterState>) => void;

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

// ── Reusable group shells ────────────────────────────────────────────────────
function Group({
  title,
  badge,
  open = false,
  children,
}: {
  title: string;
  badge?: number;
  open?: boolean;
  children: ReactNode;
}) {
  return (
    <details open={open} className="border-b border-border py-2">
      <summary className="flex cursor-pointer list-none items-center justify-between px-1 py-1 text-sm font-medium">
        <span>{title}</span>
        {badge ? (
          <span className="rounded-full bg-brand/20 px-1.5 text-xs text-brand">
            {badge}
          </span>
        ) : null}
      </summary>
      <div className="mt-2 space-y-1 px-1">{children}</div>
    </details>
  );
}

interface Option {
  value: string;
  label: ReactNode;
  count: number;
}

function CheckGroup({
  options,
  selected,
  onToggle,
}: {
  options: Option[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <>
      {options.map((o) => {
        const checked = selected.includes(o.value);
        return (
          <label
            key={o.value}
            className={`flex cursor-pointer items-center justify-between gap-2 rounded px-1 py-0.5 text-sm hover:bg-surface-2 ${
              o.count === 0 && !checked ? 'opacity-40' : ''
            }`}
          >
            <span className="flex items-center gap-2">
              <input
                type="checkbox"
                className="accent-brand"
                checked={checked}
                disabled={o.count === 0 && !checked}
                onChange={() => onToggle(o.value)}
              />
              {o.label}
            </span>
            <span className="text-xs text-ink-muted">{o.count}</span>
          </label>
        );
      })}
    </>
  );
}

function NumberInput({
  value,
  placeholder,
  onChange,
}: {
  value: number | null;
  placeholder: string;
  onChange: (v: number | null) => void;
}) {
  return (
    <input
      type="number"
      inputMode="decimal"
      value={value ?? ''}
      placeholder={placeholder}
      onChange={(e) =>
        onChange(e.target.value === '' ? null : Number(e.target.value))
      }
      className="w-full rounded border border-border bg-bg px-2 py-1 text-sm"
    />
  );
}

function RangeGroup({
  min,
  max,
  onMin,
  onMax,
  unit,
  hint,
}: {
  min: number | null;
  max: number | null;
  onMin: (v: number | null) => void;
  onMax: (v: number | null) => void;
  unit?: string;
  hint?: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <NumberInput value={min} placeholder="min" onChange={onMin} />
        <span className="text-ink-muted">–</span>
        <NumberInput value={max} placeholder="max" onChange={onMax} />
        {unit && <span className="text-xs text-ink-muted">{unit}</span>}
      </div>
      {hint && <p className="mt-1 text-[11px] text-ink-muted">{hint}</p>}
    </div>
  );
}

function TriGroup({
  value,
  onChange,
}: {
  value: 'any' | 'yes' | 'no';
  onChange: (v: 'any' | 'yes' | 'no') => void;
}) {
  return (
    <div className="flex gap-1">
      {(['any', 'yes', 'no'] as const).map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={`flex-1 rounded border px-2 py-1 text-xs capitalize ${
            value === v
              ? 'border-brand bg-brand/15 text-brand'
              : 'border-border text-ink-muted hover:text-ink'
          }`}
        >
          {v}
        </button>
      ))}
    </div>
  );
}

// ── Panel ────────────────────────────────────────────────────────────────────
export function FilterPanel({
  movements,
  filters,
  patch,
  searchOrder,
}: {
  movements: Movement[];
  filters: FilterState;
  patch: Patch;
  searchOrder: string[] | null;
}) {
  const counts = useMemo(() => {
    const of = (dim: FilterDimension, valueOf: (m: Movement) => string[]) =>
      facetCounts(movements, filters, dim, valueOf, searchOrder);
    return {
      types: of('types', (m) => [m.type]),
      complications: of('complications', (m) => m.complications),
      beatRates: of('beatRates', (m) => [
        m.beatRateVph != null ? String(m.beatRateVph) : 'quartz',
      ]),
      dateWindows: of('dateWindows', (m) => [m.dateWindowPosition ?? 'none']),
      costTiers: of('costTiers', (m) => [String(m.costTier)]),
      availabilities: of('availabilities', (m) => [m.availability]),
      brands: of('brands', (m) => [m.brand]),
      countries: of('countries', (m) =>
        m.manufactureCountry ? [m.manufactureCountry] : [],
      ),
    };
  }, [movements, filters, searchOrder]);

  const present = useMemo(() => {
    const typeSet = new Set(movements.map((m) => m.type));
    const compSet = new Set(movements.flatMap((m) => m.complications));
    const beatSet = new Set(
      movements.map((m) =>
        m.beatRateVph != null ? String(m.beatRateVph) : 'quartz',
      ),
    );
    const dateSet = new Set(
      movements.map((m) => m.dateWindowPosition ?? 'none'),
    );
    const tierSet = new Set(movements.map((m) => m.costTier));
    const availSet = new Set(movements.map((m) => m.availability));
    const brandSet = new Set(movements.map((m) => m.brand));
    const countrySet = new Set(
      movements.flatMap((m) =>
        m.manufactureCountry ? [m.manufactureCountry] : [],
      ),
    );
    return {
      types: MOVEMENT_TYPES.filter((t) => typeSet.has(t)),
      complications: COMPLICATIONS.filter(
        (c) => compSet.has(c) && c !== 'hours' && c !== 'minutes',
      ),
      beats: [...beatSet].sort((a, b) =>
        a === 'quartz' ? 1 : b === 'quartz' ? -1 : Number(b) - Number(a),
      ),
      dates: [...dateSet].sort((a, b) =>
        a === 'none' ? 1 : b === 'none' ? -1 : Number(a) - Number(b),
      ),
      tiers: [...tierSet].sort((a, b) => a - b),
      availabilities: AVAILABILITIES.filter((a) => availSet.has(a)),
      brands: [...brandSet].sort(),
      countries: [...countrySet].sort(),
    };
  }, [movements]);

  const c = (map: Map<string, number>, k: string) => map.get(k) ?? 0;

  return (
    <div className="text-sm">
      <Group title="Type" badge={filters.types.length} open>
        <CheckGroup
          selected={filters.types}
          onToggle={(v) =>
            patch({ types: toggle(filters.types, v as MovementType) })
          }
          options={present.types.map((t) => ({
            value: t,
            label: TYPE_LABEL[t],
            count: c(counts.types, t),
          }))}
        />
      </Group>

      <Group title="Complications" badge={filters.complications.length} open>
        <CheckGroup
          selected={filters.complications}
          onToggle={(v) =>
            patch({
              complications: toggle(filters.complications, v as Complication),
            })
          }
          options={present.complications.map((cc) => ({
            value: cc,
            label: COMPLICATION_LABEL[cc],
            count: c(counts.complications, cc),
          }))}
        />
      </Group>

      <Group title="Cost tier" badge={filters.costTiers.length} open>
        <CheckGroup
          selected={filters.costTiers.map(String)}
          onToggle={(v) =>
            patch({
              costTiers: toggle(filters.costTiers, Number(v) as CostTier),
            })
          }
          options={present.tiers.map((t) => ({
            value: String(t),
            label: <CostGlyphs tier={t} />,
            count: c(counts.costTiers, String(t)),
          }))}
        />
      </Group>

      <Group
        title="Diameter (mm)"
        badge={
          filters.diameterMin != null || filters.diameterMax != null ? 1 : 0
        }
      >
        <RangeGroup
          min={filters.diameterMin}
          max={filters.diameterMax}
          onMin={(v) => patch({ diameterMin: v })}
          onMax={(v) => patch({ diameterMax: v })}
          unit="mm"
          hint="≈ ligne = mm ÷ 2.256"
        />
      </Group>

      <Group
        title="Height (mm)"
        badge={filters.heightMin != null || filters.heightMax != null ? 1 : 0}
      >
        <RangeGroup
          min={filters.heightMin}
          max={filters.heightMax}
          onMin={(v) => patch({ heightMin: v })}
          onMax={(v) => patch({ heightMax: v })}
          unit="mm"
        />
      </Group>

      <Group title="Beat rate" badge={filters.beatRates.length}>
        <CheckGroup
          selected={filters.beatRates}
          onToggle={(v) => patch({ beatRates: toggle(filters.beatRates, v) })}
          options={present.beats.map((b) => ({
            value: b,
            label:
              b === 'quartz' ? 'Quartz' : `${Number(b).toLocaleString()} vph`,
            count: c(counts.beatRates, b),
          }))}
        />
      </Group>

      <Group
        title="Power reserve (h)"
        badge={
          filters.powerReserveMin != null || filters.powerReserveMax != null
            ? 1
            : 0
        }
      >
        <RangeGroup
          min={filters.powerReserveMin}
          max={filters.powerReserveMax}
          onMin={(v) => patch({ powerReserveMin: v })}
          onMax={(v) => patch({ powerReserveMax: v })}
          unit="h"
        />
      </Group>

      <Group
        title="Jewels"
        badge={filters.jewelsMin != null || filters.jewelsMax != null ? 1 : 0}
      >
        <RangeGroup
          min={filters.jewelsMin}
          max={filters.jewelsMax}
          onMin={(v) => patch({ jewelsMin: v })}
          onMax={(v) => patch({ jewelsMax: v })}
        />
      </Group>

      <Group
        title="Complication count"
        badge={
          filters.compCountMin != null || filters.compCountMax != null ? 1 : 0
        }
      >
        <RangeGroup
          min={filters.compCountMin}
          max={filters.compCountMax}
          onMin={(v) => patch({ compCountMin: v })}
          onMax={(v) => patch({ compCountMax: v })}
        />
      </Group>

      <Group title="Hacking" badge={filters.hacking !== 'any' ? 1 : 0}>
        <TriGroup
          value={filters.hacking}
          onChange={(v) => patch({ hacking: v })}
        />
      </Group>

      <Group title="Hand-winding" badge={filters.handWinding !== 'any' ? 1 : 0}>
        <TriGroup
          value={filters.handWinding}
          onChange={(v) => patch({ handWinding: v })}
        />
      </Group>

      <Group title="Date window" badge={filters.dateWindows.length}>
        <CheckGroup
          selected={filters.dateWindows}
          onToggle={(v) =>
            patch({ dateWindows: toggle(filters.dateWindows, v) })
          }
          options={present.dates.map((d) => ({
            value: d,
            label: d === 'none' ? 'No date' : `At ${d}`,
            count: c(counts.dateWindows, d),
          }))}
        />
      </Group>

      <Group title="Availability" badge={filters.availabilities.length}>
        <CheckGroup
          selected={filters.availabilities}
          onToggle={(v) =>
            patch({
              availabilities: toggle(filters.availabilities, v as Availability),
            })
          }
          options={present.availabilities.map((a) => ({
            value: a,
            label: AVAILABILITY_LABEL[a],
            count: c(counts.availabilities, a),
          }))}
        />
      </Group>

      <Group title="Brand" badge={filters.brands.length}>
        <CheckGroup
          selected={filters.brands}
          onToggle={(v) => patch({ brands: toggle(filters.brands, v) })}
          options={present.brands.map((b) => ({
            value: b,
            label: b,
            count: c(counts.brands, b),
          }))}
        />
      </Group>

      <Group title="Country" badge={filters.countries.length}>
        <CheckGroup
          selected={filters.countries}
          onToggle={(v) => patch({ countries: toggle(filters.countries, v) })}
          options={present.countries.map((b) => ({
            value: b,
            label: b,
            count: c(counts.countries, b),
          }))}
        />
      </Group>

      <Group
        title="Hand sizes (mm)"
        badge={
          filters.handHour != null ||
          filters.handMinute != null ||
          filters.handSecond != null
            ? 1
            : 0
        }
      >
        <p className="mb-1 text-[11px] text-ink-muted">
          Already own a hand set? Match its bores (hour / minute / second).
        </p>
        <div className="grid grid-cols-3 gap-1">
          <NumberInput
            value={filters.handHour}
            placeholder="H"
            onChange={(v) => patch({ handHour: v })}
          />
          <NumberInput
            value={filters.handMinute}
            placeholder="M"
            onChange={(v) => patch({ handMinute: v })}
          />
          <NumberInput
            value={filters.handSecond}
            placeholder="S"
            onChange={(v) => patch({ handSecond: v })}
          />
        </div>
      </Group>
    </div>
  );
}
