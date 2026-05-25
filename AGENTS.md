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
npm run dev      # esbuild watch mode - outputs main.js
npm run build    # production build (no sourcemap)
npm test         # vitest run (all tests, no watch)
npm run test:watch  # vitest watch
```

All tests must be GREEN before any commit. Never commit with failing tests.

---

## Phase status

| Phase | Status | Description |
|-------|--------|-------------|
| 0 — Repo setup | DONE | CONTEXT.md, ADRs, types, schemas, config files |
| 1 — FolderIndex TDD | DONE | FrontmatterAdapter, 10 tests GREEN |
| 2 — FormulaEngine TDD | pending | =SUM, =COUNT, =AVG, =IF, error handling |
| 3 — Table View | pending | DatabaseView, DatabaseTable, CellEditor, WikilinkCell |
| 4 — Formula Columns | pending | parseFormula, FormulaCell, persist to .obsidian-db.json |
| 5 — CSV Import | pending | CsvImporter TDD, ImportModal |
| 6 — Settings + Release | pending | SettingsTab, README, BRAT, community plugins PR |

Start Phase 2 unless the user says otherwise.

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
3. `npm test` passes GREEN before pushing
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

### From A Philosophy of Software Design (Ousterhout)

- Optimize for lower cognitive load, not shorter files or fewer lines.
- Prefer deep modules — small interface, large implementation (FolderIndex is the model).
- Hide volatile decisions behind the right boundary (Adapter hides MetadataCache vs Dataview).
- If a change spreads widely, fix ownership instead of adding special cases.
- When naming is hard or comments get long, treat it as a design signal.

### From Clean Code (Martin)

- Preserve behavior, write for the next reader, leave touched code cleaner within scope.
- Split boolean flags, mixed abstraction levels, and hidden side effects out of functions.
- Separate commands from queries.
- Use comments only for rationale, never to explain confusing code.

### From Clean Architecture (Martin)

- Source dependencies point inward. FolderIndex (domain) must not import Obsidian framework types beyond what the interface needs.
- Adapters translate — they do not own business rules.
- Test policy (FormulaEngine, CsvImporter) without real Obsidian dependencies.

---

## What to never do

- Do not commit directly to `main`
- Do not add Claude, Copilot, or any AI as commit co-author
- Do not use em dashes (—) anywhere in code, comments, or docs — use hyphens (-)
- Do not add features outside the current phase scope
- Do not write to `.md` files outside the test environment (all row data belongs to the user)
- Do not use `z.parse()` — always `z.safeParse()` at external boundaries
- Do not hardcode colors — use Obsidian CSS variables
- Do not require Dataview — it is always optional
