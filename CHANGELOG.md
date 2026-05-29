# Changelog

All notable changes to ObsidianDB are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [0.3.0](https://github.com/VaibhavAher100/obsidian-db/compare/v0.2.0...v0.3.0) (2026-05-29)


### Features

* **config:** Phase 4 - Formula Columns ([#6](https://github.com/VaibhavAher100/obsidian-db/issues/6)) ([178237f](https://github.com/VaibhavAher100/obsidian-db/commit/178237f39b0f4fd09ccd34f0760f50a844e0fef2))
* **formula:** add FormulaEngine - Phase 2 complete ([#3](https://github.com/VaibhavAher100/obsidian-db/issues/3)) ([1bf7fd0](https://github.com/VaibhavAher100/obsidian-db/commit/1bf7fd0993f8edd6b7c0cf749ed6cec03f7cef5e))
* **formula:** add FormulaEngine - Phase 2 complete ([#4](https://github.com/VaibhavAher100/obsidian-db/issues/4)) ([7df4e0a](https://github.com/VaibhavAher100/obsidian-db/commit/7df4e0aec7daa68025257e2b2a8e2f7f09097433))
* **importer:** Phase 5 - CSV Import ([#7](https://github.com/VaibhavAher100/obsidian-db/issues/7)) ([9cec7ea](https://github.com/VaibhavAher100/obsidian-db/commit/9cec7ea050812b25a576a28eee72817d137cab81))
* **indexer:** FrontmatterAdapter - Phase 1 TDD complete (10/10) ([d002d93](https://github.com/VaibhavAher100/obsidian-db/commit/d002d9318b3e82c07a5517633a592fa505cb4f70))
* **settings:** Phase 6 - DataviewAdapter, SettingsTab, v0.1.0 ([#8](https://github.com/VaibhavAher100/obsidian-db/issues/8)) ([4be6700](https://github.com/VaibhavAher100/obsidian-db/commit/4be67008db2164dcc8bc12543a2248024198f8d6))
* **view:** add column sorting via TanStack getSortedRowModel ([#13](https://github.com/VaibhavAher100/obsidian-db/issues/13)) ([d178948](https://github.com/VaibhavAher100/obsidian-db/commit/d178948144f892c12f40707a857b1a70d813346d))
* **view:** Phase 3 - DatabaseTable, CellEditor, WikilinkCell, DatabaseView ([#5](https://github.com/VaibhavAher100/obsidian-db/issues/5)) ([94296df](https://github.com/VaibhavAher100/obsidian-db/commit/94296df19c406aa02263649a08bec562e7418828))


### Bug Fixes

* **formula:** support quoted column names, case-insensitive functions, whitespace in parens ([#10](https://github.com/VaibhavAher100/obsidian-db/issues/10)) ([c7c83dc](https://github.com/VaibhavAher100/obsidian-db/commit/c7c83dc41f0c3bbfef981fd74aaffe2ce26a6955))
* post-v0.1 audit follow-ups (formula coercion, edit commit, delete refresh, deps) ([#18](https://github.com/VaibhavAher100/obsidian-db/issues/18)) ([4949ab1](https://github.com/VaibhavAher100/obsidian-db/commit/4949ab1938496fde302667df11fbe9741b267dac))
* resolve 6 code review findings across view, importer, and CI ([bb19e89](https://github.com/VaibhavAher100/obsidian-db/commit/bb19e897a8499dd9eb3d58beb1e4c30f156a733c))
* **root:** allow vault root as a valid database folder ([#12](https://github.com/VaibhavAher100/obsidian-db/issues/12)) ([619a920](https://github.com/VaibhavAher100/obsidian-db/commit/619a9205a05e109021605fd98f57ebd056f6dcaa))
* **view:** infer DataColumn type from first non-null frontmatter value ([#11](https://github.com/VaibhavAher100/obsidian-db/issues/11)) ([a854a30](https://github.com/VaibhavAher100/obsidian-db/commit/a854a3065aea2b17aa12d18e5edfd8a75a19a5a5))
* **view:** preserve frontmatter types on cell commit, stop wikilink click propagation ([#9](https://github.com/VaibhavAher100/obsidian-db/issues/9)) ([8240080](https://github.com/VaibhavAher100/obsidian-db/commit/8240080d08b384658d7542f4e0dbb81bb45bdd6a))

## [0.2.0](https://github.com/VaibhavAher100/obsidian-db/compare/obsidian-db-v0.1.0...obsidian-db-v0.2.0) (2026-05-29)


### Features

* **config:** Phase 4 - Formula Columns ([#6](https://github.com/VaibhavAher100/obsidian-db/issues/6)) ([178237f](https://github.com/VaibhavAher100/obsidian-db/commit/178237f39b0f4fd09ccd34f0760f50a844e0fef2))
* **formula:** add FormulaEngine - Phase 2 complete ([#3](https://github.com/VaibhavAher100/obsidian-db/issues/3)) ([1bf7fd0](https://github.com/VaibhavAher100/obsidian-db/commit/1bf7fd0993f8edd6b7c0cf749ed6cec03f7cef5e))
* **formula:** add FormulaEngine - Phase 2 complete ([#4](https://github.com/VaibhavAher100/obsidian-db/issues/4)) ([7df4e0a](https://github.com/VaibhavAher100/obsidian-db/commit/7df4e0aec7daa68025257e2b2a8e2f7f09097433))
* **importer:** Phase 5 - CSV Import ([#7](https://github.com/VaibhavAher100/obsidian-db/issues/7)) ([9cec7ea](https://github.com/VaibhavAher100/obsidian-db/commit/9cec7ea050812b25a576a28eee72817d137cab81))
* **indexer:** FrontmatterAdapter - Phase 1 TDD complete (10/10) ([d002d93](https://github.com/VaibhavAher100/obsidian-db/commit/d002d9318b3e82c07a5517633a592fa505cb4f70))
* **settings:** Phase 6 - DataviewAdapter, SettingsTab, v0.1.0 ([#8](https://github.com/VaibhavAher100/obsidian-db/issues/8)) ([4be6700](https://github.com/VaibhavAher100/obsidian-db/commit/4be67008db2164dcc8bc12543a2248024198f8d6))
* **view:** add column sorting via TanStack getSortedRowModel ([#13](https://github.com/VaibhavAher100/obsidian-db/issues/13)) ([d178948](https://github.com/VaibhavAher100/obsidian-db/commit/d178948144f892c12f40707a857b1a70d813346d))
* **view:** Phase 3 - DatabaseTable, CellEditor, WikilinkCell, DatabaseView ([#5](https://github.com/VaibhavAher100/obsidian-db/issues/5)) ([94296df](https://github.com/VaibhavAher100/obsidian-db/commit/94296df19c406aa02263649a08bec562e7418828))


### Bug Fixes

* **formula:** support quoted column names, case-insensitive functions, whitespace in parens ([#10](https://github.com/VaibhavAher100/obsidian-db/issues/10)) ([c7c83dc](https://github.com/VaibhavAher100/obsidian-db/commit/c7c83dc41f0c3bbfef981fd74aaffe2ce26a6955))
* post-v0.1 audit follow-ups (formula coercion, edit commit, delete refresh, deps) ([#18](https://github.com/VaibhavAher100/obsidian-db/issues/18)) ([4949ab1](https://github.com/VaibhavAher100/obsidian-db/commit/4949ab1938496fde302667df11fbe9741b267dac))
* resolve 6 code review findings across view, importer, and CI ([bb19e89](https://github.com/VaibhavAher100/obsidian-db/commit/bb19e897a8499dd9eb3d58beb1e4c30f156a733c))
* **root:** allow vault root as a valid database folder ([#12](https://github.com/VaibhavAher100/obsidian-db/issues/12)) ([619a920](https://github.com/VaibhavAher100/obsidian-db/commit/619a9205a05e109021605fd98f57ebd056f6dcaa))
* **view:** infer DataColumn type from first non-null frontmatter value ([#11](https://github.com/VaibhavAher100/obsidian-db/issues/11)) ([a854a30](https://github.com/VaibhavAher100/obsidian-db/commit/a854a3065aea2b17aa12d18e5edfd8a75a19a5a5))
* **view:** preserve frontmatter types on cell commit, stop wikilink click propagation ([#9](https://github.com/VaibhavAher100/obsidian-db/issues/9)) ([8240080](https://github.com/VaibhavAher100/obsidian-db/commit/8240080d08b384658d7542f4e0dbb81bb45bdd6a))

## [Unreleased]

## [0.1.0] - 2026-05-28

### Added
- Folder to live table view from YAML frontmatter
- Column sorting - click any header to sort ascending/descending
- Inline cell editing - writes directly back to note frontmatter
- Formula columns: =SUM, =COUNT, =AVG, =IF over frontmatter values
- CSV import - converts rows to .md files with frontmatter mapping
- Wikilinks in cells render as clickable links that open the target note
- Theme-native styling via Obsidian CSS variables (light and dark)
- Optional Dataview integration with graceful fallback to FrontmatterAdapter
- Per-folder config in .obsidian-db.json (formula columns, column order)
