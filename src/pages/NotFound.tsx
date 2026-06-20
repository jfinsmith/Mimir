import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="py-16 text-center">
      <p className="font-mono text-brand text-5xl font-bold">404</p>
      <p className="mt-3 text-ink-muted">That page isn&apos;t on the dial.</p>
      <Link
        to="/"
        className="mt-6 inline-block rounded-md bg-surface-2 px-4 py-2 text-sm hover:text-ink"
      >
        ← Back to the catalog
      </Link>
    </div>
  );
}
