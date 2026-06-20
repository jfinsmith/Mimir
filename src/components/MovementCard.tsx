import { Link } from 'react-router-dom';
import type { Movement } from '@/types';
import { MovementPlaceholder } from './MovementPlaceholder';
import { AvailabilityDot, ConfidenceTag, CostGlyphs } from './atoms';
import {
  COMPLICATION_LABEL,
  TYPE_LABEL,
  displayComplications,
} from '@/lib/labels';

const dash = (n: number | null, suffix = ''): string =>
  n == null ? '—' : `${n}${suffix}`;

export function MovementCard({
  movement,
  compareChecked,
  compareDisabled,
  onToggleCompare,
}: {
  movement: Movement;
  compareChecked: boolean;
  compareDisabled: boolean;
  onToggleCompare: (id: string) => void;
}) {
  const m = movement;
  const comps = displayComplications(m.complications);
  const rate =
    m.beatRateVph != null
      ? `${m.beatRateVph.toLocaleString()} vph`
      : m.quartzFrequencyHz != null
        ? 'quartz'
        : '—';

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-card border border-border bg-surface transition-colors hover:border-brand/50">
      {/* Compare checkbox */}
      <label
        className="absolute right-2 top-2 z-10 flex cursor-pointer items-center gap-1 rounded bg-bg/70 px-1.5 py-1 text-[11px] text-ink-muted backdrop-blur"
        title={
          compareDisabled && !compareChecked
            ? 'Compare is full (max 4)'
            : 'Add to compare'
        }
      >
        <input
          type="checkbox"
          className="accent-brand"
          checked={compareChecked}
          disabled={compareDisabled && !compareChecked}
          onChange={() => onToggleCompare(m.id)}
        />
        compare
      </label>

      <Link to={`movement/${m.id}`} className="flex flex-1 flex-col">
        <div className="aspect-[5/3] w-full bg-bg/40 p-3">
          {m.images[0] ? (
            <img
              src={m.images[0].src}
              alt={m.images[0].alt}
              loading="lazy"
              className="h-full w-full object-contain"
            />
          ) : (
            <MovementPlaceholder movement={m} className="h-full w-full" />
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2 p-3">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="font-mono text-base font-bold leading-none">
              {m.caliber}
            </h3>
            <CostGlyphs tier={m.costTier} />
          </div>
          <p className="text-xs text-ink-muted">
            {m.brand} · {TYPE_LABEL[m.type]}
          </p>

          <div className="flex flex-wrap gap-1">
            {comps.slice(0, 4).map((c) => (
              <span
                key={c}
                className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] text-ink-muted"
              >
                {COMPLICATION_LABEL[c]}
              </span>
            ))}
            {comps.length > 4 && (
              <span className="px-1 text-[11px] text-ink-muted">
                +{comps.length - 4}
              </span>
            )}
          </div>

          <dl className="mt-auto grid grid-cols-3 gap-1 border-t border-border pt-2 text-center text-xs">
            <div>
              <dt className="text-ink-muted">Ø</dt>
              <dd>{dash(m.diameterMm, 'mm')}</dd>
            </div>
            <div>
              <dt className="text-ink-muted">Height</dt>
              <dd>{dash(m.heightMm, 'mm')}</dd>
            </div>
            <div>
              <dt className="text-ink-muted">Rate</dt>
              <dd className="truncate">{rate}</dd>
            </div>
          </dl>

          <div className="flex items-center justify-between">
            <AvailabilityDot availability={m.availability} />
            <ConfidenceTag level={m.dataConfidence} />
          </div>
        </div>
      </Link>
    </div>
  );
}
