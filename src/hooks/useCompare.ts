import { useCallback, useEffect, useState } from 'react';

// Compare selection persists to localStorage so it survives navigation between
// the catalog and movement detail pages. The Compare *view* is still shareable
// via a ?ids= URL param (snapshot), independent of this store.

export const MAX_COMPARE = 4;
const KEY = 'mimir.compare.v1';
const EVENT = 'mimir-compare-change';

function read(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === 'string')
      : [];
  } catch {
    return [];
  }
}

export function useCompare() {
  const [ids, setIds] = useState<string[]>(read);

  // Keep multiple hook instances (and other tabs) in sync.
  useEffect(() => {
    const sync = () => setIds(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const persist = useCallback((next: string[]) => {
    localStorage.setItem(KEY, JSON.stringify(next));
    setIds(next);
    window.dispatchEvent(new Event(EVENT));
  }, []);

  const toggle = useCallback(
    (id: string) => {
      const current = read();
      if (current.includes(id)) persist(current.filter((x) => x !== id));
      else if (current.length < MAX_COMPARE) persist([...current, id]);
    },
    [persist],
  );

  const clear = useCallback(() => persist([]), [persist]);
  const has = useCallback((id: string) => ids.includes(id), [ids]);

  return { ids, toggle, clear, has, full: ids.length >= MAX_COMPARE };
}
