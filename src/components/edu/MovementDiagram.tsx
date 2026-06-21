// Schematic cross-section of a movement type, showing its defining parts:
// power source → regulator (+ rotor / chrono module where relevant). Original
// SVG, themed via Tailwind token utilities. Educational, not to scale.

type Power = 'mainspring' | 'battery' | 'solar' | 'capacitor';
type Regulator = 'balance' | 'quartz' | 'glide';

interface MovConfig {
  power: Power;
  regulator: Regulator;
  rotor?: boolean;
  chrono?: boolean;
}

const MOV: Record<string, MovConfig> = {
  automatic: { power: 'mainspring', regulator: 'balance', rotor: true },
  manual: { power: 'mainspring', regulator: 'balance' },
  quartz: { power: 'battery', regulator: 'quartz' },
  mecaquartz: { power: 'battery', regulator: 'quartz', chrono: true },
  solar: { power: 'solar', regulator: 'quartz' },
  kinetic: { power: 'capacitor', regulator: 'quartz', rotor: true },
  'spring-drive': { power: 'mainspring', regulator: 'glide', rotor: true },
};

const POWER_LABEL: Record<Power, string> = {
  mainspring: 'Mainspring',
  battery: 'Battery',
  solar: 'Solar cell',
  capacitor: 'Capacitor',
};
const REG_LABEL: Record<Regulator, string> = {
  balance: 'Balance wheel',
  quartz: 'Quartz crystal',
  glide: 'Glide wheel',
};

function Labeled({
  x,
  label,
  children,
}: {
  x: number;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <g>
      {children}
      <text
        x={x}
        y="118"
        textAnchor="middle"
        className="fill-ink-muted"
        style={{ fontSize: '9px' }}
      >
        {label}
      </text>
    </g>
  );
}

