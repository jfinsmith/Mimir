// Small presentational atoms shared across pages.
import type { Availability, CostTier, DataConfidence } from '@/types';
import { bandForTier } from '@/lib/cost';
import { AVAILABILITY_LABEL } from '@/lib/labels';

export function CostGlyphs({
  tier,
  showLabel = false,
}: {
  tier: CostTier | null;
  showLabel?: boolean;
}) {
  if (tier == null) {
    return (
      <span className="text-ink-muted" title="Price unknown">
        —{showLabel && <span className="ml-2">Unknown price</span>}
      </span>
    );
  }
  const band = bandForTier(tier);
  return (
    <span
      className="font-mono tracking-tight"
      title={`Tier ${tier} · ${band.label}`}
    >
      <span className="text-brand">{'$'.repeat(tier)}</span>
      <span className="text-ink-muted/40">{'⬚'.repeat(5 - tier)}</span>
      {showLabel && <span className="ml-2 text-ink-muted">{band.label}</span>}
    </span>
  );
}

const AVAIL_DOT: Record<Availability, string> = {
  common: 'bg-fit-direct',
  moderate: 'bg-fit-mod',
  scarce: 'bg-fit-incompatible',
  discontinued: 'bg-ink-muted',
};

export function AvailabilityDot({
  availability,
}: {
  availability: Availability;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-ink-muted">
      <span
        className={`h-2 w-2 rounded-full ${AVAIL_DOT[availability]}`}
        aria-hidden
      />
      {AVAILABILITY_LABEL[availability]}
    </span>
  );
}

/** A small "verify" flag for medium/low confidence specs. Nothing for 'high'. */
export function ConfidenceTag({
  level,
  className = '',
}: {
  level: DataConfidence;
  className?: string;
}) {
  if (level === 'high') return null;
  return (
    <span
      className={`rounded bg-fit-mod/15 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-fit-mod ${className}`}
      title={`${level} confidence — verify this spec before buying`}
    >
      verify
    </span>
  );
}

export function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-border bg-surface-2 px-2 py-0.5 text-xs text-ink-muted">
      {children}
    </span>
  );
}
