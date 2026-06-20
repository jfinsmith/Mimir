import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Build, Part, PartCategory } from '@/types';
import { movements, movementsById, parts, partsById } from '@/data';
import { evaluateFit } from '@/lib/fitment';
import {
  computeBuildChecks,
  missingPieces,
  rollupStatus,
  runningCost,
  type CheckStatus,
  type ResolvedBuild,
} from '@/lib/build';
import { useBuilds } from '@/hooks/useBuilds';
import { FitBadge } from '@/components/FitBadge';
import { PART_CATEGORY_LABEL } from '@/lib/labels';

const SLOTS: PartCategory[] = [
  'case',
  'dial',
  'hands',
  'crystal',
  'stem-crown',
  'spacer-ring',
];

const CHECK_STYLE: Record<CheckStatus, string> = {
  ok: 'text-fit-direct',
  warn: 'text-fit-mod',
  fail: 'text-fit-incompatible',
  unknown: 'text-fit-unknown',
};
const CHECK_ICON: Record<CheckStatus, string> = {
  ok: '●',
  warn: '▲',
  fail: '✕',
  unknown: '?',
};
const OVERALL_LABEL: Record<CheckStatus, string> = {
  ok: 'All checks pass',
  warn: 'Buildable with caveats',
  fail: 'Has blocking conflicts',
  unknown: 'Incomplete',
};

function newBuild(): Build {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name: '',
    schemaVersion: 1,
    movementId: null,
    parts: {},
    createdAt: now,
    updatedAt: now,
    notes: '',
  };
}

