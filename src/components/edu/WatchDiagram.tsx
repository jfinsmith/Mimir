// Original, copyright-clean schematic watch faces that render recognizably
// differently per style — built to SHOW how the styles differ (Guardrail #2:
// no scraped product photos). Pure SVG, themed via Tailwind token utilities.

type Bezel = 'dive' | 'gmt' | 'tachy' | 'plain' | 'none';
type Crown = 'guard' | 'onion' | 'normal';
type Markers = 'numerals' | 'field' | 'sticks' | 'plots' | 'mixed';

interface StyleConfig {
  bezel: Bezel;
  crown: Crown;
  markers: Markers;
  triangle12?: boolean;
  subdials?: boolean;
  gmtHand?: boolean;
  dateAt3?: boolean;
  skeleton?: boolean;
}

const STYLES: Record<string, StyleConfig> = {
  diver: {
    bezel: 'dive',
    crown: 'guard',
    markers: 'plots',
    triangle12: true,
    dateAt3: true,
  },
  dress: { bezel: 'none', crown: 'normal', markers: 'sticks' },
  pilot: {
    bezel: 'plain',
    crown: 'onion',
    markers: 'numerals',
    triangle12: true,
  },
  field: { bezel: 'plain', crown: 'normal', markers: 'field' },
  chronograph: {
    bezel: 'tachy',
    crown: 'normal',
    markers: 'mixed',
    subdials: true,
  },
  gmt: {
    bezel: 'gmt',
    crown: 'normal',
    markers: 'plots',
    gmtHand: true,
    dateAt3: true,
  },
  racing: { bezel: 'tachy', crown: 'normal', markers: 'mixed', subdials: true },
  skeleton: {
    bezel: 'plain',
    crown: 'normal',
    markers: 'sticks',
    skeleton: true,
  },
};

const C = 100; // centre
const polar = (deg: number, r: number) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [C + Math.cos(a) * r, C + Math.sin(a) * r] as const;
};

