import type { IFormulaEngine, Row, ColumnResult } from '../types';
import { parseFormula } from './parseFormula';

export class FormulaEngine implements IFormulaEngine {
  evaluate(formula: string, rows: Row[]): ColumnResult {
    const parsed = parseFormula(formula);

    if (parsed.kind === 'error') return { kind: 'aggregate', value: '#ERROR' };

    if (parsed.fn === 'SUM') {
      const nums = rows
        .map(r => r.frontmatter[parsed.col])
        .filter((v): v is number => typeof v === 'number');
      return { kind: 'aggregate', value: nums.reduce((a, b) => a + b, 0) };
    }

    if (parsed.fn === 'AVG') {
      const nums = rows
        .map(r => r.frontmatter[parsed.col])
        .filter((v): v is number => typeof v === 'number');
      if (nums.length === 0) return { kind: 'aggregate', value: 0 };
      return { kind: 'aggregate', value: nums.reduce((a, b) => a + b, 0) / nums.length };
    }

    if (parsed.fn === 'COUNT') {
      const count = rows.filter(r => {
        const val = r.frontmatter[parsed.col];
        if (val === undefined) return false;
        return parsed.eq !== undefined ? val === parsed.eq : true;
      }).length;
      return { kind: 'aggregate', value: count };
    }

    // IF — per-row
    const { condition, trueVal, falseVal } = parsed;
    const values = rows.map(r => {
      const val = r.frontmatter[condition.col];
      const n = typeof val === 'number' ? val : undefined;
      let passes: boolean;
      switch (condition.op) {
        case '>':  passes = n !== undefined && n > condition.threshold;  break;
        case '<':  passes = n !== undefined && n < condition.threshold;  break;
        case '>=': passes = n !== undefined && n >= condition.threshold; break;
        case '<=': passes = n !== undefined && n <= condition.threshold; break;
        case '=':  passes = val === condition.threshold;                  break;
        default:   passes = false;
      }
      return passes ? trueVal : falseVal;
    });
    return { kind: 'per-row', values };
  }
}
