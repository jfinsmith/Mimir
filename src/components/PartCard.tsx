import type { Part } from '@/types';
import type { FitVerdict } from '@/lib/fitment';
import { FitBadge } from './FitBadge';
import { VendorLinks } from './VendorLinks';
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

      <div className="mt-auto space-y-2 pt-1">
        <div className="text-xs text-ink-muted">
          {fmtPriceRange(p.priceUsdLow, p.priceUsdHigh)}
        </div>
        <VendorLinks item={p} max={5} compact />
      </div>
    </div>
  );
}
