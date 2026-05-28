import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CellEditor } from '../view/CellEditor';

describe('CellEditor', () => {
  it('renders input with initial value', () => {
    render(<CellEditor initial="hello" onCommit={vi.fn()} onCancel={vi.fn()} />);
    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('hello');
  });

  it('calls onCommit with current value on blur', () => {
    const onCommit = vi.fn();
    render(<CellEditor initial="hello" onCommit={onCommit} onCancel={vi.fn()} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'world' } });
    fireEvent.blur(input);
    expect(onCommit).toHaveBeenCalledWith('world');
  });

  it('calls onCommit on Enter key', () => {
    const onCommit = vi.fn();
    render(<CellEditor initial="" onCommit={onCommit} onCancel={vi.fn()} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'new' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onCommit).toHaveBeenCalledWith('new');
  });

  it('calls onCancel on Escape key', () => {
    const onCancel = vi.fn();
    render(<CellEditor initial="hello" onCommit={vi.fn()} onCancel={onCancel} />);
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Escape' });
    expect(onCancel).toHaveBeenCalled();
  });

  it('converts non-string initial value to string', () => {
    render(<CellEditor initial={42} onCommit={vi.fn()} onCancel={vi.fn()} />);
    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('42');
  });
});
