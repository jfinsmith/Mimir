import { Link } from 'react-router-dom';
import type { Complication, EduArticle, MovementType } from '@/types';
import { eduMatches } from '@/lib/education';
import { emptyFilters, filtersToSearchParams } from '@/lib/filters';
import { PartCard } from '@/components/PartCard';
import { MovementPlaceholder } from '@/components/MovementPlaceholder';
import { TYPE_LABEL } from '@/lib/labels';

const STYLE_COMPLICATION: Record<string, string[]> = {
  chronograph: ['chronograph'],
  racing: ['chronograph'],
  gmt: ['gmt'],
  skeleton: ['skeleton'],
};

/** Deep-link to the catalog pre-filtered to an article's subject, where clean. */
function catalogHref(article: EduArticle): string | null {
  const base = emptyFilters();
  if (article.category === 'movement') {
    const p = filtersToSearchParams({
      ...base,
      types: [article.slug as MovementType],
    });
    return `/?${p.toString()}`;
  }
  const comps = STYLE_COMPLICATION[article.slug];
  if (comps) {
    const p = filtersToSearchParams({
      ...base,
      complications: comps as Complication[],
    });
    return `/?${p.toString()}`;
  }
  return null;
}

/** Live catalog items that exemplify the article's subject. */
export function CatalogModule({
  article,
  limit = 6,
}: {
  article: EduArticle;
  limit?: number;
}) {
  const { movements, parts } = eduMatches(article);
  const mv = movements.slice(0, limit);
  const pt = parts.slice(0, limit);
  const href = catalogHref(article);

  if (mv.length === 0 && pt.length === 0) {
    return (
      <p className="text-sm text-ink-muted">
        No catalogued examples of this yet —{' '}
        <Link to="/" className="text-brand underline">
          browse the full catalog
        </Link>
        .
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {mv.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-ink-muted">
            Movements in the catalog ({movements.length})
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {mv.map((m) => (
              <Link
                key={m.id}
                to={`/movement/${m.id}`}
                className="flex items-center gap-3 rounded-card border border-border bg-surface p-2 hover:border-brand/50"
              >
                <MovementPlaceholder
                  movement={m}
                  className="h-12 w-12 shrink-0"
                />
                <div className="min-w-0">
                  <div className="truncate font-mono text-sm font-semibold">
                    {m.caliber}
                  </div>
                  <div className="truncate text-xs text-ink-muted">
                    {m.brand} · {TYPE_LABEL[m.type]}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {href && movements.length > mv.length && (
            <p className="mt-2 text-xs text-ink-muted">
              <Link to={href} className="text-brand underline">
                See all {movements.length} in the catalog →
              </Link>
            </p>
          )}
        </div>
      )}

      {pt.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-ink-muted">
            Parts in the catalog ({parts.length})
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {pt.map((p) => (
              <PartCard key={p.id} part={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
