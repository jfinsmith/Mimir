import { Link, useParams } from 'react-router-dom';
import { movementsById, familiesById } from '@/data';
import { MovementPlaceholder } from '@/components/MovementPlaceholder';
import { SpecSheet } from '@/components/SpecSheet';
import { PartsThatFit } from '@/components/PartsThatFit';
import { VendorLinks } from '@/components/VendorLinks';
import { AvailabilityDot, ConfidenceTag, CostGlyphs } from '@/components/atoms';
import { useCompare } from '@/hooks/useCompare';
import {
  COMPLICATION_LABEL,
  TYPE_LABEL,
  displayComplications,
} from '@/lib/labels';
import { fmtPriceRange } from '@/lib/format';

export function MovementDetail() {
  const { id = '' } = useParams();
  const m = movementsById[id];
  const { has, toggle, full } = useCompare();

  if (!m) {
    return (
      <div className="py-16 text-center text-ink-muted">
        <p>
          Unknown movement <code className="text-ink">{id}</code>.
        </p>
        <Link to="/" className="mt-4 inline-block underline hover:text-ink">
          ← Back to the catalog
        </Link>
      </div>
    );
  }

  const family = familiesById[m.family];
  const inCompare = has(m.id);

  return (
    <div className="space-y-6">
      <nav className="text-sm text-ink-muted">
        <Link to="/" className="hover:text-ink">
          Catalog
        </Link>{' '}
        / <span className="text-ink">{m.caliber}</span>
      </nav>

      <header className="grid gap-6 md:grid-cols-[260px_1fr]">
        <figure>
          <div className="aspect-square rounded-card border border-border bg-surface p-4">
            {m.images[0] ? (
              <img
                src={m.images[0].src}
                alt={m.images[0].alt}
                decoding="async"
                className="h-full w-full object-contain"
              />
            ) : (
              <MovementPlaceholder movement={m} className="h-full w-full" />
            )}
          </div>
          {m.images[0]?.credit && (
            <figcaption className="mt-1 text-[11px] text-ink-muted">
              {m.images[0].credit}
              {m.images[0].license ? ` · ${m.images[0].license}` : ''}
            </figcaption>
          )}
        </figure>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-mono text-3xl font-bold">{m.caliber}</h1>
            <CostGlyphs tier={m.costTier} showLabel />
            <ConfidenceTag level={m.dataConfidence} />
          </div>
          <p className="text-ink-muted">
            {m.brand} · {TYPE_LABEL[m.type]}
            {family && <> · {family.label}</>}
          </p>
          {m.aliases.length > 0 && (
            <p className="text-sm text-ink-muted">
              Also known as: {m.aliases.join(', ')}
            </p>
          )}
          {m.baseCaliber && (
            <p className="text-sm text-ink-muted">Based on: {m.baseCaliber}</p>
          )}

          <div className="flex flex-wrap gap-1.5">
            {displayComplications(m.complications).map((c) => (
              <span
                key={c}
                className="rounded-full bg-surface-2 px-2.5 py-1 text-xs"
              >
                {COMPLICATION_LABEL[c]}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-1">
            <AvailabilityDot availability={m.availability} />
            <span className="text-sm text-ink-muted">
              {fmtPriceRange(m.priceUsdLow, m.priceUsdHigh)}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="button"
              onClick={() => toggle(m.id)}
              disabled={full && !inCompare}
              className={`rounded-md px-3 py-2 text-sm font-medium ${
                inCompare
                  ? 'border border-brand bg-brand/15 text-brand'
                  : 'border border-border hover:border-brand/50 disabled:opacity-40'
              }`}
              title={full && !inCompare ? 'Compare is full (max 4)' : undefined}
            >
              {inCompare ? '✓ In compare' : 'Add to compare'}
            </button>
            <Link
              to={`/build?movement=${m.id}`}
              className="rounded-md bg-brand px-3 py-2 text-sm font-medium text-brand-ink"
            >
              Start a build
            </Link>
          </div>
        </div>
      </header>

      {m.dataConfidence !== 'high' && (
        <p className="rounded-card border border-fit-mod/40 bg-fit-mod/10 px-4 py-2 text-sm text-fit-mod">
          ⚠ This record is <strong>{m.dataConfidence}</strong> confidence — some
          specs are unverified. Confirm critical dimensions before buying.
        </p>
      )}

      <SpecSheet movement={m} />

      <section>
        <h2 className="mb-1 text-lg font-semibold">
          Parts that fit this movement
        </h2>
        <p className="mb-3 text-sm text-ink-muted">
          Computed by the fitment engine. Hover a badge for the full reasoning;
          filter by how cleanly each part fits.
        </p>
        <PartsThatFit movement={m} />
      </section>

      {m.notes && (
        <section>
          <h2 className="mb-2 text-lg font-semibold">Modding notes</h2>
          <p className="rounded-card border border-border bg-surface p-4 text-sm leading-relaxed text-ink-muted">
            {m.notes}
          </p>
        </section>
      )}

      <section>
        <h2 className="mb-1 text-lg font-semibold">Where to buy</h2>
        <p className="mb-3 text-sm text-ink-muted">
          Precise searches built from this caliber and its aliases. Cross-check
          the spec sheet against the listing before buying.
        </p>
        <VendorLinks item={m} />
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">References</h2>
        {m.references.length === 0 ? (
          <p className="text-sm text-ink-muted">No references recorded.</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {m.references.map((r) => (
              <li key={r.url}>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-brand underline hover:text-brand/80"
                >
                  {r.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
