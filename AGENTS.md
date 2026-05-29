# ObsidianDB — Agent Instructions

> Read this file before touching any code. It is the single source of truth for all
> AI agents working in this repository (Claude Code, Codex, Cursor, Copilot).

---

## What this project is

ObsidianDB turns any folder of `.md` files into a live, sortable, filterable table
based on YAML frontmatter. It is an Obsidian plugin — the successor to DB Folder
(archived July 2025, 80k downloads).

Stack: TypeScript strict + esbuild + React 18 + TanStack React Table v8 + Zustand
+ @formulajs/formulajs + zod + papaparse + vitest

---

## Domain vocabulary

Read `CONTEXT.md` before writing any code or tests. Every PR must use the terms
defined there. Quick reference:

| Term | Meaning |
|------|---------|
| Row | One `.md` file in the target folder (not "note", "file", "record") |
| Column | A frontmatter key present in >= 1 Row |
| DataColumn | Column whose values live in frontmatter (read/write) |
| FormulaColumn | Column computed at render time, never written to frontmatter |
| FolderIndex | The deep-module interface: `getRows()`, `onRowChange()`, `updateCell()`, `destroy()` |
| Adapter | A concrete FolderIndex implementation (FrontmatterAdapter or DataviewAdapter) |
| DatabaseView | The Obsidian ItemView that renders a FolderIndex as a table |
| DbConfig | Per-folder config in `.obsidian-db.json` — formula columns + column order |
| ColumnResult | Return type of FormulaEngine.evaluate() — `aggregate` (one value) or `per-row` (one per Row) |

---

## Architecture decisions

Read `docs/adr/` before re-litigating these. Summary:

- **ADR 0001**: Dataview is optional. FrontmatterAdapter is always available.
  DataviewAdapter activates silently when Dataview plugin is present.
- **ADR 0002**: FormulaColumn definitions live in `.obsidian-db.json`, never in frontmatter.
- **ADR 0003**: All UI is React 18 TSX. No Preact, no Svelte, no vanilla DOM.

---

## Development commands

```bash
npm run dev        # esbuild watch mode - outputs main.js
npm run build      # production build (no sourcemap)
npm run typecheck  # tsc --noEmit (type errors esbuild misses)
npm test           # vitest run (all tests, no watch)
npm run test:watch # vitest watch
```

All tests must be GREEN and typecheck must pass before any commit.

---

## Phase status

| Phase | Status | Description |
|-------|--------|-------------|
| 0 — Repo setup | DONE | CONTEXT.md, ADRs, types, schemas, config files |
| 1 — FolderIndex TDD | DONE | FrontmatterAdapter + DataviewAdapter stub |
| 2 — FormulaEngine TDD | DONE | =SUM, =COUNT, =AVG, =IF (per-row + aggregate), ColumnResult |
| 3 — Table View | DONE | DatabaseView, DatabaseTable, CellEditor, WikilinkCell |
| 4 — Formula Columns | DONE | parseFormula, FormulaCell, persist to .obsidian-db.json |
| 5 — CSV Import | DONE | CsvImporter, ImportModal |
| 6 — Settings + Release | DONE | DataviewAdapter, SettingsTab, README, BRAT — v0.1.0 shipped |

All six phases are merged and v0.1.0 is released. New work is post-v0.1
maintenance: confirm with the user which feature or fix to pick up next.

---

## Formula design (locked — read before Phase 2)

FormulaColumns support two modes. The parser determines the mode from the function name.

**Aggregate** (SUM, AVG, COUNT): one value computed across all Rows, displayed identically
in every cell of the column.
```
=SUM(price)            → sum of all price values across all Rows
=AVG(rating)           → mean of all rating values
=COUNT(status)         → count of Rows where status key exists
=COUNT(status="done")  → count of Rows where status equals "done"
```

**Per-row** (IF): evaluated independently for each Row using that Row's own frontmatter.
```
=IF(score>80,"pass","fail")  → each Row shows "pass" or "fail" based on its own score
```

`IFormulaEngine.evaluate()` returns `ColumnResult`:
- `{ kind: 'aggregate', value: unknown }` — same value for all cells
- `{ kind: 'per-row', values: unknown[] }` — `values[i]` pairs with `rows[i]`

Invalid formulas return `{ kind: 'aggregate', value: '#ERROR' }` — never throw.

---

## Git workflow

This project uses **GitHub Flow**. Never commit directly to `main`.