function downloadJson(build: Build) {
  const blob = new Blob([JSON.stringify(build, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mimir-build-${(build.name || 'untitled').replace(/\s+/g, '-').toLowerCase()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function BuildPlanner() {
  const [params, setParams] = useSearchParams();
  const { builds, save, remove } = useBuilds();
  const [draft, setDraft] = useState<Build>(newBuild);
  const loadedRef = useRef<string | null>(null);

  const editingId = params.get('id');
  const presetMovement = params.get('movement');

  // Load a saved build when ?id changes.
  useEffect(() => {
    if (editingId && loadedRef.current !== editingId) {
      const found = builds.find((b) => b.id === editingId);
      if (found) {
        setDraft(found);
        loadedRef.current = editingId;
      }
    }
  }, [editingId, builds]);

  // Preset a movement from ?movement= (e.g. "Add to Build" on a detail page).
  useEffect(() => {
    if (presetMovement && !editingId) {
      setDraft((d) =>
        d.movementId ? d : { ...d, movementId: presetMovement },
      );
    }
  }, [presetMovement, editingId]);

  const setMovement = (id: string) =>
    setDraft((d) => ({ ...d, movementId: id || null }));

  const setPart = (slot: PartCategory, id: string) =>
    setDraft((d) => {
      const next = { ...d.parts };
      if (id) next[slot] = id;
      else delete next[slot];
      return { ...d, parts: next };
    });

  const movement = draft.movementId
    ? (movementsById[draft.movementId] ?? null)
    : null;
  const resolvedParts: Partial<Record<PartCategory, Part>> = {};
  for (const slot of SLOTS) {
    const id = draft.parts[slot];
    const p = id ? partsById[id] : undefined;
    if (p) resolvedParts[slot] = p;
  }
  const resolved: ResolvedBuild = { movement, parts: resolvedParts };

  const checks = computeBuildChecks(resolved);
  const overall = checks.length ? rollupStatus(checks) : 'unknown';
  const cost = runningCost(resolved);
  const missing = missingPieces(resolved);

  const handleSave = () => {
    const b: Build = {
      ...draft,
      name: draft.name.trim() || 'Untitled build',
      updatedAt: new Date().toISOString(),
    };
    save(b);
    setDraft(b);
    loadedRef.current = b.id;
    setParams({ id: b.id });
  };

  const startNew = () => {
    const b = newBuild();
    setDraft(b);
    loadedRef.current = null;
    setParams({});
  };

  const loadBuild = (b: Build) => {
    setDraft(b);
    loadedRef.current = b.id;
    setParams({ id: b.id });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-bold">Build planner</h1>
          <button
            type="button"
            onClick={startNew}
            className="rounded-md border border-border px-3 py-1.5 text-sm hover:border-brand/50"
          >
            + New build
          </button>
        </div>

        {/* Name */}
        <input
          type="text"
          value={draft.name}
          onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
          placeholder="Build name (e.g. “NH35 sub homage”)"
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
        />

        {/* Movement + part slots */}
        <div className="space-y-3 rounded-card border border-border bg-surface p-4">
          <Slot label="Base movement">
            <select
              aria-label="Base movement"
              value={draft.movementId ?? ''}
              onChange={(e) => setMovement(e.target.value)}
              className="w-full rounded border border-border bg-bg px-2 py-1.5 text-sm"
            >
              <option value="">— pick a movement —</option>
              {[...movements]
                .sort((a, b) => a.caliber.localeCompare(b.caliber))
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.caliber} ({m.brand})
                  </option>
                ))}
            </select>
          </Slot>

          {SLOTS.map((slot) => {
            const opts = parts.filter((p) => p.category === slot);
            const selectedId = draft.parts[slot] ?? '';
            const part = selectedId ? partsById[selectedId] : undefined;
            const verdict =
              movement && part ? evaluateFit(movement, part) : undefined;
            return (
              <Slot key={slot} label={PART_CATEGORY_LABEL[slot]}>
                <select
                  aria-label={PART_CATEGORY_LABEL[slot]}
                  value={selectedId}
                  onChange={(e) => setPart(slot, e.target.value)}
                  className="w-full rounded border border-border bg-bg px-2 py-1.5 text-sm"
                >
                  <option value="">— none —</option>
                  {opts.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
                {verdict && (
                  <div className="mt-1">
                    <FitBadge verdict={verdict} showDetails />
                  </div>
                )}
              </Slot>
            );
          })}
        </div>

        {/* Notes */}
        <textarea
          value={draft.notes}
          onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
          placeholder="Build notes…"
          rows={3}
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
        />

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleSave}
            className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-ink"
          >
            Save build
          </button>
          <button
            type="button"
            onClick={() => downloadJson(draft)}
            className="rounded-md border border-border px-4 py-2 text-sm hover:border-brand/50"
          >
            Export JSON
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-md border border-border px-4 py-2 text-sm hover:border-brand/50"
          >
            Print
          </button>
        </div>
      </div>

      {/* Right rail: checklist + cost + missing + saved */}
      <aside className="space-y-4">
        <div className="rounded-card border border-border bg-surface p-4">
          <h2 className="mb-2 flex items-center justify-between text-sm font-semibold">
            Compatibility
            <span className={CHECK_STYLE[overall]}>
              {CHECK_ICON[overall]} {OVERALL_LABEL[overall]}
            </span>
          </h2>
          {checks.length === 0 ? (
            <p className="text-sm text-ink-muted">
              Add a movement and parts to see cross-checks.
            </p>
          ) : (
            <ul className="space-y-2 text-sm">
              {checks.map((c) => (
                <li key={c.id}>
                  <div className="flex items-center gap-2">
                    <span className={CHECK_STYLE[c.status]}>
                      {CHECK_ICON[c.status]}
                    </span>
                    <span className="font-medium">{c.label}</span>
                  </div>
                  {c.reasons.slice(0, 2).map((r) => (
                    <p key={r} className="pl-6 text-xs text-ink-muted">
                      {r}
                    </p>
                  ))}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-card border border-border bg-surface p-4">
          <h2 className="mb-2 text-sm font-semibold">Running cost</h2>
          {cost.lines.length === 0 ? (
            <p className="text-sm text-ink-muted">Nothing selected yet.</p>
          ) : (
            <>
              <ul className="space-y-1 text-sm">
                {cost.lines.map((l, i) => (
                  <li key={i} className="flex justify-between gap-2">
                    <span className="truncate text-ink-muted">{l.label}</span>
                    <span>${l.usd.toFixed(0)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-2 flex justify-between border-t border-border pt-2 text-sm font-semibold">
                <span>Total (midpoints)</span>
                <span>${cost.total.toFixed(0)}</span>
              </div>
            </>
          )}
        </div>

        {missing.length > 0 && (
          <div className="rounded-card border border-fit-mod/40 bg-fit-mod/10 p-4">
            <h2 className="mb-2 text-sm font-semibold text-fit-mod">
              Missing pieces
            </h2>
            <ul className="list-disc space-y-1 pl-4 text-sm text-fit-mod">
              {missing.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="rounded-card border border-border bg-surface p-4">
          <h2 className="mb-2 text-sm font-semibold">Saved builds</h2>
          {builds.length === 0 ? (
            <p className="text-sm text-ink-muted">No saved builds yet.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {builds.map((b) => (
                <li
                  key={b.id}
                  className="flex items-center justify-between gap-2"
                >
                  <button
                    type="button"
                    onClick={() => loadBuild(b)}
                    className={`truncate text-left hover:text-brand ${
                      b.id === draft.id ? 'font-semibold text-brand' : ''
                    }`}
                  >
                    {b.name || 'Untitled build'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      remove(b.id);
                      if (b.id === draft.id) startNew();
                    }}
                    className="text-ink-muted hover:text-fit-incompatible"
                    aria-label={`Delete ${b.name}`}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}

function Slot({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-muted">
        {label}
      </label>
      {children}
    </div>
  );
}
