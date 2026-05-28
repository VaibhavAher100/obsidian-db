# Changelog

All notable changes to ObsidianDB are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

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
