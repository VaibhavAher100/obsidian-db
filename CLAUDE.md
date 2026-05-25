# CLAUDE.md

Read `AGENTS.md` first — it is the canonical ruleset for all agents in this repo.
This file adds Claude Code-specific guidance only.

---

## Claude Code workflow

- Check phase status in `AGENTS.md` before starting any task
- Run `npm test` and confirm GREEN before every commit
- Use the `gh` CLI for all GitHub operations (PRs, issues, releases)
- Never push directly to `main` — always open a PR from a feature branch

## Skill usage

Use these skills when they apply:

| Task | Skill |
|------|-------|
| TDD cycles | `mattpocock-skills -> tdd` |
| Architecture review | `mattpocock-skills -> improve-codebase-architecture` |
| Git commits | `git-commit` |
| GitHub operations | `gh-cli` |
| Before each phase | `superpowers:brainstorming` |

## Repository layout

```
src/
  main.ts              plugin entry
  types.ts             all interfaces (written before implementation)
  schemas.ts           all Zod schemas
  indexer/
    FrontmatterAdapter.ts   Phase 1 - DONE
    DataviewAdapter.ts      Phase 1 - pending
  formula/             Phase 2
  import/              Phase 5
  views/               Phase 3
  components/          Phase 3
  store/               Phase 3
  settings/            Phase 6
  __tests__/
    helpers/           mockVault, mockMetadataCache, mockFileManager
    FrontmatterAdapter.test.ts  10 tests GREEN
    FormulaEngine.test.ts       Phase 2 - pending
    CsvImporter.test.ts         Phase 5 - pending
    WikilinkCell.test.tsx       Phase 3 - pending
```
