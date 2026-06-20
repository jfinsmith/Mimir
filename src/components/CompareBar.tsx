import { Link } from 'react-router-dom';
import type { Movement } from '@/types';

export function CompareBar({
  compare,
  movementsById,
  onRemove,
  onClear,
}: {
  compare: string[];
  movementsById: Record<string, Movement>;
  onRemove: (id: string) => void;
  onClear: () => void;
}) {
  if (compare.length === 0) return null;

  return (
    <div className="sticky bottom-0 z-20 border-t border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3">
        <span className="text-sm font-medium">Compare</span>
        {compare.map((id) => {
          const m = movementsById[id];
          return (
            <button
              key={id}
              type="button"
              onClick={() => onRemove(id)}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-2 px-2 py-0.5 font-mono text-xs hover:border-fit-incompatible hover:text-fit-incompatible"
              title="Remove from compare"
            >
              {m ? m.caliber : id}
              <span aria-hidden>×</span>
            </button>
          );
        })}
        <div className="ml-auto flex items-center gap-3">
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-ink-muted underline hover:text-ink"
          >
            Clear
          </button>
          <Link
            to={`compare?ids=${compare.join(',')}`}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              compare.length >= 2
                ? 'bg-brand text-brand-ink'
                : 'pointer-events-none bg-surface-2 text-ink-muted'
            }`}
          >
            Compare {compare.length}
          </Link>
        </div>
      </div>
    </div>
  );
}
