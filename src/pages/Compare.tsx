import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { Movement } from '@/types';
import { movementsById } from '@/data';
import { useCompare } from '@/hooks/useCompare';
import {
  fmtBool,
  fmtHands,
  fmtList,
  fmtMm,
  fmtNum,
  fmtPriceRange,
  fmtRate,
} from '@/lib/format';
import {
  COMPLICATION_LABEL,
  TYPE_LABEL,
  displayComplications,
} from '@/lib/labels';

interface Row {
  label: string;
  get: (m: Movement) => string;
  fitment?: boolean;
}

const GROUPS: { title: string; rows: Row[] }[] = [
  {
    title: 'Fitment',
    rows: [
      {
        label: 'Hand sizes (H/M/S)',
        get: (m) => fmtHands(m.handSizes),
        fitment: true,
      },
      { label: 'Diameter', get: (m) => fmtMm(m.diameterMm), fitment: true },
      {
        label: 'Casing Ø',
        get: (m) => fmtMm(m.casingDiameterMm),
        fitment: true,
      },
      { label: 'Height', get: (m) => fmtMm(m.heightMm), fitment: true },
      {
        label: 'Height w/ hands',
        get: (m) => fmtMm(m.heightWithHandsMm),
        fitment: true,
      },
      { label: 'Dial feet', get: (m) => fmtList(m.dialFeet), fitment: true },
      {
        label: 'Crown positions',
        get: (m) => fmtList(m.crownPositions),
        fitment: true,
      },
      {
        label: 'Date window',
        get: (m) => m.dateWindowPosition ?? 'None',
        fitment: true,
      },
    ],
  },
  {
    title: 'Specs',
    rows: [
      { label: 'Type', get: (m) => TYPE_LABEL[m.type] },
      {
        label: 'Complications',
        get: (m) =>
          displayComplications(m.complications)
            .map((c) => COMPLICATION_LABEL[c])
            .join(', ') || 'None',
      },
      { label: 'Rate', get: (m) => fmtRate(m) },
      { label: 'Power reserve', get: (m) => fmtNum(m.powerReserveHours, ' h') },
      { label: 'Jewels', get: (m) => fmtNum(m.jewels) },
      { label: 'Hacking', get: (m) => fmtBool(m.hacking) },
      { label: 'Hand-winding', get: (m) => fmtBool(m.handWinding) },
    ],
  },
  {
    title: 'Commerce',
    rows: [
      { label: 'Cost tier', get: (m) => '$'.repeat(m.costTier) },
      {
        label: 'Price',
        get: (m) => fmtPriceRange(m.priceUsdLow, m.priceUsdHigh),
      },
      { label: 'Availability', get: (m) => m.availability },
    ],
  },
];

export function Compare() {
  const [params, setParams] = useSearchParams();
  const { ids: storeIds } = useCompare();
  const [diffOnly, setDiffOnly] = useState(false);

  const urlIds = params.get('ids');
  const ids = (urlIds ? urlIds.split(',') : storeIds).filter(
    (id) => movementsById[id],
  );
  const movements = ids.map((id) => movementsById[id] as Movement);

  const remove = (id: string) => {
    const next = ids.filter((x) => x !== id);
    setParams(next.length ? { ids: next.join(',') } : {});
  };

  if (movements.length < 2) {
    return (
      <div className="py-16 text-center text-ink-muted">
        <h1 className="mb-2 text-2xl font-bold text-ink">Compare movements</h1>
        <p>
          Pick at least two movements (the “compare” checkbox on each card).
        </p>
        <Link to="/" className="mt-4 inline-block underline hover:text-ink">
          ← Back to the catalog
        </Link>
      </div>
    );
  }

  const differing = (row: Row) =>
    new Set(movements.map((m) => row.get(m))).size > 1;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Compare ({movements.length})</h1>
        <label className="flex items-center gap-2 text-sm text-ink-muted">
          <input
            type="checkbox"
            className="accent-brand"
            checked={diffOnly}
            onChange={(e) => setDiffOnly(e.target.checked)}
          />
          Show only differences
        </label>
      </div>

      <div className="overflow-x-auto rounded-card border border-border">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-surface-2">
              <th className="sticky left-0 z-10 bg-surface-2 px-4 py-3 text-left font-medium" />
              {movements.map((m) => (
                <th
                  key={m.id}
                  className="min-w-[10rem] px-4 py-3 text-left align-top"
                >
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      to={`/movement/${m.id}`}
                      className="font-mono text-base font-bold hover:text-brand"
                    >
                      {m.caliber}
                    </Link>
                    <button
                      type="button"
                      onClick={() => remove(m.id)}
                      className="text-ink-muted hover:text-fit-incompatible"
                      title="Remove"
                      aria-label={`Remove ${m.caliber}`}
                    >
                      ×
                    </button>
                  </div>
                  <p className="mt-0.5 text-xs font-normal text-ink-muted">
                    {m.brand}
                  </p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {GROUPS.map((group) => {
              const rows = diffOnly ? group.rows.filter(differing) : group.rows;
              if (rows.length === 0) return null;
              return (
                <GroupRows
                  key={group.title}
                  title={group.title}
                  rows={rows}
                  movements={movements}
                  differing={differing}
                  colCount={movements.length + 1}
                />
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-ink-muted">
        Rows where the movements differ are highlighted. Fitment rows (hand
        sizes, diameter, feet, crown, date) decide whether parts swap between
        these calibers.
      </p>
    </div>
  );
}

function GroupRows({
  title,
  rows,
  movements,
  differing,
  colCount,
}: {
  title: string;
  rows: Row[];
  movements: Movement[];
  differing: (row: Row) => boolean;
  colCount: number;
}) {
  return (
    <>
      <tr>
        <td
          colSpan={colCount}
          className="bg-bg/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-ink-muted"
        >
          {title}
        </td>
      </tr>
      {rows.map((row) => {
        const diff = differing(row);
        return (
          <tr
            key={row.label}
            className={`border-t border-border ${diff ? 'bg-brand/[0.06]' : ''}`}
          >
            <th
              scope="row"
              className="sticky left-0 z-10 bg-surface px-4 py-2 text-left font-normal text-ink-muted"
            >
              <span className="flex items-center gap-1">
                {row.fitment && (
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-brand"
                    title="Fitment-critical"
                    aria-hidden
                  />
                )}
                {row.label}
              </span>
            </th>
            {movements.map((m) => (
              <td
                key={m.id}
                className={`px-4 py-2 ${diff ? 'font-medium text-ink' : 'text-ink-muted'}`}
              >
                {row.get(m)}
              </td>
            ))}
          </tr>
        );
      })}
    </>
  );
}