export function MovementDiagram({
  type,
  className = '',
}: {
  type: string;
  className?: string;
}) {
  const m = MOV[type] ?? MOV.automatic!;

  return (
    <svg
      viewBox="0 0 240 140"
      className={className}
      role="img"
      aria-label={`${type} movement schematic`}
    >
      <rect
        x="6"
        y="20"
        width="228"
        height="80"
        rx="8"
        className="fill-surface stroke-border"
        strokeWidth="1.5"
      />

      {/* Power source (left) */}
      <Labeled x={48} label={POWER_LABEL[m.power]}>
        {m.power === 'mainspring' && (
          <g className="fill-none stroke-brand/70" strokeWidth="2">
            <circle cx="48" cy="60" r="22" className="fill-surface-2" />
            <path d="M48 60 q -10 -2 -8 -12 q 2 -12 16 -10 q 16 2 12 18 q -4 18 -22 14 q -20 -4 -16 -26" />
          </g>
        )}
        {m.power === 'battery' && (
          <g className="fill-surface-2 stroke-ink-muted" strokeWidth="2">
            <circle cx="48" cy="60" r="22" />
            <text
              x="48"
              y="65"
              textAnchor="middle"
              className="fill-fit-mod stroke-none"
              style={{ fontSize: '18px', fontWeight: 700 }}
            >
              +
            </text>
          </g>
        )}
        {m.power === 'solar' && (
          <g>
            <rect
              x="28"
              y="42"
              width="40"
              height="36"
              rx="2"
              className="fill-brand/15 stroke-brand/50"
              strokeWidth="1.5"
            />
            {[0, 1, 2].map((r) =>
              [0, 1, 2].map((c) => (
                <rect
                  key={`${r}-${c}`}
                  x={32 + c * 12}
                  y={46 + r * 11}
                  width="9"
                  height="8"
                  className="fill-brand/30"
                />
              )),
            )}
          </g>
        )}
        {m.power === 'capacitor' && (
          <g className="stroke-fit-mod" strokeWidth="2.5">
            <circle
              cx="48"
              cy="60"
              r="22"
              className="fill-surface-2 stroke-border"
              strokeWidth="1.5"
            />
            <line x1="40" y1="50" x2="40" y2="70" />
            <line x1="56" y1="50" x2="56" y2="70" />
            <line
              x1="33"
              y1="60"
              x2="40"
              y2="60"
              className="stroke-ink-muted"
              strokeWidth="1.5"
            />
            <line
              x1="56"
              y1="60"
              x2="63"
              y2="60"
              className="stroke-ink-muted"
              strokeWidth="1.5"
            />
          </g>
        )}
      </Labeled>

      {/* Arrow */}
      <g className="stroke-ink-muted/60" strokeWidth="1.5">
        <line x1="78" y1="60" x2="112" y2="60" />
        <path
          d="M112 60 l-6 -4 l0 8 z"
          className="fill-ink-muted/60 stroke-none"
        />
      </g>

      {/* Regulator (centre) */}
      <Labeled x={135} label={REG_LABEL[m.regulator]}>
        {m.regulator === 'balance' && (
          <g className="fill-none stroke-brand/70" strokeWidth="2">
            <circle cx="135" cy="60" r="22" className="fill-surface-2" />
            <circle cx="135" cy="60" r="14" />
            <line x1="121" y1="60" x2="149" y2="60" strokeWidth="1.5" />
            <line x1="135" y1="46" x2="135" y2="74" strokeWidth="1.5" />
          </g>
        )}
        {m.regulator === 'quartz' && (
          <g>
            <rect
              x="116"
              y="48"
              width="38"
              height="24"
              rx="2"
              className="fill-surface-2 stroke-fit-spacer/70"
              strokeWidth="2"
            />
            {/* tuning fork */}
            <g className="stroke-fit-spacer/80 fill-none" strokeWidth="1.5">
              <line x1="129" y1="70" x2="129" y2="54" />
              <line x1="141" y1="70" x2="141" y2="54" />
              <line x1="123" y1="70" x2="147" y2="70" />
            </g>
          </g>
        )}
        {m.regulator === 'glide' && (
          <g className="fill-none stroke-brand/70" strokeWidth="2">
            <circle cx="135" cy="60" r="22" className="fill-surface-2" />
            <circle cx="135" cy="60" r="8" className="fill-brand/20" />
          </g>
        )}
      </Labeled>

      {/* Arrow → hands */}
      <g className="stroke-ink-muted/60" strokeWidth="1.5">
        <line x1="165" y1="60" x2="198" y2="60" />
        <path
          d="M198 60 l-6 -4 l0 8 z"
          className="fill-ink-muted/60 stroke-none"
        />
      </g>
      <Labeled x={214} label="Hands">
        <g className="stroke-ink" strokeWidth="2.5" strokeLinecap="round">
          <circle cx="214" cy="60" r="3" className="fill-ink stroke-none" />
          <line x1="214" y1="60" x2="214" y2="44" />
          <line x1="214" y1="60" x2="226" y2="66" />
        </g>
      </Labeled>

      {/* Rotor arc (auto / kinetic / spring-drive) */}
      {m.rotor && (
        <g>
          <path
            d="M120 30 A40 40 0 0 1 175 26"
            className="fill-none stroke-brand/50"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <text
            x="150"
            y="16"
            textAnchor="middle"
            className="fill-brand"
            style={{ fontSize: '9px', fontWeight: 600 }}
          >
            ↻ rotor
          </text>
        </g>
      )}

      {/* Chrono module (mecaquartz) */}
      {m.chrono && (
        <g>
          <rect
            x="92"
            y="84"
            width="56"
            height="12"
            rx="3"
            className="fill-none stroke-fit-mod/70"
            strokeWidth="1.5"
            strokeDasharray="3 2"
          />
          <text
            x="120"
            y="135"
            textAnchor="middle"
            className="fill-fit-mod"
            style={{ fontSize: '8px' }}
          >
            + mechanical chrono module
          </text>
        </g>
      )}
    </svg>
  );
}
