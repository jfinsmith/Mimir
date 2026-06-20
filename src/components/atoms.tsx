// Small presentational atoms shared across pages.
import { useState } from 'react';
import type { Availability, CostTier, DataConfidence } from '@/types';
import { bandForTier } from '@/lib/cost';
import { AVAILABILITY_LABEL } from '@/lib/labels';

/** External link, always opened safely in a new tab with a screen-reader cue. */
export function ExternalLink({
  href,
  children,
  className = '',
  title,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={title}
      className={className}
    >
      {children}
      <span aria-hidden> ↗</span>
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to the legacy path */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

/** Copy-to-clipboard chip (e.g. an exact search string). Has a non-secure fallback. */
export function CopyChip({
  text,
  label = 'Copy search',
  className = '',
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        if (await copyText(text)) {
          setDone(true);
          window.setTimeout(() => setDone(false), 1500);
        }
      }}
      aria-live="polite"
      title={`Copy: ${text}`}
      className={`rounded border border-border px-1.5 py-0.5 text-[11px] text-ink-muted hover:border-brand/50 hover:text-ink ${className}`}
    >
      {done ? '✓ Copied' : label}
    </button>
  );
}

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
