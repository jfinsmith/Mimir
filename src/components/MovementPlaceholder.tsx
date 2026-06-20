// Deterministic schematic SVG placeholder for a movement (Guardrail #2: no
// scraped product images). The look is derived from the movement's own specs,
// so every caliber gets a stable, distinct "disc".

import type { Movement } from '@/types';
import { complicationCount } from '@/lib/filters';

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function MovementPlaceholder({
  movement,
  className = '',
}: {
  movement: Movement;
  className?: string;
}) {
  const seed = hash(movement.id);
  const isMechanical =
    movement.type === 'automatic' || movement.type === 'manual';
  const isAuto = movement.type === 'automatic';
  const rotorAngle = seed % 360;
  const balanceAngle = (seed >> 3) % 360;
  const comps = complicationCount(movement);

  const ticks = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    const r1 = 52;
    const r2 = i % 3 === 0 ? 44 : 48;
    return {
      x1: 60 + Math.cos(a) * r1,
      y1: 60 + Math.sin(a) * r1,
      x2: 60 + Math.cos(a) * r2,
      y2: 60 + Math.sin(a) * r2,
    };
  });

  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      role="img"
      aria-label={`${movement.caliber} schematic`}
    >
      <circle cx="60" cy="60" r="58" className="fill-surface-2" />
      <circle
        cx="60"
        cy="60"
        r="54"
        className="fill-surface stroke-border"
        strokeWidth="1"
      />

      {ticks.map((t, i) => (
        <line
          key={i}
          x1={t.x1}
          y1={t.y1}
          x2={t.x2}
          y2={t.y2}
          className="stroke-ink-muted/40"
          strokeWidth="1"
        />
      ))}

      {/* Automatic rotor sweep */}
      {isAuto && (
        <g transform={`rotate(${rotorAngle} 60 60)`}>
          <path
            d="M60 60 L60 8 A52 52 0 0 1 112 60 Z"
            className="fill-brand/10 stroke-brand/30"
            strokeWidth="1"
          />
        </g>
      )}

      {/* Balance wheel (mechanical) or crystal block (quartz) */}
      {isMechanical ? (
        <g transform={`rotate(${balanceAngle} 42 64)`}>
          <circle
            cx="42"
            cy="64"
            r="13"
            className="fill-none stroke-brand/70"
            strokeWidth="2"
          />
          <line
            x1="29"
            y1="64"
            x2="55"
            y2="64"
            className="stroke-brand/70"
            strokeWidth="1.5"
          />
          <line
            x1="42"
            y1="51"
            x2="42"
            y2="77"
            className="stroke-brand/70"
            strokeWidth="1.5"
          />
        </g>
      ) : (
        <rect
          x="30"
          y="52"
          width="24"
          height="16"
          rx="2"
          className="fill-none stroke-fit-spacer/70"
          strokeWidth="2"
        />
      )}

      {/* Complication pips (top-right) */}
      {Array.from({ length: Math.min(comps, 5) }, (_, i) => (
        <circle
          key={i}
          cx={74 + i * 7}
          cy="34"
          r="2.5"
          className="fill-brand/80"
        />
      ))}

      <text
        x="60"
        y="92"
        textAnchor="middle"
        className="fill-ink font-mono"
        style={{ fontSize: '13px', fontWeight: 700 }}
      >
        {movement.caliber}
      </text>
      {movement.diameterMm != null && (
        <text
          x="60"
          y="105"
          textAnchor="middle"
          className="fill-ink-muted"
          style={{ fontSize: '8px' }}
        >
          Ø {movement.diameterMm}mm
        </text>
      )}
    </svg>
  );
}
