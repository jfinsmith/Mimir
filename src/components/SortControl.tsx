import type { SortKey } from '@/lib/filters';

const OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'az', label: 'Caliber A→Z' },
  { value: 'cost-asc', label: 'Cost: low → high' },
  { value: 'cost-desc', label: 'Cost: high → low' },
  { value: 'diameter-asc', label: 'Diameter: small → large' },
  { value: 'diameter-desc', label: 'Diameter: large → small' },
  { value: 'height-asc', label: 'Thinnest first' },
  { value: 'height-desc', label: 'Thickest first' },
  { value: 'power-desc', label: 'Power reserve: high → low' },
  { value: 'beat-desc', label: 'Beat rate: high → low' },
  { value: 'availability', label: 'Availability' },
];

export function SortControl({
  value,
  onChange,
  hasSearch,
}: {
  value: SortKey;
  onChange: (v: SortKey) => void;
  hasSearch: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-ink-muted">
      Sort
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortKey)}
        className="rounded border border-border bg-surface px-2 py-1 text-ink"
      >
        {hasSearch && <option value="relevance">Best match</option>}
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
