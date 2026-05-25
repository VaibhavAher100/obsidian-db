# CLAUDE.md

@AGENTS.md

## Claude Code-specific notes

---

## Claude Code workflow

- Check phase status in `AGENTS.md` before starting any task
- Run `npm test` and confirm GREEN before every commit
- Use the `gh` CLI for all GitHub operations (PRs, issues, releases)
- Never push directly to `main` — always open a PR from a feature branch

## Development workflow

- TDD: one test -> minimal implementation -> repeat. Never write all tests first.
- Git commits: conventional commit format (see AGENTS.md). `npm test` + `npm run typecheck` must pass first.
- GitHub operations: use `gh` CLI for PRs, issues, releases.

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
