import { useCallback, useEffect, useState } from 'react';
import type { Build } from '@/types';

// Saved builds persist to localStorage (the brief explicitly allows + wants it
// here). Multiple builds; each keyed by id.

const KEY = 'mimir.builds.v1';
const EVENT = 'mimir-builds-change';

function read(): Build[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? (parsed as Build[]) : [];
  } catch {
    return [];
  }
}

export function useBuilds() {
  const [builds, setBuilds] = useState<Build[]>(read);

  useEffect(() => {
    const sync = () => setBuilds(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const persist = useCallback((next: Build[]) => {
    localStorage.setItem(KEY, JSON.stringify(next));
    setBuilds(next);
    window.dispatchEvent(new Event(EVENT));
  }, []);

  const save = useCallback(
    (build: Build) => {
      const current = read();
      const exists = current.some((b) => b.id === build.id);
      persist(
        exists
          ? current.map((b) => (b.id === build.id ? build : b))
          : [...current, build],
      );
    },
    [persist],
  );

  const remove = useCallback(
    (id: string) => persist(read().filter((b) => b.id !== id)),
    [persist],
  );

  return { builds, save, remove };
}
