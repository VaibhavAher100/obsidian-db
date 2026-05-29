import type { IFormulaEngine, Row, ColumnResult } from '../types';
import { parseFormula } from './parseFormula';

// Frontmatter values may be real numbers or numeric strings (CSV import, YAML).
// Return a number when the value represents one, otherwise undefined.
function toNumber(value: unknown): number | undefined {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') return undefined;
    const n = Number(trimmed);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

export class FormulaEngine implements IFormulaEngine {
  evaluate(formula: string, rows: Row[]): ColumnResult {
    const parsed = parseFormula(formula);

    if (parsed.kind === 'error') return { kind: 'aggregate', value: '#ERROR' };

    if (parsed.fn === 'SUM') {
      const nums = rows
        .map(r => toNumber(r.frontmatter[parsed.col]))
        .filter((v): v is number => v !== undefined);
      return { kind: 'aggregate', value: nums.reduce((a, b) => a + b, 0) };
    }

    if (parsed.fn === 'AVG') {
      const nums = rows
        .map(r => toNumber(r.frontmatter[parsed.col]))
        .filter((v): v is number => v !== undefined);
      if (nums.length === 0) return { kind: 'aggregate', value: 0 };
      return { kind: 'aggregate', value: nums.reduce((a, b) => a + b, 0) / nums.length };
    }

    if (parsed.fn === 'COUNT') {
      const count = rows.filter(r => {
        const val = r.frontmatter[parsed.col];
        if (val === undefined) return false;
        // Compare as strings so '5' and 5 match the same target.
        return parsed.eq !== undefined ? String(val) === parsed.eq : true;
      }).length;
      return { kind: 'aggregate', value: count };
    }

    // IF — per-row
    const { condition, trueVal, falseVal } = parsed;
    const values = rows.map(r => {
      const n = toNumber(r.frontmatter[condition.col]);
      let passes: boolean;
      switch (condition.op) {
        case '>':  passes = n !== undefined && n > condition.threshold;  break;
        case '<':  passes = n !== undefined && n < condition.threshold;  break;
        case '>=': passes = n !== undefined && n >= condition.threshold; break;
        case '<=': passes = n !== undefined && n <= condition.threshold; break;
        case '=':  passes = n !== undefined && n === condition.threshold; break;
        default:   passes = false;
      }
      return passes ? trueVal : falseVal;
    });
    return { kind: 'per-row', values };
  }
}
