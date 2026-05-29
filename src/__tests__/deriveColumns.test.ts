import { describe, it, expect } from 'vitest';
import type { TFile } from 'obsidian';
import type { Row } from '../types';
import { deriveColumns } from '../view/deriveColumns';

function row(frontmatter: Record<string, unknown>): Row {
  return { file: {} as TFile, frontmatter };
}

describe('deriveColumns', () => {
  it('returns [] for no rows', () => {
    expect(deriveColumns([])).toEqual([]);
  });

  it('derives one column per unique frontmatter key', () => {
    const cols = deriveColumns([row({ a: 1, b: 2 }), row({ b: 3, c: 4 })]);
    expect(cols.map(c => c.key).sort()).toEqual(['a', 'b', 'c']);
  });

  it('defaults columns to text type', () => {
    const cols = deriveColumns([row({ name: 'Alice' })]);
    expect(cols[0]!.type).toBe('text');
  });

  it('types a column as wikilink when every value is a wikilink', () => {
    const cols = deriveColumns([row({ ref: '[[Note A]]' }), row({ ref: '[[Note B|Alias]]' })]);
    expect(cols.find(c => c.key === 'ref')!.type).toBe('wikilink');
  });

  it('treats a wikilink column with blank values as wikilink', () => {
    const cols = deriveColumns([row({ ref: '[[Note A]]' }), row({ ref: '' }), row({})]);
    expect(cols.find(c => c.key === 'ref')!.type).toBe('wikilink');
  });

  it('keeps mixed columns as text', () => {
    const cols = deriveColumns([row({ ref: '[[Note A]]' }), row({ ref: 'plain text' })]);
    expect(cols.find(c => c.key === 'ref')!.type).toBe('text');
  });
});
