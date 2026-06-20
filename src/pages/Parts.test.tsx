import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Parts } from './Parts';

function renderParts(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/parts" element={<Parts />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('Parts page', () => {
  it('browses all parts by default', () => {
    renderParts('/parts');
    expect(
      screen.getByText('SKX-style 42mm dive case (NH3x)'),
    ).toBeInTheDocument();
  });

  it('reverse-fits the catalog against a chosen movement', () => {
    renderParts('/parts?for=miyota-8215');
    expect(screen.getByText(/Parts vs/)).toBeInTheDocument();
    // The engine's verdicts surface in the UI: NH3x sword hands are
    // incompatible with the 8215 (minute bore 0.90 vs 1.00).
    expect(screen.getAllByText('Incompatible').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Direct fit').length).toBeGreaterThan(0);
  });

  it('filters parts by category', () => {
    renderParts('/parts?cat=hands');
    expect(
      screen.getByText('Sword hand set (NH3x, 1.50/0.90/0.21)'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('SKX-style 42mm dive case (NH3x)'),
    ).not.toBeInTheDocument();
  });
});
