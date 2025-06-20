import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Robot from './Robot';

describe('Robot', () => {
  it('renders a robot with the robot-svg class', () => {
    const { container } = render(<Robot />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg.classList.contains('robot-svg')).toBe(true);
  });

  it('renders a robot facing east', () => {
    const { container } = render(<Robot direction="EAST" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg.style.transform).toBe('rotate(90deg)');
  });

  it('renders a robot facing north', () => {
    const { container } = render(<Robot direction="NORTH" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg.style.transform).toBe('rotate(0deg)');
  });

  it('renders a robot facing west', () => {
    const { container } = render(<Robot direction="WEST" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg.style.transform).toBe('rotate(-90deg)');
  });

  it('renders a robot facing south', () => {
    const { container } = render(<Robot direction="SOUTH" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg.style.transform).toBe('rotate(180deg)');
  });
});
