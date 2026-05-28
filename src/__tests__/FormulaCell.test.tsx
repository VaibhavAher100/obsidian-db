import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FormulaCell } from '../view/FormulaCell';

describe('FormulaCell', () => {
  it('renders #ERROR in obsidian-db-formula-error span when value is "#ERROR"', () => {
    render(<FormulaCell value="#ERROR" />);
    const el = screen.getByText('#ERROR');
    expect(el.className).toContain('obsidian-db-formula-error');
  });

  it('renders a normal value in obsidian-db-formula-cell span', () => {
    render(<FormulaCell value={123} />);
    const el = screen.getByText('123');
    expect(el.className).toContain('obsidian-db-formula-cell');
  });

  it('renders a string value in obsidian-db-formula-cell span', () => {
    render(<FormulaCell value="hello" />);
    const el = screen.getByText('hello');
    expect(el.className).toContain('obsidian-db-formula-cell');
  });

  it('renders empty string for null in obsidian-db-formula-cell span', () => {
    const { container } = render(<FormulaCell value={null} />);
    const span = container.querySelector('.obsidian-db-formula-cell');
    expect(span).not.toBeNull();
    expect(span?.textContent).toBe('');
  });

  it('renders empty string for undefined in obsidian-db-formula-cell span', () => {
    const { container } = render(<FormulaCell value={undefined} />);
    const span = container.querySelector('.obsidian-db-formula-cell');
    expect(span).not.toBeNull();
    expect(span?.textContent).toBe('');
  });

  it('does not render obsidian-db-formula-error class for a normal value', () => {
    const { container } = render(<FormulaCell value="ok" />);
    expect(container.querySelector('.obsidian-db-formula-error')).toBeNull();
  });
});
