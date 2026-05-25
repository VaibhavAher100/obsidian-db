import { z } from 'zod';

// Parsed at every external boundary.
// Never trust raw Obsidian data - always parse through one of these schemas.

// Frontmatter from MetadataCache - unknown values, string keys
export const RowFrontmatterSchema = z.record(z.string(), z.unknown());

// FormulaColumn definition stored in .obsidian-db.json
export const FormulaColumnSchema = z.object({
  kind: z.literal('formula'),
  key: z.string().min(1),
  label: z.string().min(1),
  formula: z.string().startsWith('='),
});

// Full .obsidian-db.json file
export const DbConfigSchema = z.object({
  formulaColumns: z.array(FormulaColumnSchema).default([]),
  columnOrder: z.array(z.string()).optional(),
  hiddenColumns: z.array(z.string()).optional(),
  pinnedColumns: z.array(z.string()).optional(),
});

// CSV row from papaparse - all values are initially strings
export const CsvRowSchema = z.record(z.string(), z.string());

// Plugin-wide settings stored by Obsidian
export const PluginSettingsSchema = z.object({
  useDataviewIfAvailable: z.boolean().default(true),
  defaultDateFormat: z.string().default('YYYY-MM-DD'),
});
