# FormulaEngine Design — 2026-05-25

## Context

Phase 2 of ObsidianDB. FormulaEngine is a pure TypeScript module with zero Obsidian
dependencies. It takes a formula string and a Row[] and returns a ColumnResult. All
formula evaluation happens here; callers (FormulaCell) only consume the result.

This doc was produced by a pre-Phase-2 audit that also resolved an open design question:
are FormulaColumn values per-row or aggregate?

## Decision: both modes, determined by function name

| Function | Mode | Each cell shows |
|----------|------|-----------------|
| SUM, AVG, COUNT | aggregate | same value for every row |
| IF | per-row | value computed from that row's own frontmatter |

This was chosen over aggregate-only (loses per-row IF usefulness) and per-row-only
(makes SUM impossible without a separate summary row concept).

## ColumnResult type (src/types.ts)

```typescript
type ColumnResult =
  | { kind: 'aggregate'; value: unknown }
  | { kind: 'per-row'; values: unknown[] };
```

`values[i]` corresponds to `rows[i]`. FormulaCell uses `result.kind` to decide rendering.

## IFormulaEngine interface (src/types.ts)

```typescript
interface IFormulaEngine {
  evaluate(formula: string, rows: Row[]): ColumnResult;
}
```

Single method. No setup, no state. Invalid formulas return
`{ kind: 'aggregate', value: '#ERROR' }` — never throw.

## parseFormula.ts (src/formula/parseFormula.ts)

Parses the formula string into a typed structure before evaluation.

```typescript
type Condition = { col: string; op: '>' | '<' | '=' | '>=' | '<='; threshold: number };

type ParsedFormula =
  | { kind: 'aggregate'; fn: 'SUM' | 'AVG'; col: string }
  | { kind: 'aggregate'; fn: 'COUNT'; col: string; eq?: string }
  | { kind: 'per-row'; fn: 'IF'; condition: Condition; trueVal: unknown; falseVal: unknown }
  | { kind: 'error'; message: string };
```

Input always starts with `=`. Examples:
- `=SUM(price)` -> `{ kind: 'aggregate', fn: 'SUM', col: 'price' }`
- `=COUNT(status="done")` -> `{ kind: 'aggregate', fn: 'COUNT', col: 'status', eq: 'done' }`
- `=IF(score>80,"pass","fail")` -> `{ kind: 'per-row', fn: 'IF', condition: { col: 'score', op: '>', threshold: 80 }, trueVal: 'pass', falseVal: 'fail' }`
- `garbage` -> `{ kind: 'error', message: '...' }`

## FormulaEngine.ts (src/formula/FormulaEngine.ts)

Uses `@formulajs/formulajs` for SUM and AVG to get Excel-compatible numeric behavior.
COUNT and IF implemented custom (formulajs COUNT semantics differ from ours).

Missing key behavior:
- SUM/AVG: non-numeric and missing values are skipped (not treated as 0)
- COUNT(col): counts rows where the key exists with any value
- COUNT(col="val"): counts rows where the key equals the string value
- IF: missing key evaluates the condition with `undefined`, so `undefined > 80` = false

## Test cases (src/__tests__/FormulaEngine.test.ts)

10 vertical TDD slices:

```
1.  =SUM(price)           [{price:1},{price:2},{price:3}]    -> aggregate 6
2.  =SUM(price)           one row missing price key          -> aggregate 3 (skips missing)
3.  =SUM(price)           one row has price:"text"           -> aggregate 3 (skips non-numeric)
4.  =COUNT(status)        3 rows all have status             -> aggregate 3
5.  =COUNT(status="done") 2 done, 1 pending                  -> aggregate 2
6.  =AVG(rating)          [4, 5, 3]                          -> aggregate 4
7.  =AVG(rating)          empty rows []                      -> aggregate 0 (not NaN)
8.  =IF(score>80,"pass","fail") [95, 72, 88]                -> per-row ['pass','fail','pass']
9.  =IF(score>80,"pass","fail") [72, 60]                    -> per-row ['fail','fail']
10. "not a formula"                                          -> aggregate '#ERROR', no throw
```

## File layout

```
src/formula/
  FormulaEngine.ts    implements IFormulaEngine
  parseFormula.ts     pure parser, no Row dependency
src/__tests__/
  FormulaEngine.test.ts   10 tests as above
```

No test helpers needed — FormulaEngine takes plain Row[] (no Obsidian mocks).

## Constraints

- Zero Obsidian imports in src/formula/
- Zero React imports in src/formula/
- All formula functions are pure: same inputs always produce same outputs
- formulajs lazy-imported only when a formula is actually evaluated (bundle size)
