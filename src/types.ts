import '@total-typescript/ts-reset';
import type { TFile } from 'obsidian';

// Core domain types

export interface Row {
  file: TFile;
  frontmatter: Record<string, unknown>; // Zod-validated at the boundary
}

export interface DataColumn {
  kind: 'data';
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'wikilink';
}

export interface FormulaColumn {
  kind: 'formula';
  key: string;
  label: string;
  formula: string; // always starts with '='
}

export type Column = DataColumn | FormulaColumn;

export type Unsubscribe = () => void;

// FolderIndex - the deep module
// Callers only see this interface. Adapter details are hidden.

export interface FolderIndex {
  getRows(): Row[];
  onRowChange(cb: (rows: Row[]) => void): Unsubscribe;
  updateCell(file: TFile, key: string, value: unknown): Promise<void>;
  destroy(): void;
}

// FormulaEngine - injected as a dependency, never created internally by callers

// Aggregate: one value for the whole column (SUM, AVG, COUNT).
// Per-row: one value per row (IF, etc.) — values[i] matches rows[i].
export type ColumnResult =
  | { kind: 'aggregate'; value: unknown }
  | { kind: 'per-row'; values: unknown[] };

export interface IFormulaEngine {
  evaluate(formula: string, rows: Row[]): ColumnResult;
}

// DbConfig - shape of .obsidian-db.json
// Schema only, never row data.

export interface DbConfig {
  formulaColumns: FormulaColumn[];
  columnOrder?: string[];
  hiddenColumns?: string[];
  pinnedColumns?: string[];
}

// Plugin-wide settings (Obsidian settings tab)

export interface PluginSettings {
  useDataviewIfAvailable: boolean;
  defaultDateFormat: string;
}

export const DEFAULT_SETTINGS: PluginSettings = {
  useDataviewIfAvailable: true,
  defaultDateFormat: 'YYYY-MM-DD',
};
