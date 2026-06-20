import type { Movement, Part, PartCategory } from '@/types';
import {
  buildBuyLinks,
  buildQuery,
  discriminatorChecklist,
} from '@/lib/buyLinks';
import { useRegion } from '@/hooks/useRegion';
import { CopyChip, ExternalLink } from './atoms';

/**
 * A compact multi-retailer "where to buy / find this" row built purely from the
 * item's data + the chosen region. No inventory, no prices, no tracking — every
 * link is a search the user could have typed.
 */
export function VendorLinks({
  item,
  max,
  compact = false,
}: {
  item: Movement | Part;
  max?: number;
  compact?: boolean;
}) {
  const { region } = useRegion();
  const links = buildBuyLinks(item, region);
  const shown = max ? links.slice(0, max) : links;
  if (shown.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center gap-1.5">
        {shown.map((l) => (
          <ExternalLink
            key={l.id}
            href={l.url}
            title={l.note}
            className="inline-flex items-center rounded-full border border-border bg-surface-2 px-2.5 py-1 text-xs text-ink-muted hover:border-brand/50 hover:text-ink"
          >
            {l.label}
          </ExternalLink>
        ))}
        <CopyChip text={buildQuery(item)} label="Copy search" />
      </div>
      {!compact && (
        <p className="text-[11px] leading-snug text-ink-muted">
          MIMIR holds no inventory and earns nothing from these links — keyword
          searches surface near-matches, so confirm the exact spec before
          buying.
        </p>
      )}
    </div>
  );
}

/** The fields a buyer must confirm to get the CORRECT variant for this movement. */
export function DiscriminatorList({
  category,
  movement,
}: {
  category: PartCategory;
  movement: Movement | null;
}) {
  const items = discriminatorChecklist(category, movement);
  if (items.length === 0) return null;
  return (
    <ul className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-ink-muted">
      {items.map((d) => (
        <li key={d.label}>
          <span className="text-ink-muted">{d.label}:</span>{' '}
          {d.value == null ? (
            <span className="text-fit-mod">unknown — verify</span>
          ) : (
            <span className={d.caution ? 'text-fit-mod' : 'text-ink'}>
              {d.value}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
