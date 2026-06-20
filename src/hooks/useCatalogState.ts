import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  filtersFromSearchParams,
  filtersToSearchParams,
  type FilterState,
} from '@/lib/filters';

type FilterUpdater = FilterState | ((prev: FilterState) => FilterState);

/** Catalog filter state lives entirely in the URL query string (shareable). */
export function useCatalogState() {
  const [params, setParams] = useSearchParams();

  const filters = useMemo(() => filtersFromSearchParams(params), [params]);

  const setFilters = useCallback(
    (updater: FilterUpdater) => {
      const prev = filtersFromSearchParams(params);
      const next = typeof updater === 'function' ? updater(prev) : updater;
      setParams(filtersToSearchParams(next));
    },
    [params, setParams],
  );

  const patch = useCallback(
    (partial: Partial<FilterState>) =>
      setFilters((prev) => ({ ...prev, ...partial })),
    [setFilters],
  );

  const reset = useCallback(
    () => setParams(new URLSearchParams()),
    [setParams],
  );

  return { filters, patch, reset };
}