export function WatchDiagram({
  slug,
  className = '',
}: {
  slug: string;
  className?: string;
}) {
  const s = STYLES[slug] ?? STYLES.field!;
  const hours = Array.from({ length: 12 }, (_, i) => i * 30);

  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      role="img"
      aria-label={`${slug} watch diagram`}
    >
      {/* ── Crown (drawn behind the case at 3 o'clock) ── */}
      {s.crown === 'onion' ? (
        <circle
          cx="168"
          cy="100"
          r="11"
          className="fill-surface-2 stroke-border"
          strokeWidth="2"
        />
      ) : s.crown === 'guard' ? (
        <g className="fill-surface-2 stroke-border" strokeWidth="2">
          <rect x="158" y="86" width="8" height="9" rx="2" />
          <rect x="158" y="105" width="8" height="9" rx="2" />
          <rect x="160" y="94" width="12" height="12" rx="2" />
        </g>
      ) : (
        <rect
          x="160"
          y="93"
          width="11"
          height="14"
          rx="2"
          className="fill-surface-2 stroke-border"
          strokeWidth="2"
        />
      )}

      {/* ── Case + bezel ── */}
      <circle
        cx={C}
        cy={C}
        r="86"
        className="fill-surface-2 stroke-border"
        strokeWidth="2"
      />

      {s.bezel === 'dive' && (
        <g>
          <circle
            cx={C}
            cy={C}
            r="82"
            className="fill-surface stroke-brand/50"
            strokeWidth="2"
          />
          {Array.from({ length: 12 }, (_, i) => {
            const [x1, y1] = polar(i * 30, 82);
            const [x2, y2] = polar(i * 30, 73);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                className="stroke-brand/60"
                strokeWidth="2"
              />
            );
          })}
          {/* lume pip at 12 */}
          {(() => {
            const [x, y] = polar(0, 77);
            return <circle cx={x} cy={y} r="3.5" className="fill-brand" />;
          })()}
        </g>
      )}
      {s.bezel === 'gmt' && (
        <g>
          <path d="M100 18 A82 82 0 0 1 100 182 Z" className="fill-brand/15" />
          <path d="M100 18 A82 82 0 0 0 100 182 Z" className="fill-ink/10" />
          <circle
            cx={C}
            cy={C}
            r="82"
            className="fill-none stroke-border"
            strokeWidth="1.5"
          />
          {Array.from({ length: 24 }, (_, i) => {
            const [x1, y1] = polar(i * 15, 82);
            const [x2, y2] = polar(i * 15, 75);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                className="stroke-ink-muted/50"
                strokeWidth="1"
              />
            );
          })}
        </g>
      )}
      {s.bezel === 'tachy' && (
        <g>
          <circle
            cx={C}
            cy={C}
            r="82"
            className="fill-surface stroke-border"
            strokeWidth="1.5"
          />
          {Array.from({ length: 60 }, (_, i) => {
            const [x1, y1] = polar(i * 6, 82);
            const [x2, y2] = polar(i * 6, i % 5 === 0 ? 74 : 78);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                className="stroke-ink-muted/40"
                strokeWidth="1"
              />
            );
          })}
        </g>
      )}
      {(s.bezel === 'plain' || s.bezel === 'none') && (
        <circle
          cx={C}
          cy={C}
          r={s.bezel === 'plain' ? 80 : 82}
          className="fill-surface stroke-border"
          strokeWidth="1.5"
        />
      )}

      {/* ── Dial ── */}
      <circle cx={C} cy={C} r="66" className="fill-surface" />

      {/* Skeleton: show gears instead of a solid dial */}
      {s.skeleton && (
        <g className="stroke-brand/40 fill-none" strokeWidth="1.5">
          <circle cx="78" cy="78" r="20" />
          <circle cx="122" cy="120" r="16" />
          <circle cx="92" cy="128" r="11" />
          <circle cx={C} cy={C} r="5" className="fill-brand/30" />
        </g>
      )}

      {/* Hour markers */}
      {!s.skeleton &&
        hours.map((deg, i) => {
          const isTop = i === 0;
          if (s.triangle12 && isTop) {
            const [tx, ty] = polar(0, 56);
            return (
              <path
                key={i}
                d={`M${tx} ${ty - 6} l6 11 l-12 0 z`}
                className="fill-brand"
              />
            );
          }
          if (s.markers === 'numerals') {
            if (i % 3 !== 0) {
              const [x, y] = polar(deg, 52);
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="2"
                  className="fill-ink-muted"
                />
              );
            }
            const [x, y] = polar(deg, 50);
            return (
              <text
                key={i}
                x={x}
                y={y + 5}
                textAnchor="middle"
                className="fill-ink"
                style={{ fontSize: '15px', fontWeight: 700 }}
              >
                {i === 0 ? '12' : i / 3 === 1 ? '3' : i / 3 === 2 ? '6' : '9'}
              </text>
            );
          }
          if (s.markers === 'field') {
            const [x, y] = polar(deg, 50);
            const n = i === 0 ? 12 : i;
            return (
              <text
                key={i}
                x={x}
                y={y + 4}
                textAnchor="middle"
                className="fill-ink"
                style={{ fontSize: '11px', fontWeight: 600 }}
              >
                {n}
              </text>
            );
          }
          if (s.markers === 'plots') {
            const [x, y] = polar(deg, 56);
            return (
              <circle key={i} cx={x} cy={y} r="4" className="fill-ink/70" />
            );
          }
          // sticks / mixed
          const [x1, y1] = polar(deg, 60);
          const [x2, y2] = polar(
            deg,
            s.markers === 'mixed' && i % 3 === 0 ? 50 : 53,
          );
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              className="stroke-ink/70"
              strokeWidth={s.markers === 'sticks' ? 1.5 : 3}
            />
          );
        })}

      {/* Field watch inner 24h track */}
      {s.markers === 'field' &&
        [13, 15, 17, 19, 21, 23].map((n, i) => {
          const [x, y] = polar((n - 12) * 30, 34);
          return (
            <text
              key={i}
              x={x}
              y={y + 3}
              textAnchor="middle"
              className="fill-fit-mod"
              style={{ fontSize: '7px' }}
            >
              {n}
            </text>
          );
        })}

      {/* Chronograph / racing subdials */}
      {s.subdials &&
        [
          [C, 138],
          [70, 100],
          [130, 100],
        ].map(([cx, cy], i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r="15"
            className="fill-surface-2 stroke-ink-muted/40"
            strokeWidth="1.5"
          />
        ))}

      {/* Date window */}
      {s.dateAt3 && !s.subdials && (
        <g>
          <rect
            x="138"
            y="92"
            width="16"
            height="16"
            rx="1.5"
            className="fill-bg stroke-ink-muted/50"
            strokeWidth="1"
          />
          <text
            x="146"
            y="104"
            textAnchor="middle"
            className="fill-ink"
            style={{ fontSize: '9px' }}
          >
            31
          </text>
        </g>
      )}

      {/* ── Hands ── */}
      <line
        x1={C}
        y1={C}
        x2={C}
        y2="58"
        className="stroke-ink"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <line
        x1={C}
        y1={C}
        x2="142"
        y2="72"
        className="stroke-ink"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {s.gmtHand && (
        <line
          x1={C}
          y1={C}
          x2="64"
          y2="138"
          className="stroke-brand"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      )}
      <circle cx={C} cy={C} r="4" className="fill-ink" />
    </svg>
  );
}
