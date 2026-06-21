import { Link, useParams } from 'react-router-dom';
import { eduBySlug } from '@/data';
import { EDU_CATEGORY_LABEL } from '@/lib/education';
import { WatchDiagram } from '@/components/edu/WatchDiagram';
import { MovementDiagram } from '@/components/edu/MovementDiagram';
import { CatalogModule } from '@/components/edu/CatalogModule';
import { ExternalLink } from '@/components/atoms';

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function EduArticle() {
  const { slug = '' } = useParams();
  const a = eduBySlug[slug];

  if (!a) {
    return (
      <div className="py-16 text-center text-ink-muted">
        <p>
          Unknown topic <code className="text-ink">{slug}</code>.
        </p>
        <Link
          to="/education"
          className="mt-4 inline-block underline hover:text-ink"
        >
          ← Back to Education
        </Link>
      </div>
    );
  }

  const hero =
    a.category === 'style' ? (
      <WatchDiagram slug={a.slug} className="h-44 w-44" />
    ) : a.category === 'movement' ? (
      <MovementDiagram type={a.slug} className="w-full max-w-md" />
    ) : null;

  return (
    <article className="max-w-3xl space-y-8">
      <nav className="text-sm text-ink-muted">
        <Link to="/education" className="hover:text-ink">
          Education
        </Link>{' '}
        / <span className="text-ink">{a.title}</span>
      </nav>

      <header className="space-y-2">
        <span className="inline-block rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-ink-muted">
          {EDU_CATEGORY_LABEL[a.category]}
        </span>
        <h1 className="text-3xl font-bold">{a.title}</h1>
        <p className="text-lg text-ink-muted">{a.tagline}</p>
      </header>

      {/* Hero diagram + "how to spot it" */}
      <section className="grid items-center gap-6 rounded-card border border-border bg-surface p-5 md:grid-cols-[auto_1fr]">
        {hero && <div className="flex justify-center">{hero}</div>}
        <div>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink-muted">
            {a.category === 'origin' ? 'Hallmarks' : 'How to spot it'}
          </h2>
          <ul className="space-y-1.5 text-sm">
            {a.identifyingFeatures.map((f) => (
              <li key={f} className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* History */}
      <section>
        <h2 className="mb-2 text-lg font-semibold">Origins &amp; history</h2>
        <div className="space-y-3 text-sm leading-relaxed text-ink-muted">
          {a.history.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </section>

      {/* Popularity */}
      <section>
        <h2 className="mb-2 text-lg font-semibold">Popularity</h2>
        <p className="text-sm leading-relaxed text-ink-muted">{a.popularity}</p>
      </section>

      {/* Price tiers */}
      <section>
        <h2 className="mb-2 text-lg font-semibold">What it costs</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {(
            [
              ['Entry', a.priceTiers.entry, '$'],
              ['Mid-range', a.priceTiers.mid, '$$$'],
              ['High-end', a.priceTiers.highEnd, '$$$$$'],
            ] as const
          ).map(([label, body, glyph]) => (
            <div
              key={label}
              className="rounded-card border border-border bg-surface p-4"
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-semibold">{label}</span>
                <span className="font-mono text-brand">{glyph}</span>
              </div>
              <p className="text-xs leading-relaxed text-ink-muted">{body}</p>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-ink-muted">
          Approximate market ranges — they vary by brand, condition and region.
        </p>
      </section>

      {/* Iconic examples */}
      <section>
        <h2 className="mb-2 text-lg font-semibold">
          Iconic &amp; high-end examples
        </h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {a.iconicExamples.map((ex) => (
            <div
              key={ex.name}
              className="rounded-card border border-border bg-surface px-3 py-2"
            >
              <div className="text-sm font-semibold">{ex.name}</div>
              <div className="text-xs text-ink-muted">{ex.note}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Good to know */}
      {a.goodToKnow.length > 0 && (
        <section>
          <h2 className="mb-2 text-lg font-semibold">Good to know</h2>
          <ul className="space-y-1.5 text-sm text-ink-muted">
            {a.goodToKnow.map((g) => (
              <li key={g} className="flex gap-2">
                <span className="text-brand">◆</span>
                <span>{g}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* From the catalog */}
      <section>
        <h2 className="mb-1 text-lg font-semibold">From the MIMIR catalog</h2>
        <p className="mb-3 text-sm text-ink-muted">
          Real movements and parts in the catalog that fit this topic.
        </p>
        <CatalogModule article={a} />
      </section>

      {/* Sources */}
      {a.sources.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-ink-muted">Sources</h2>
          <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
            {a.sources.map((s) => (
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
