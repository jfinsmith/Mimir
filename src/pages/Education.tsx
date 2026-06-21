import { Link } from 'react-router-dom';
import type { EduArticle } from '@/types';
import { eduArticles } from '@/data';
import { EDU_CATEGORIES } from '@/lib/education';
import { WatchDiagram } from '@/components/edu/WatchDiagram';
import { MovementDiagram } from '@/components/edu/MovementDiagram';
import { StylesStrip } from '@/components/edu/StylesStrip';
import { eduBrands } from '@/data';

const ORIGIN_FLAG: Record<string, string> = {
  swiss: '🇨🇭',
  german: '🇩🇪',
  japanese: '🇯🇵',
  american: '🇺🇸',
  chinese: '🇨🇳',
  russian: '🇷🇺',
};

function Thumb({ a }: { a: EduArticle }) {
  if (a.category === 'style')
    return <WatchDiagram slug={a.slug} className="h-16 w-16 shrink-0" />;
  if (a.category === 'movement')
    return <MovementDiagram type={a.slug} className="h-16 w-24 shrink-0" />;
  return (
    <span
      className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-border bg-surface-2 text-3xl"
      aria-hidden
    >
      {ORIGIN_FLAG[a.slug] ?? '🌍'}
    </span>
  );
}

export function Education() {
  return (
    <div className="space-y-10">
      <header className="max-w-2xl">
        <h1 className="text-2xl font-bold">Education</h1>
        <p className="mt-2 text-ink-muted">
          Everything enthusiasts love to know — how watches work, what makes
          each style its own thing, and the traditions behind them. Each page
          links straight to matching movements and parts in the MIMIR catalog.
        </p>
      </header>

      {EDU_CATEGORIES.map((cat) => {
        const arts = eduArticles.filter((a) => a.category === cat.id);
        if (arts.length === 0) return null;
        return (
          <section key={cat.id}>
            <h2 className="text-lg font-semibold">{cat.label}</h2>
            <p className="mb-3 max-w-2xl text-sm text-ink-muted">{cat.blurb}</p>
            {cat.id === 'style' && <StylesStrip />}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {arts.map((a) => (
                <Link
                  key={a.slug}
                  to={`/education/${a.slug}`}
                  className="flex items-center gap-3 rounded-card border border-border bg-surface p-3 transition-colors hover:border-brand/50"
                >
                  <Thumb a={a} />
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold leading-snug">
                      {a.title}
                    </h3>
                    <p className="mt-0.5 line-clamp-2 text-xs text-ink-muted">
                      {a.tagline}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}

      <section>
        <h2 className="text-lg font-semibold">Brands</h2>
        <p className="mb-3 max-w-2xl text-sm text-ink-muted">
          The big houses and the rising independents — each with a positioning
          profile (cost, value, resale, heritage and more) and the watches
          they’re known for.
        </p>
        <Link
          to="/education/brands"
          className="flex items-center justify-between gap-3 rounded-card border border-border bg-surface p-4 transition-colors hover:border-brand/50"
        >
          <div>
            <h3 className="text-sm font-semibold">Brand guide</h3>
            <p className="mt-0.5 text-xs text-ink-muted">
              {eduBrands.length} brands — 50 of the biggest names plus 10
              up-and-coming.
            </p>
          </div>
          <span aria-hidden className="text-2xl">
            🏷️
          </span>
        </Link>
      </section>

      <p className="text-sm text-ink-muted">
        Looking for the glossary and how MIMIR is built and sourced? See{' '}
        <Link to="/learn" className="text-brand underline">
          Learn
        </Link>
        .
      </p>
    </div>
  );
}
