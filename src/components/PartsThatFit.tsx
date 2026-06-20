import { useMemo, useState } from 'react';
import type { Movement, Part } from '@/types';
import { parts as ALL_PARTS } from '@/data';
import {
  compareFitStatus,
  evaluateFit,
  FIT_STATUS_LABEL,
  type FitStatus,
  type FitVerdict,
} from '@/lib/fitment';
import { PART_CATEGORY_LABEL, PART_CATEGORY_ORDER } from '@/lib/labels';
import { PartCard } from './PartCard';

type Scored = { part: Part; verdict: FitVerdict };
type StatusFilter = FitStatus | 'all';

const FILTER_ORDER: StatusFilter[] = [
  'all',
  'direct',
  'with-spacer',
  'needs-modification',
  'check-clearance',
  'incompatible',
];

export function PartsThatFit({
  movement,
  parts = ALL_PARTS,
}: {
  movement: Movement;
  parts?: Part[];
}) {
  const [status, setStatus] = useState<StatusFilter>('all');

  const scored = useMemo<Scored[]>(
    () =>
      parts
        .map((part) => ({ part, verdict: evaluateFit(movement, part) }))
        .filter((s) => s.verdict.status !== 'unknown'),
    [movement, parts],
  );

  const counts = useMemo(() => {
    const m = new Map<StatusFilter, number>([['all', scored.length]]);
    for (const s of scored)
      m.set(s.verdict.status, (m.get(s.verdict.status) ?? 0) + 1);
    return m;
  }, [scored]);

  const visible = useMemo(
    () =>
      (status === 'all'
        ? scored
        : scored.filter((s) => s.verdict.status === status)
      ).sort((a, b) => compareFitStatus(a.verdict.status, b.verdict.status)),
    [scored, status],
  );

  const byCategory = useMemo(() => {
    const groups = new Map<string, Scored[]>();
    for (const s of visible) {
      const arr = groups.get(s.part.category) ?? [];
      arr.push(s);
      groups.set(s.part.category, arr);
    }
    return PART_CATEGORY_ORDER.filter((c) => groups.has(c)).map((c) => ({
      category: c,
      items: groups.get(c)!,
    }));
  }, [visible]);

  if (scored.length === 0) {
    return (
      <p className="text-sm text-ink-muted">
        No catalogued parts reference {movement.caliber} yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {FILTER_ORDER.filter((f) => (counts.get(f) ?? 0) > 0).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setStatus(f)}
            className={`rounded-full border px-2.5 py-1 text-xs ${
              status === f
                ? 'border-brand bg-brand/15 text-brand'
                : 'border-border text-ink-muted hover:text-ink'
            }`}
          >
            {f === 'all' ? 'All' : FIT_STATUS_LABEL[f]}{' '}
            <span className="opacity-60">{counts.get(f) ?? 0}</span>
          </button>
        ))}
      </div>

      {byCategory.map(({ category, items }) => (
        <div key={category}>
          <h3 className="mb-2 text-sm font-semibold text-ink-muted">
            {PART_CATEGORY_LABEL[category as Part['category']]}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {items.map(({ part, verdict }) => (
              <PartCard key={part.id} part={part} verdict={verdict} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
