type Condition = { col: string; op: '>' | '<' | '=' | '>=' | '<='; threshold: number };

export type ParsedFormula =
  | { kind: 'aggregate'; fn: 'SUM'; col: string }
  | { kind: 'aggregate'; fn: 'AVG'; col: string }
  | { kind: 'aggregate'; fn: 'COUNT'; col: string; eq?: string }
  | { kind: 'per-row'; fn: 'IF'; condition: Condition; trueVal: unknown; falseVal: unknown }
  | { kind: 'error'; message: string };

// Matches bare identifiers (word chars) or double-quoted strings (any chars except ").
// Groups: [1] = quoted content, [2] = bare content. One will always be undefined.
const COL = String.raw`\s*(?:"([^"]+)"|(\w+))\s*`;

function col(m: RegExpMatchArray, offset: number): string | undefined {
  return m[offset] ?? m[offset + 1];
}

export function parseFormula(formula: string): ParsedFormula {
  if (!formula.startsWith('=')) {
    return { kind: 'error', message: `Formula must start with '='` };
  }

  const body = formula.slice(1).trim();

  const sumMatch = body.match(new RegExp(String.raw`^SUM\(${COL}\)$`, 'i'));
  if (sumMatch) {
    const c = col(sumMatch, 1);
    if (c) return { kind: 'aggregate', fn: 'SUM', col: c };
  }

  const avgMatch = body.match(new RegExp(String.raw`^AVG\(${COL}\)$`, 'i'));
  if (avgMatch) {
    const c = col(avgMatch, 1);
    if (c) return { kind: 'aggregate', fn: 'AVG', col: c };
  }

  const countMatch = body.match(new RegExp(String.raw`^COUNT\(${COL}(?:="([^"]*)")?\s*\)$`, 'i'));
  if (countMatch) {
    const c = col(countMatch, 1);
    const eq = countMatch[3];
    if (c) return { kind: 'aggregate', fn: 'COUNT', col: c, ...(eq !== undefined ? { eq } : {}) };
  }

  const ifMatch = body.match(
    new RegExp(String.raw`^IF\(${COL}(>=|<=|>|<|=)\s*(-?\d+(?:\.\d+)?)\s*,\s*"([^"]*)"\s*,\s*"([^"]*)"\s*\)$`, 'i'),
  );
  if (ifMatch) {
    const c = col(ifMatch, 1);
    if (c) {
      return {
        kind: 'per-row',
        fn: 'IF',
        condition: { col: c, op: ifMatch[3]! as Condition['op'], threshold: parseFloat(ifMatch[4]!) },
        trueVal: ifMatch[5]!,
        falseVal: ifMatch[6]!,
      };
    }
  }

  return { kind: 'error', message: `Unrecognized formula: ${formula}` };
}
