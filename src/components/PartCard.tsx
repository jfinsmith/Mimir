import type { Part } from '@/types';
import type { FitVerdict } from '@/lib/fitment';
import { FitBadge } from './FitBadge';
import { ConfidenceTag } from './atoms';
import { fmtPriceRange } from '@/lib/format';
import { PART_CATEGORY_LABEL } from '@/lib/labels';

export function PartCard({
  part,
  verdict,
}: {
  part: Part;
  verdict?: FitVerdict;
}) {
  const p = part;
  return (
    <div className="flex flex-col gap-2 rounded-card border border-border bg-surface p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="text-sm font-medium leading-snug">{p.name}</h4>
          <p className="mt-0.5 text-xs text-ink-muted">
            {PART_CATEGORY_LABEL[p.category]}
            {p.brand ? ` · ${p.brand}` : ''}
          </p>
        </div>
        <ConfidenceTag level={p.dataConfidence} />
      </div>

      {verdict && <FitBadge verdict={verdict} showDetails />}

      {p.notes && <p className="text-xs text-ink-muted">{p.notes}</p>}

      <div className="mt-auto flex items-center justify-between pt-1 text-xs text-ink-muted">
        <span>{fmtPriceRange(p.priceUsdLow, p.priceUsdHigh)}</span>
        {p.commonVendors.length > 0 && (
          <span className="truncate pl-2 text-right">
            {p.commonVendors.join(', ')}
          </span>
        )}
      </div>
    </div>
  );
}
