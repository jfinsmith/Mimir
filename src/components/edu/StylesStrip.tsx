import { Link } from 'react-router-dom';
import { WatchDiagram } from './WatchDiagram';

const STYLE_ORDER = [
  'diver',
  'dress',
  'pilot',
  'field',
  'chronograph',
  'gmt',
  'racing',
  'skeleton',
] as const;

const LABEL: Record<string, string> = {
  diver: 'Diver',
  dress: 'Dress',
  pilot: 'Pilot',
  field: 'Field',
  chronograph: 'Chrono',
  gmt: 'GMT',
  racing: 'Racing',
  skeleton: 'Skeleton',
};

/** All eight style silhouettes side by side — see how they differ at a glance. */
export function StylesStrip() {
  return (
    <div className="mb-4 rounded-card border border-border bg-surface p-4">
      <h3 className="mb-3 text-sm font-semibold text-ink-muted">
        The styles at a glance
      </h3>
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
        {STYLE_ORDER.map((slug) => (
          <Link
            key={slug}
            to={`/education/${slug}`}
            className="group flex flex-col items-center gap-1"
            title={LABEL[slug]}
          >
            <WatchDiagram
              slug={slug}
              className="h-16 w-16 transition-transform group-hover:scale-110"
            />
            <span className="text-[11px] text-ink-muted group-hover:text-ink">
              {LABEL[slug]}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
