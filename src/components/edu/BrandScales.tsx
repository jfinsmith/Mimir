import type { EduBrand } from '@/types';
import { BRAND_DIMENSIONS } from '@/lib/education';

/** Sliding scales showing where a brand falls on each positioning dimension. */
export function BrandScales({ brand }: { brand: EduBrand }) {
  return (
    <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
      {BRAND_DIMENSIONS.map((d) => {
        const s = brand.scales[d.id];
        const pct = Math.max(0, Math.min(100, (s.value / 10) * 100));
        return (
          <div key={d.id}>
            <div className="mb-1 flex items-baseline justify-between">
              <span className="text-sm font-medium text-ink">{d.label}</span>
              <span className="font-mono text-xs text-ink-muted">
                {s.value}/10
              </span>
            </div>
            <div className="relative h-2 rounded-full bg-surface-2">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-brand/30"
                style={{ width: `${pct}%` }}
              />
              <div
                className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-brand bg-bg"
                style={{ left: `${pct}%` }}
              />
            </div>
            <div className="mt-1 flex justify-between text-[10px] uppercase tracking-wide text-ink-muted">
              <span>{d.left}</span>
              <span>{d.right}</span>
            </div>
            {s.note && (
              <p className="mt-1 text-[11px] leading-snug text-ink-muted">
                {s.note}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