```
main  (protected — always releasable)
  └─ feat/<what>     new capability
  └─ fix/<what>      bug fix
  └─ chore/<what>    config, deps, docs, CI
  └─ test/<what>     tests only
```

**Required for every change:**
1. `git checkout -b feat/<name>` from latest `main`
2. Work in small, focused commits
3. `npm test` + `npm run typecheck` pass before pushing
4. Open a PR — do not merge locally to main
5. Squash merge via PR, delete the branch

---

## Commit message format

Use conventional commits. Never add AI co-authorship lines.

```
feat(formula): add =SUM aggregation with missing-key handling
fix(adapter): filter out non-folder files in getRows
chore(deps): update vitest to 2.2.0
test(csv): add 50-row import integration test
```

- Present tense, imperative mood
- Scope in parentheses = module name
- Body optional but encouraged for non-obvious decisions

---

## Code conventions

**TypeScript:**
- `strict: true`, `noUncheckedIndexedAccess: true`, `verbatimModuleSyntax: true`
- All external data goes through a Zod schema (`safeParse`, never `parse`)
- No `any` — use `unknown` then narrow
- Interfaces over classes for domain types (types.ts is the contract layer)

**Comments:**
- Write zero comments by default
- Add one only when the WHY is non-obvious (a workaround, hidden constraint, subtle invariant)
- Never explain WHAT the code does — names do that

**Features:**
- Implement only what the current phase requires
- No speculative abstractions, no "we might need this later"
- Three similar lines beats a premature helper

**Obsidian specifics:**
- Never import React or DOM APIs that don't exist in Obsidian's Electron environment
- All plugin setup/teardown goes through `onload()` / `onunload()` in `main.ts`
- CSS: Obsidian CSS variables only (`--background-primary`, `--text-normal`, etc.) — no hardcoded colors

---

## Testing approach

Vertical TDD slices only. One test -> one implementation -> repeat. Do not write all
tests first and then implement (horizontal slicing produces tests that test shape, not behavior).

Rules per cycle:
- Test describes behavior through the public interface, not implementation details
- Test must survive internal refactors
- Implementation is minimal — only enough to pass the current test
- Never refactor while RED; get to GREEN first

Test helpers live in `src/__tests__/helpers/`. Use them, don't duplicate.

---

## Engineering principles (always-on)

### A Philosophy of Software Design (Ousterhout) — primary bias

Use reduced complexity as the primary success metric. Prefer the design that lowers
cognitive load, change amplification, hidden dependencies, and the number of facts a
reader must hold at once.

- Prefer deep modules: small, semantic interfaces that hide meaningful internal complexity.
  Reject pass-through services, thin wrappers, and tiny split-outs that add names without
  reducing reader burden. FolderIndex is the reference implementation of this pattern.
- Design interfaces around what callers need to know, not how the implementation works.
  Avoid fragile staging, setup sequences, mode flags, and arguments that expose internal choices.
- Hide volatile decisions inside the module that owns the knowledge. Adapters hide whether
  MetadataCache or Dataview is in use. FormulaEngine hides whether formulajs or custom
  logic runs the computation.
- Pull complexity downward. Prefer a slightly more complex implementation if it gives callers
  a simpler public contract.
- Treat names, consistency, and obviousness as design information. When naming is hard or
  comments get long, treat it as a design signal — the abstraction boundary is wrong.
- Use tests to protect behavior through public contracts. Do not let test convenience force
  shallow or leaky interfaces.

Trigger: when adding any module, layer, helper, or argument, prove it hides more complexity
than it adds. When a change spreads across files, look for missing information hiding.

### Clean Code (Martin)

- Preserve behavior, write for the next reader, leave touched code cleaner within scope.
- Split boolean flags, mixed abstraction levels, and hidden side effects out of functions.
- Separate commands from queries.
- Use comments only for rationale, never to explain confusing code.

### Clean Architecture (Martin)

- Source dependencies point inward. FolderIndex (domain) must not import Obsidian framework
  types beyond what the interface requires.
- Adapters translate — they do not own business rules.
- Test policy (FormulaEngine, CsvImporter) without real Obsidian dependencies.

---

## What to never do

- Do not commit directly to `main`
- Do not add Claude, Copilot, or any AI as commit co-author
- Do not use em dashes (--) anywhere in code, comments, or docs — use hyphens (-)
- Do not add features outside the current phase scope
- Do not write to `.md` files outside the test environment (all row data belongs to the user)
- Do not use `z.parse()` — always `z.safeParse()` at external boundaries
- Do not hardcode colors — use Obsidian CSS variables
- Do not require Dataview — it is always optional
