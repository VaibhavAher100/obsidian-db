import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { App, TFile } from 'obsidian';
import type { Row, Column, IFormulaEngine } from '../types';
import { DatabaseTable } from '../view/DatabaseTable';

const mockApp = { workspace: { openLinkText: vi.fn() } } as unknown as App;

function row(frontmatter: Record<string, unknown>): Row {
  return { file: {} as TFile, frontmatter };
}

const noopEngine: IFormulaEngine = {
  evaluate: () => ({ kind: 'aggregate', value: '' }),
};

const textCol: Column = { kind: 'data', key: 'name', label: 'Name', type: 'text' };
const numCol: Column = { kind: 'data', key: 'price', label: 'Price', type: 'number' };
const wikilinkCol: Column = { kind: 'data', key: 'ref', label: 'Ref', type: 'wikilink' };
const sumCol: Column = { kind: 'formula', key: 'total', label: 'Total', formula: '=SUM(price)' };
const ifCol: Column = { kind: 'formula', key: 'result', label: 'Result', formula: '=IF(score>80,"pass","fail")' };

describe('DatabaseTable', () => {
  it('renders column headers', () => {
    render(<DatabaseTable rows={[]} columns={[textCol, numCol]} engine={noopEngine} app={mockApp} onUpdate={vi.fn()} />);
    expect(screen.getByText('Name')).toBeDefined();
    expect(screen.getByText('Price')).toBeDefined();
  });

  it('renders one row per Row', () => {
    const rows = [row({ name: 'Alice' }), row({ name: 'Bob' })];
    render(<DatabaseTable rows={rows} columns={[textCol]} engine={noopEngine} app={mockApp} onUpdate={vi.fn()} />);
    expect(screen.getByText('Alice')).toBeDefined();
    expect(screen.getByText('Bob')).toBeDefined();
  });

  it('DataColumn cell shows frontmatter value', () => {
    render(<DatabaseTable rows={[row({ price: 42 })]} columns={[numCol]} engine={noopEngine} app={mockApp} onUpdate={vi.fn()} />);
    expect(screen.getByText('42')).toBeDefined();
  });

  it('FormulaColumn aggregate cell shows same value in every row', () => {
    const engine: IFormulaEngine = {
      evaluate: () => ({ kind: 'aggregate', value: 6 }),
    };
    const rows = [row({ price: 1 }), row({ price: 2 }), row({ price: 3 })];
    render(<DatabaseTable rows={rows} columns={[sumCol]} engine={engine} app={mockApp} onUpdate={vi.fn()} />);
    expect(screen.getAllByText('6').length).toBe(3);
  });

  it('FormulaColumn per-row cell shows per-row values', () => {
    const engine: IFormulaEngine = {
      evaluate: () => ({ kind: 'per-row', values: ['pass', 'fail'] }),
    };
    const rows = [row({ score: 95 }), row({ score: 70 })];
    render(<DatabaseTable rows={rows} columns={[ifCol]} engine={engine} app={mockApp} onUpdate={vi.fn()} />);
    expect(screen.getByText('pass')).toBeDefined();
    expect(screen.getByText('fail')).toBeDefined();
  });

  it('clicking a DataColumn cell shows CellEditor', () => {
    const rows = [row({ name: 'Alice' })];
    render(<DatabaseTable rows={rows} columns={[textCol]} engine={noopEngine} app={mockApp} onUpdate={vi.fn()} />);
    fireEvent.click(screen.getByText('Alice'));
    expect(screen.getByRole('textbox')).toBeDefined();
  });

  it('committing CellEditor calls onUpdate with new value', async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    const rows = [row({ name: 'Alice' })];
    render(<DatabaseTable rows={rows} columns={[textCol]} engine={noopEngine} app={mockApp} onUpdate={onUpdate} />);
    fireEvent.click(screen.getByText('Alice'));
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Bob' } });
    fireEvent.blur(input);
    expect(onUpdate).toHaveBeenCalledWith(rows[0]!.file, 'name', 'Bob');
  });

  it('FormulaColumn cell is not clickable into edit mode', () => {
    const engine: IFormulaEngine = {
      evaluate: () => ({ kind: 'aggregate', value: 99 }),
    };
    render(<DatabaseTable rows={[row({ price: 99 })]} columns={[sumCol]} engine={engine} app={mockApp} onUpdate={vi.fn()} />);
    fireEvent.click(screen.getByText('99'));
    expect(screen.queryByRole('textbox')).toBeNull();
  });

  it('wikilink DataColumn renders WikilinkCell', () => {
    render(
      <DatabaseTable
        rows={[row({ ref: '[[MyNote]]' })]}
        columns={[wikilinkCol]}
        engine={noopEngine}
        app={mockApp}
        onUpdate={vi.fn()}
      />,
    );
    const el = screen.getByText('MyNote');
    expect(el.className).toContain('internal-link');
  });
});
