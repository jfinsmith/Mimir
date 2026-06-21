import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { BrandStatus } from '@/types';
import { eduBrands } from '@/data';

const FLAGS: [RegExp, string][] = [
  [/switz/i, '🇨🇭'],
  [/german/i, '🇩🇪'],
  [/japan/i, '🇯🇵'],
  [/kingdom|britain|england|\buk\b/i, '🇬🇧'],
  [/france|french/i, '🇫🇷'],
  [/italy|italian/i, '🇮🇹'],
  [/united states|usa|america/i, '🇺🇸'],
];
function flagFor(country: string): string {
  return FLAGS.find(([re]) => re.test(country))?.[1] ?? '🌍';
}

type Filter = 'all' | BrandStatus;

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'established', label: 'Established' },
  { id: 'up-and-coming', label: 'Up & coming' },
];

export function Brands() {
  const [filter, setFilter] = useState<Filter>('all');
  const [q, setQ] = useState('');

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return eduBrands.filter(
      (b) =>
        (filter === 'all' || b.status === filter) &&
        (needle === '' ||
          b.name.toLowerCase().includes(needle) ||
          b.country.toLowerCase().includes(needle)),
    );
  }, [filter, q]);

  return (
    <div className="space-y-5">
      <nav className="text-sm text-ink-muted">
        <Link to="/education" className="hover:text-ink">
          Education
        </Link>{' '}
        / <span className="text-ink">Brands</span>
      </nav>

      <header className="max-w-2xl">
        <h1 className="text-2xl font-bold">Brand guide</h1>
        <p className="mt-2 text-ink-muted">
          {eduBrands.length} brands — the big houses and the rising
          independents. Each profile plots where the brand falls on cost, value,
          resale, heritage and more. Scales are approximate enthusiast
          consensus.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`rounded-full border px-3 py-1 text-xs ${
                filter === f.id
                  ? 'border-brand bg-brand/15 text-brand'
                  : 'border-border text-ink-muted hover:text-ink'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search brand or country…"
          className="ml-auto w-48 rounded-md border border-border bg-surface px-3 py-1.5 text-sm"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((b) => (
          <Link
            key={b.slug}
            to={`/education/brand/${b.slug}`}
            className="flex flex-col rounded-card border border-border bg-surface p-3 transition-colors hover:border-brand/50"
          >
            <div className="flex items-center gap-2">
              <span aria-hidden className="text-xl">
                {flagFor(b.country)}
              </span>
              <h3 className="text-sm font-semibold">{b.name}</h3>
              {b.status === 'up-and-coming' && (
                <span className="ml-auto rounded-full bg-brand/15 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-brand">
                  Rising
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-ink-muted">
              {b.country}
              {b.founded ? ` · est. ${b.founded}` : ''}
            </p>
            <p className="mt-1 line-clamp-2 text-xs text-ink-muted">
              {b.tagline}
            </p>
          </Link>
        ))}
      </div>

      {shown.length === 0 && (
        <p className="text-sm text-ink-muted">No brands match that search.</p>
      )}
    </div>
  );
}
