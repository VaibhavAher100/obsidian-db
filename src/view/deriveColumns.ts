import type { DataColumn, Row } from '../types';

const WIKILINK_RE = /^\[\[[^\]]+\]\]$/;

// A column is treated as wikilinks only when every non-empty string value in it
// is a wikilink (and at least one such value exists). Mixed columns stay 'text',
// so a stray "[[x]]" among numbers never hijacks the whole column.
function isWikilinkColumn(rows: Row[], key: string): boolean {
  let sawValue = false;
  for (const row of rows) {
    const v = row.frontmatter[key];
    if (typeof v === 'string' && v.trim() !== '') {
      sawValue = true;
      if (!WIKILINK_RE.test(v.trim())) return false;
    }
  }
  return sawValue;
}

export function deriveColumns(rows: Row[]): DataColumn[] {
  const keys = new Set<string>();
  for (const row of rows) {
    for (const key of Object.keys(row.frontmatter)) {
      keys.add(key);
    }
  }
  return [...keys].map(key => ({
    kind: 'data',
    key,
    label: key,
    type: isWikilinkColumn(rows, key) ? 'wikilink' : 'text',
  }));
}
