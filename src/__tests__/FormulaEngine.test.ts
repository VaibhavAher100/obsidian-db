import { describe, it, expect } from 'vitest';
import type { TFile } from 'obsidian';
import type { Row } from '../types';
import { FormulaEngine } from '../formula/FormulaEngine';

function row(frontmatter: Record<string, unknown>): Row {
  return { file: {} as TFile, frontmatter };
}

describe('FormulaEngine', () => {
  const engine = new FormulaEngine();

  it('=SUM(price) sums all numeric values', () => {
    const rows = [row({ price: 1 }), row({ price: 2 }), row({ price: 3 })];
    expect(engine.evaluate('=SUM(price)', rows)).toEqual({ kind: 'aggregate', value: 6 });
  });

  it('=SUM(price) skips rows missing the key', () => {
    const rows = [row({ price: 1 }), row({}), row({ price: 2 })];
    expect(engine.evaluate('=SUM(price)', rows)).toEqual({ kind: 'aggregate', value: 3 });
  });

  it('=SUM(price) skips non-numeric values', () => {
    const rows = [row({ price: 1 }), row({ price: 'text' }), row({ price: 2 })];
    expect(engine.evaluate('=SUM(price)', rows)).toEqual({ kind: 'aggregate', value: 3 });
  });

  it('=COUNT(status) counts rows where key exists', () => {
    const rows = [row({ status: 'done' }), row({ status: 'pending' }), row({ status: 'todo' })];
    expect(engine.evaluate('=COUNT(status)', rows)).toEqual({ kind: 'aggregate', value: 3 });
  });

  it('=COUNT(status="done") counts rows matching value', () => {
    const rows = [row({ status: 'done' }), row({ status: 'done' }), row({ status: 'pending' })];
    expect(engine.evaluate('=COUNT(status="done")', rows)).toEqual({ kind: 'aggregate', value: 2 });
  });

  it('=AVG(rating) averages numeric values', () => {
    const rows = [row({ rating: 4 }), row({ rating: 5 }), row({ rating: 3 })];
    expect(engine.evaluate('=AVG(rating)', rows)).toEqual({ kind: 'aggregate', value: 4 });
  });

  it('=AVG(rating) returns 0 for empty rows', () => {
    expect(engine.evaluate('=AVG(rating)', [])).toEqual({ kind: 'aggregate', value: 0 });
  });

  it('=IF(score>80,"pass","fail") evaluates per row', () => {
    const rows = [row({ score: 95 }), row({ score: 72 }), row({ score: 88 })];
    expect(engine.evaluate('=IF(score>80,"pass","fail")', rows)).toEqual({
      kind: 'per-row',
      values: ['pass', 'fail', 'pass'],
    });
  });

  it('=IF(score>80,"pass","fail") returns fail for all low scores', () => {
    const rows = [row({ score: 72 }), row({ score: 60 })];
    expect(engine.evaluate('=IF(score>80,"pass","fail")', rows)).toEqual({
      kind: 'per-row',
      values: ['fail', 'fail'],
    });
  });

  it('invalid formula returns aggregate #ERROR without throwing', () => {
    expect(engine.evaluate('not a formula', [])).toEqual({ kind: 'aggregate', value: '#ERROR' });
  });
});
