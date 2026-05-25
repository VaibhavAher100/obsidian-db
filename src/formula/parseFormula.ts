type Condition = { col: string; op: '>' | '<' | '=' | '>=' | '<='; threshold: number };

export type ParsedFormula =
  | { kind: 'aggregate'; fn: 'SUM'; col: string }
  | { kind: 'aggregate'; fn: 'AVG'; col: string }
  | { kind: 'aggregate'; fn: 'COUNT'; col: string; eq?: string }
  | { kind: 'per-row'; fn: 'IF'; condition: Condition; trueVal: unknown; falseVal: unknown }
  | { kind: 'error'; message: string };

export function parseFormula(formula: string): ParsedFormula {
  if (!formula.startsWith('=')) {
    return { kind: 'error', message: `Formula must start with '='` };
  }

  const body = formula.slice(1);

  const sumMatch = body.match(/^SUM\((\w+)\)$/);
  if (sumMatch) return { kind: 'aggregate', fn: 'SUM', col: sumMatch[1]! };

  const avgMatch = body.match(/^AVG\((\w+)\)$/);
  if (avgMatch) return { kind: 'aggregate', fn: 'AVG', col: avgMatch[1]! };

  const countMatch = body.match(/^COUNT\((\w+)(?:="([^"]*)")?\)$/);
  if (countMatch) {
    const col = countMatch[1]!;
    const eq = countMatch[2];
    return { kind: 'aggregate', fn: 'COUNT', col, ...(eq !== undefined ? { eq } : {}) };
  }

  const ifMatch = body.match(/^IF\((\w+)(>=|<=|>|<|=)(-?\d+(?:\.\d+)?),"([^"]*)","([^"]*)"\)$/);
  if (ifMatch) {
    return {
      kind: 'per-row',
      fn: 'IF',
      condition: { col: ifMatch[1]!, op: ifMatch[2]! as Condition['op'], threshold: parseFloat(ifMatch[3]!) },
      trueVal: ifMatch[4]!,
      falseVal: ifMatch[5]!,
    };
  }

  return { kind: 'error', message: `Unrecognized formula: ${formula}` };
}
