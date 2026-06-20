import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_REGION, isRegionId, type RegionId } from '@/data/marketplaces';

// The buy-link region (which marketplace hosts/locale to target) persists to
// localStorage and stays in sync across every mounted component.

const KEY = 'mimir.region.v1';
const EVENT = 'mimir-region-change';

function read(): RegionId {
  try {
    const raw = localStorage.getItem(KEY);
    return raw && isRegionId(raw) ? raw : DEFAULT_REGION;
  } catch {
    return DEFAULT_REGION;
  }
}

export function useRegion() {
  const [region, setRegionState] = useState<RegionId>(read);

  useEffect(() => {
    const sync = () => setRegionState(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const setRegion = useCallback((r: RegionId) => {
    localStorage.setItem(KEY, r);
    setRegionState(r);
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return { region, setRegion };
}
