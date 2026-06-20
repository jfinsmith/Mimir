import type { ReactNode } from 'react';

// Explains the schematic glyphs drawn by <MovementPlaceholder>. The swatches
// mirror that component's actual shapes/colours so it reads as a true key.

function Swatch({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 36 36" className="h-9 w-9 shrink-0" aria-hidden>
      {children}
    </svg>
  );
}

interface Item {
  swatch: ReactNode;
  title: string;
  desc: string;
}

const ITEMS: Item[] = [
  {
    swatch: (
      <Swatch>
        <circle
          cx="18"
          cy="18"
          r="11"
          className="fill-none stroke-brand/70"
          strokeWidth="2"
        />
        <line
          x1="7"
          y1="18"
          x2="29"
          y2="18"
          className="stroke-brand/70"
          strokeWidth="1.5"
        />
        <line
          x1="18"
          y1="7"
          x2="18"
          y2="29"
          className="stroke-brand/70"
          strokeWidth="1.5"
        />
      </Swatch>
    ),
    title: 'Balance wheel',
    desc: 'Mechanical movement — automatic or manual wind.',
  },
  {
    swatch: (
      <Swatch>
        <rect
          x="8"
          y="12"
          width="20"
          height="12"
          rx="2"
          className="fill-none stroke-fit-spacer/70"
          strokeWidth="2"
        />
      </Swatch>
    ),
    title: 'Blue block',
    desc: 'Quartz oscillator — quartz / mecaquartz / solar (battery-regulated).',
  },
  {
    swatch: (
      <Swatch>
        <path
          d="M18 18 L18 4 A14 14 0 0 1 32 18 Z"
          className="fill-brand/10 stroke-brand/30"
          strokeWidth="1.5"
        />
      </Swatch>
    ),
    title: 'Gold arc',
    desc: 'Automatic winding rotor — shown on automatics only.',
  },
  {
    swatch: (
      <Swatch>
        <circle cx="9" cy="18" r="3" className="fill-brand/80" />
        <circle cx="18" cy="18" r="3" className="fill-brand/80" />
        <circle cx="27" cy="18" r="3" className="fill-brand/80" />
      </Swatch>
    ),
    title: 'Gold dots',
    desc: 'Complications — one per complication beyond hours/minutes (up to 5 shown).',
  },
  {
    swatch: (
      <Swatch>
        <text
          x="18"
          y="17"
          textAnchor="middle"
          className="fill-ink font-mono"
          style={{ fontSize: '9px', fontWeight: 700 }}
        >
          NH35
        </text>
        <text
          x="18"
          y="27"
          textAnchor="middle"
          className="fill-ink-muted"
          style={{ fontSize: '6px' }}
        >
          Ø 27.4
        </text>
      </Swatch>
    ),
    title: 'Centre label',
    desc: 'Caliber name, and below it the movement diameter (Ø) in mm.',
  },
];

export function PlaceholderLegend() {
  return (
    <div className="grid gap-x-5 gap-y-3 sm:grid-cols-2">
      {ITEMS.map((it) => (
        <div key={it.title} className="flex items-center gap-3">
          <span className="rounded-md bg-bg/40 p-1">{it.swatch}</span>
          <span className="text-sm">
            <span className="font-medium">{it.title}</span>
            <span className="text-ink-muted"> — {it.desc}</span>
          </span>
        </div>
      ))}
    </div>
  );
}
