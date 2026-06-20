import { useMemo, useState } from 'react';
import { movements, movementsById } from '@/data';
import { applyFilters, activeFilterCount } from '@/lib/filters';
import { buildMovementFuse, searchOrder } from '@/lib/search';
import { useCatalogState } from '@/hooks/useCatalogState';
import { useCompare } from '@/hooks/useCompare';
import { FilterPanel } from '@/components/FilterPanel';
import { ActiveFilterChips } from '@/components/ActiveFilterChips';
import { SortControl } from '@/components/SortControl';
import { MovementCard } from '@/components/MovementCard';
import { CompareBar } from '@/components/CompareBar';

export function Catalog() {
  const { filters, patch, reset } = useCatalogState();
  const {
    ids: compare,
    toggle: toggleCompare,
    clear: clearCompare,
    full: compareFull,
  } = useCompare();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fuse = useMemo(() => buildMovementFuse(movements), []);
  const order = useMemo(
    () => searchOrder(fuse, filters.search),
    [fuse, filters.search],
  );
  const results = useMemo(
    () => applyFilters(movements, filters, order),
    [filters, order],
  );

  const activeCount = activeFilterCount(filters);

  const panel = (
    <FilterPanel
      movements={movements}
      filters={filters}
      patch={patch}
      searchOrder={order}
    />
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Top bar: search + sort + count */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[14rem]">
          <input
            type="search"
            value={filters.search}
            onChange={(e) => patch({ search: e.target.value })}
            placeholder="Search caliber, brand, alias…"
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
            aria-label="Search movements"
          />
        </div>
        <SortControl
          value={filters.sort}
          onChange={(sort) => patch({ sort })}
          hasSearch={Boolean(order)}
        />
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="rounded-md border border-border px-3 py-2 text-sm lg:hidden"
        >
          Filters{activeCount ? ` (${activeCount})` : ''}
        </button>
      </div>

      <div className="flex gap-6">
        {/* Desktop filter rail */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-1">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold">
                Filters{activeCount ? ` · ${activeCount}` : ''}
              </h2>
              {activeCount > 0 && (
                <button
                  type="button"
                  onClick={reset}
                  className="text-xs text-ink-muted underline hover:text-ink"
                >
                  Reset
                </button>
              )}
            </div>
            {panel}
          </div>
        </aside>

        {/* Results */}
        <section className="min-w-0 flex-1">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-sm text-ink-muted">
              {results.length} of {movements.length} movements
            </p>
          </div>

          <ActiveFilterChips filters={filters} patch={patch} reset={reset} />

          {results.length === 0 ? (
            <div className="mt-10 rounded-card border border-dashed border-border p-10 text-center text-ink-muted">
              No movements match these filters.{' '}
              <button onClick={reset} className="underline hover:text-ink">
                Reset
              </button>
            </div>
          ) : (
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((m) => (
                <MovementCard
                  key={m.id}
                  movement={m}
                  compareChecked={compare.includes(m.id)}
                  compareDisabled={compareFull}
                  onToggleCompare={toggleCompare}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <CompareBar
        compare={compare}
        movementsById={movementsById}
        onRemove={toggleCompare}
        onClear={clearCompare}
      />

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />
          <div className="absolute left-0 top-0 h-full w-80 max-w-[85%] overflow-y-auto bg-surface p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">Filters</h2>
              <div className="flex items-center gap-3">
                {activeCount > 0 && (
                  <button
                    onClick={reset}
                    className="text-xs text-ink-muted underline"
                  >
                    Reset
                  </button>
                )}
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="rounded border border-border px-2 py-1 text-sm"
                >
                  Done
                </button>
              </div>
            </div>
            {panel}
          </div>
        </div>
      )}
    </div>
  );
}
