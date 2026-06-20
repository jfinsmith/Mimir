import { Suspense } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';

function navClass({ isActive }: { isActive: boolean }): string {
  return [
    'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
    isActive ? 'bg-surface-2 text-ink' : 'text-ink-muted hover:text-ink',
  ].join(' ');
}

const NAV = [
  { to: '/', label: 'Catalog', end: true },
  { to: '/parts', label: 'Parts', end: false },
  { to: '/build', label: 'Build', end: false },
  { to: '/learn', label: 'Learn', end: false },
  { to: '/about', label: 'About', end: false },
];

export function App() {
  return (
    <div className="flex min-h-full flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-brand focus:px-3 focus:py-2 focus:text-brand-ink"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-10 border-b border-border bg-surface/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <Link to="/" className="flex items-baseline gap-2">
            <span className="font-mono text-lg font-bold tracking-tight text-brand">
              MIMIR
            </span>
            <span className="hidden text-xs text-ink-muted sm:inline">
              movement catalog &amp; fitment engine
            </span>
          </Link>
          <nav className="ml-auto flex items-center gap-1">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end} className={navClass}>
                {n.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Suspense
          fallback={
            <p className="py-16 text-center text-ink-muted">Loading…</p>
          }
        >
          <Outlet />
        </Suspense>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-4 text-xs text-ink-muted">
          MIMIR — data is community-sourced and may contain errors.{' '}
          <strong className="text-ink">
            Always verify specs before you buy.
          </strong>
        </div>
      </footer>
    </div>
  );
}
