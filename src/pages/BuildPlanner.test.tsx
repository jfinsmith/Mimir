import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { BuildPlanner } from './BuildPlanner';

function renderPlanner(path = '/build') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/build" element={<BuildPlanner />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('BuildPlanner page', () => {
  beforeEach(() => localStorage.clear());

  it('renders and asks for a movement first', () => {
    renderPlanner();
    expect(screen.getByText('Build planner')).toBeInTheDocument();
    expect(screen.getByText(/Pick a base movement/)).toBeInTheDocument();
  });

  it('presets the movement from ?movement= and lists missing pieces', () => {
    renderPlanner('/build?movement=seiko-nh35');
    expect(screen.getByText('Missing pieces')).toBeInTheDocument();
    // core slots flagged
    expect(screen.getByText(/No case selected/)).toBeInTheDocument();
  });

  it('runs a live cross-check when a part is selected', () => {
    renderPlanner('/build?movement=seiko-nh35');
    const selects = screen.getAllByRole('combobox');
    // selects[0] = movement, selects[1] = case slot
    fireEvent.change(selects[1]!, {
      target: { value: 'case-nh3x-skx-style' },
    });
    // NH3x case is a direct fit → badge appears, and the cross-check checklist
    // shows the movement↔case pairing.
    expect(screen.getAllByText('Direct fit').length).toBeGreaterThan(0);
    expect(screen.getByText(/NH35 ↔ Case/)).toBeInTheDocument();
  });
});
