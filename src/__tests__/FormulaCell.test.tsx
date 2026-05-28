import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FormulaCell } from '../view/FormulaCell';

describe('FormulaCell', () => {
  it('renders #ERROR in formula-error span when value is "#ERROR"', () => {
    render(<FormulaCell value="#ERROR" />);
    const el = screen.getByText('#ERROR');
    expect(el.className).toContain('formula-error');
  });

  it('renders #ERROR in formula-error span when isError is true', () => {
    render(<FormulaCell value={42} isError={true} />);
    const el = screen.getByText('#ERROR');
    expect(el.className).toContain('formula-error');
  });

  it('renders a normal value in formula-value span', () => {
    render(<FormulaCell value={123} />);
    const el = screen.getByText('123');
    expect(el.className).toContain('formula-value');
  });

  it('renders a string value in formula-value span', () => {
    render(<FormulaCell value="hello" />);
    const el = screen.getByText('hello');
    expect(el.className).toContain('formula-value');
  });

  it('renders empty string for null in formula-value span', () => {
    const { container } = render(<FormulaCell value={null} />);
    const span = container.querySelector('.formula-value');
    expect(span).not.toBeNull();
    expect(span?.textContent).toBe('');
  });

  it('renders empty string for undefined in formula-value span', () => {
    const { container } = render(<FormulaCell value={undefined} />);
    const span = container.querySelector('.formula-value');
    expect(span).not.toBeNull();
    expect(span?.textContent).toBe('');
  });

  it('does not render formula-error class for a normal value', () => {
    const { container } = render(<FormulaCell value="ok" />);
    expect(container.querySelector('.formula-error')).toBeNull();
  });
});
