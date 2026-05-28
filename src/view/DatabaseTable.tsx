import { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table';
import type { App, TFile } from 'obsidian';
import type { Row, Column, IFormulaEngine, ColumnResult } from '../types';
import { CellEditor } from './CellEditor';
import { FormulaCell } from './FormulaCell';
import { WikilinkCell } from './WikilinkCell';

type TableRow = Row & { _computed: Record<string, unknown> };

function buildComputedRows(rows: Row[], columns: Column[], engine: IFormulaEngine): TableRow[] {
  const results = new Map<string, ColumnResult>();
  for (const col of columns) {
    if (col.kind === 'formula') {
      results.set(col.key, engine.evaluate(col.formula, rows));
    }
  }
  return rows.map((row, i) => ({
    ...row,
    _computed: Object.fromEntries(
      [...results.entries()].map(([key, result]) => [
        key,
        result.kind === 'aggregate' ? result.value : (result.values[i] ?? null),
      ]),
    ),
  }));
}

interface Props {
  rows: Row[];
  columns: Column[];
  engine: IFormulaEngine;
  app: App;
  onUpdate: (file: TFile, key: string, value: unknown) => Promise<void>;
}

export function DatabaseTable({ rows, columns, engine, app, onUpdate }: Props) {
  const [editing, setEditing] = useState<{ rowIdx: number; colKey: string } | null>(null);

  const data = buildComputedRows(rows, columns, engine);

  const colDefs: ColumnDef<TableRow>[] = columns.map(col => ({
    id: col.key,
    header: col.label,
    accessorFn: (row: TableRow): unknown =>
      col.kind === 'formula' ? row._computed[col.key] : row.frontmatter[col.key],
    cell: ({ row: tableRow, getValue }: { row: { index: number; original: TableRow }; getValue: () => unknown }) => {
      const rowIdx = tableRow.index;
      const value = getValue();
      const originalRow = tableRow.original;

      if (editing?.rowIdx === rowIdx && editing.colKey === col.key) {
        const original = originalRow.frontmatter[col.key];
        return (
          <CellEditor
            initial={value}
            onCommit={v => {
              setEditing(null);
              const typed: unknown =
                typeof original === 'number' && Number.isFinite(Number(v))
                  ? Number(v)
                  : v;
              void onUpdate(originalRow.file, col.key, typed);
            }}
            onCancel={() => setEditing(null)}
          />
        );
      }

      if (col.kind === 'data' && col.type === 'wikilink' && typeof value === 'string') {
        return (
          <span onClick={() => setEditing({ rowIdx, colKey: col.key })}>
            <WikilinkCell value={value} app={app} />
          </span>
        );
      }

      if (col.kind === 'formula') {
        return <FormulaCell value={value} />;
      }

      return <span onClick={() => setEditing({ rowIdx, colKey: col.key })}>{String(value ?? '')}</span>;
    },
  }));

  const table = useReactTable({
    data,
    columns: colDefs,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <table className="obsidian-db-table">
      <thead>
        {table.getHeaderGroups().map(headerGroup => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map(header => (
              <th key={header.id}>
                {flexRender(header.column.columnDef.header, header.getContext())}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map(row => (
          <tr key={row.id}>
            {row.getVisibleCells().map(cell => (
              <td key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
