import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { MovementDetail } from './MovementDetail';
import { Compare } from './Compare';

describe('MovementDetail page', () => {
  it('renders the spec sheet for a known caliber', () => {
    render(
      <MemoryRouter initialEntries={['/movement/seiko-nh35']}>
        <Routes>
          <Route path="/movement/:id" element={<MovementDetail />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getAllByText('NH35').length).toBeGreaterThan(0);
    expect(screen.getByText('Physical')).toBeInTheDocument();
    expect(screen.getByText('Hand sizes (H/M/S)')).toBeInTheDocument();
    // NH35 hand bores rendered
    expect(screen.getByText('1.5 / 0.9 / 0.21 mm')).toBeInTheDocument();
  });

  it('handles an unknown id gracefully', () => {
    render(
      <MemoryRouter initialEntries={['/movement/nope']}>
        <Routes>
          <Route path="/movement/:id" element={<MovementDetail />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText(/Unknown movement/)).toBeInTheDocument();
  });
});

describe('Compare page', () => {
  it('compares movements from the ?ids= param', () => {
    render(
      <MemoryRouter initialEntries={['/compare?ids=seiko-nh35,miyota-8215']}>
        <Routes>
          <Route path="/compare" element={<Compare />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText(/Compare \(2\)/)).toBeInTheDocument();
    expect(screen.getByText('Hand sizes (H/M/S)')).toBeInTheDocument();
    // NH35 (0.90 min bore) vs 8215 (1.00 min bore) differ → both rendered
    expect(screen.getByText('1.5 / 0.9 / 0.21 mm')).toBeInTheDocument();
    expect(screen.getByText('1.5 / 1 / 0.17 mm')).toBeInTheDocument();
  });

  it('prompts when fewer than two are selected', () => {
    render(
      <MemoryRouter initialEntries={['/compare?ids=seiko-nh35']}>
        <Routes>
          <Route path="/compare" element={<Compare />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText(/at least two movements/)).toBeInTheDocument();
  });
});
