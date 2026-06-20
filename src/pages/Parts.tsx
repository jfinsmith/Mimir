import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { movements, movementsById, parts } from '@/data';
import { PartCard } from '@/components/PartCard';
import { PartsThatFit } from '@/components/PartsThatFit';
import { PART_CATEGORY_LABEL, PART_CATEGORY_ORDER } from '@/lib/labels';

export function Parts() {
  const [params, setParams] = useSearchParams();
  const forId = params.get('for') ?? '';
  const cat = params.get('cat') ?? '';
  const q = params.get('q') ?? '';
  const movement = forId ? movementsById[forId] : undefined;

  const patch = (key: string, value: string) => {
    const p = new URLSearchParams(params);
    if (value) p.set(key, value);
    else p.delete(key);
    setParams(p);
  };

  const categoriesPresent = useMemo(
    () =>
      PART_CATEGORY_ORDER.filter((c) => parts.some((p) => p.category === c)),
    [],
  );

  const filtered = useMemo(
    () =>
      parts.filter((p) => {
        if (cat && p.category !== cat) return false;
        if (q) {
          const hay =
            `${p.name} ${p.brand ?? ''} ${p.notes} ${p.category}`.toLowerCase();
          if (!hay.includes(q.toLowerCase())) return false;
        }
        return true;
      }),
    [cat, q],
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Parts</h1>
        <p className="mt-1 text-ink-muted">
          Browse modding parts, or pick a movement to fit-check the whole
          catalog against it (reverse mode).
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-ink-muted">Fit-check against</span>
          <select
            value={forId}
            onChange={(e) => patch('for', e.target.value)}
            className="rounded border border-border bg-surface px-2 py-1.5 text-sm"
          >
            <option value="">— browse all parts —</option>
            {[...movements]
              .sort((a, b) => a.caliber.localeCompare(b.caliber))
              .map((m) => (
                <option key={m.id} value={m.id}>
                  {m.caliber} ({m.brand})
                </option>
              ))}
          </select>
        </label>

        <input
          type="search"
          value={q}
          onChange={(e) => patch('q', e.target.value)}
          placeholder="Search parts…"
          className="flex-1 min-w-[12rem] rounded-md border border-border bg-surface px-3 py-1.5 text-sm"
          aria-label="Search parts"
        />
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-1.5">
        <CategoryChip active={cat === ''} onClick={() => patch('cat', '')}>
          All
        </CategoryChip>
        {categoriesPresent.map((c) => (
          <CategoryChip
            key={c}
            active={cat === c}
            onClick={() => patch('cat', cat === c ? '' : c)}
          >
            {PART_CATEGORY_LABEL[c]}
          </CategoryChip>
        ))}
      </div>

      {movement ? (
        <section>
          <h2 className="mb-3 text-lg font-semibold">
            Parts vs <span className="font-mono">{movement.caliber}</span>
          </h2>
          <PartsThatFit movement={movement} parts={filtered} />
        </section>
      ) : filtered.length === 0 ? (
        <p className="text-ink-muted">No parts match.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <PartCard key={p.id} part={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs ${
        active
          ? 'border-brand bg-brand/15 text-brand'
          : 'border-border text-ink-muted hover:text-ink'
      }`}
    >
      {children}
    </button>
  );
}
