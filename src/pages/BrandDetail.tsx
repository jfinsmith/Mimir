import { Link, useParams } from 'react-router-dom';
import { eduBrandsBySlug } from '@/data';
import { brandMovements } from '@/lib/education';
import { BrandScales } from '@/components/edu/BrandScales';
import { MovementPlaceholder } from '@/components/MovementPlaceholder';
import { ExternalLink } from '@/components/atoms';
import { TYPE_LABEL } from '@/lib/labels';

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function BrandDetail() {
  const { slug = '' } = useParams();
  const b = eduBrandsBySlug[slug];

  if (!b) {
    return (
      <div className="py-16 text-center text-ink-muted">
        <p>
          Unknown brand <code className="text-ink">{slug}</code>.
        </p>
        <Link
          to="/education/brands"
          className="mt-4 inline-block underline hover:text-ink"
        >
          ← Back to all brands
        </Link>
      </div>
    );
  }

  const catalog = brandMovements(b);

  return (
    <article className="max-w-3xl space-y-8">
      <nav className="text-sm text-ink-muted">
        <Link to="/education" className="hover:text-ink">
          Education
        </Link>{' '}
        /{' '}
        <Link to="/education/brands" className="hover:text-ink">
          Brands
        </Link>{' '}
        / <span className="text-ink">{b.name}</span>
      </nav>

      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-3xl font-bold">{b.name}</h1>
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide ${
              b.status === 'up-and-coming'
                ? 'bg-brand/15 text-brand'
                : 'bg-surface-2 text-ink-muted'
            }`}
          >
            {b.status === 'up-and-coming' ? 'Up & coming' : 'Established'}
          </span>
        </div>
        <p className="text-sm text-ink-muted">
          {b.country}
          {b.founded ? ` · est. ${b.founded}` : ''}
        </p>
        {b.parentGroup && (
          <p className="text-xs text-ink-muted">
            <span className="font-medium text-ink">Ownership:</span>{' '}
            {b.parentGroup}
          </p>
        )}
        <p className="text-lg text-ink-muted">{b.tagline}</p>
      </header>

      {/* Sliding scales */}
      <section className="rounded-card border border-border bg-surface p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">
          Where it sits
        </h2>
        <BrandScales brand={b} />
        <p className="mt-4 text-[11px] text-ink-muted">
          Ratings are approximate enthusiast consensus, not hard data — they’re
          a starting point for a conversation, not a verdict.
        </p>
      </section>

      {/* Positioning + price */}
      <section className="grid gap-4 sm:grid-cols-2">
        <div>
          <h2 className="mb-1 text-lg font-semibold">Positioning</h2>
          <p className="text-sm leading-relaxed text-ink-muted">
            {b.positioning}
          </p>
        </div>
        <div className="rounded-card border border-border bg-surface p-4">
          <h3 className="mb-2 text-sm font-semibold">Typical prices</h3>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between gap-2">
              <dt className="text-ink-muted">Entry</dt>
              <dd className="text-right">{b.priceBand.entry}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-ink-muted">Flagship</dt>
              <dd className="text-right">{b.priceBand.flagship}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* History */}
      <section>
        <h2 className="mb-2 text-lg font-semibold">History</h2>
        <div className="space-y-3 text-sm leading-relaxed text-ink-muted">
          {b.history.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </section>

      {/* Iconic models */}
      {b.iconicModels.length > 0 && (
        <section>
          <h2 className="mb-2 text-lg font-semibold">Iconic models</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {b.iconicModels.map((m) => (
              <div
                key={m.name}
                className="rounded-card border border-border bg-surface px-3 py-2"
              >
                <div className="text-sm font-semibold">{m.name}</div>
                <div className="text-xs text-ink-muted">{m.note}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Signature + movements */}
      <section className="space-y-3">
        {b.signature.length > 0 && (
          <div>
            <h2 className="mb-2 text-lg font-semibold">Known for</h2>
            <div className="flex flex-wrap gap-1.5">
              {b.signature.map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-surface-2 px-2.5 py-1 text-xs text-ink-muted"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
        {b.movementSourcing && (
          <p className="text-sm text-ink-muted">
            <span className="font-medium text-ink">Movements:</span>{' '}
            {b.movementSourcing}
          </p>
        )}
      </section>

      {/* Good to know */}
      {b.goodToKnow.length > 0 && (
        <section>
          <h2 className="mb-2 text-lg font-semibold">Good to know</h2>
          <ul className="space-y-1.5 text-sm text-ink-muted">
            {b.goodToKnow.map((g) => (
              <li key={g} className="flex gap-2">
                <span className="text-brand">◆</span>
                <span>{g}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Catalog matches */}
      {catalog.length > 0 && (
        <section>
          <h2 className="mb-1 text-lg font-semibold">
            {b.name} movements in the catalog
          </h2>
          <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {catalog.slice(0, 9).map((m) => (
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
                    {TYPE_LABEL[m.type]}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Sources */}
      {b.sources.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-ink-muted">Sources</h2>
          <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
            {b.sources.map((s) => (
              <li key={s}>
                <ExternalLink
                  href={s}
                  className="text-brand underline hover:text-brand/80"
                >
                  {hostOf(s)}
                </ExternalLink>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
