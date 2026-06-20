import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Catalog } from './Catalog';
import { movements } from '@/data';

// Counts derive from the data so these don't break as the catalog grows.
const TOTAL = movements.length;
const QUARTZ = movements.filter((m) => m.type === 'quartz').length;

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
    expect(
      screen.getByText(new RegExp(`${TOTAL} of ${TOTAL} movements`)),
    ).toBeInTheDocument();
    // caliber appears in both the card heading and the placeholder SVG label
    expect(screen.getAllByText('NH35').length).toBeGreaterThan(0);
  });

  it('honors URL filter state (?type=quartz)', () => {
    renderAt('/?type=quartz');
    expect(
      screen.getByText(new RegExp(`${QUARTZ} of ${TOTAL} movements`)),
    ).toBeInTheDocument();
    expect(screen.getAllByText('515').length).toBeGreaterThan(0);
    // No NH35 *card* (the diagram-key legend has an "NH35" example swatch, so
    // scope to the card heading rather than any text match).
    expect(screen.queryByRole('heading', { name: 'NH35' })).toBeNull();
  });
});
