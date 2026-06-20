import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Catalog } from './Catalog';

// Smoke test: renders the whole catalog tree (cards, filter panel, placeholders)
// under a router. Catches runtime crashes the type-checker can't.
function renderAt(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Catalog />
    </MemoryRouter>,
  );
}

describe('Catalog page', () => {
  it('renders all seeded movements by default', () => {
    renderAt();
    expect(screen.getByText(/25 of 25 movements/)).toBeInTheDocument();
    // caliber appears in both the card heading and the placeholder SVG label
    expect(screen.getAllByText('NH35').length).toBeGreaterThan(0);
  });

  it('honors URL filter state (?type=quartz)', () => {
    renderAt('/?type=quartz');
    // 5 quartz in the seed set (515, 515.24H, 715, 5030.D, VH31)
    expect(screen.getByText(/5 of 25 movements/)).toBeInTheDocument();
    expect(screen.getAllByText('515').length).toBeGreaterThan(0);
    expect(screen.queryAllByText('NH35')).toHaveLength(0);
  });
});
