import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import Board from './Board';

describe('Board', () => {
  it('renders a 5x5 grid', () => {
    const { container } = render(<Board robot={null} onCellClick={() => {}} />);
    // 5x5 = 25 cells
    expect(container.querySelectorAll('div[role="gridcell"]').length).toBe(25);
  });

  it('calls onCellClick with correct coordinates', () => {
    const handleClick = vi.fn();
    const { container } = render(
      <Board robot={null} onCellClick={handleClick} />
    );
    // Click the top-left cell (x=0, y=4)
    container.querySelectorAll('div[role="gridcell"]')[0].click();
    expect(handleClick).toHaveBeenCalledWith(0, 4);
  });

  it('renders the robot at the correct cell', () => {
    const { container } = render(
      <Board robot={{ x: 2, y: 3, direction: 'EAST' }} onCellClick={() => {}} />
    );
    // Find the cell with the robot SVG
    const robotCells = Array.from(container.querySelectorAll('svg')).filter(
      (svg) => svg.classList.contains('robot-svg')
    );
    expect(robotCells.length).toBe(1);
  });
});
