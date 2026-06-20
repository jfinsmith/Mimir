import { REGIONS, type RegionId } from '@/data/marketplaces';
import { useRegion } from '@/hooks/useRegion';

/** Compact region picker for buy-links (header). Persists via useRegion. */
export function RegionSelect({ className = '' }: { className?: string }) {
  const { region, setRegion } = useRegion();
  return (
    <label
      className={`flex items-center gap-1 text-xs text-ink-muted ${className}`}
    >
      <span className="sr-only">Shopping region</span>
      <span aria-hidden title="Region for buy-links">
        🛒
      </span>
      <select
        aria-label="Shopping region for buy-links"
        value={region}
        onChange={(e) => setRegion(e.target.value as RegionId)}
        className="rounded border border-border bg-bg px-1.5 py-1 text-xs"
      >
        {REGIONS.map((r) => (
          <option key={r.id} value={r.id}>
            {r.label}
          </option>
        ))}
      </select>
    </label>
  );
}
