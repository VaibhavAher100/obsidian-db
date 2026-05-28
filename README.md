# ObsidianDB

Turn any folder into a live database table inside Obsidian.

> DB Folder was archived in July 2025. ObsidianDB picks up where it left off - with formula
> columns, CSV import, and a codebase built to last.

## Features (v0.1)

- **Folder to table** - any folder of `.md` files becomes a live table based on YAML frontmatter
- **Inline editing** - click any cell to edit; changes write back to the note's frontmatter
- **Formula columns** - add computed columns using `=SUM(price)`, `=COUNT(status="done")`,
  `=AVG(rating)`, `=IF(score>80,"pass","fail")`
- **CSV import** - import a CSV file and each row becomes a `.md` file with frontmatter
- **Wikilinks** - `[[Note]]` values in cells render as clickable links that open the target note
- **Theme-native** - follows your Obsidian theme automatically, light and dark

## Install

### Via BRAT (pre-release)

1. Install the [BRAT plugin](https://github.com/TfTHacker/obsidian42-brat)
2. Add `VaibhavAher100/obsidian-db` as a beta plugin

### Via community plugins

Coming once Obsidian plugin review completes.

## Usage

1. Open the command palette (`Ctrl+P` / `Cmd+P`)
2. Navigate to any note inside the folder you want to view
3. Run **ObsidianDB: Open folder as database** - it opens the active file's parent folder

Folders with an `.obsidian-db.json` file will remember your formula columns and column order.

## Settings

Open **Settings > Community Plugins > ObsidianDB** to configure:

- **Use Dataview if available** (default: on) - when the Dataview plugin is installed, ObsidianDB
  uses it as the index backend for faster updates on large folders. Disable to always use the
  built-in FrontmatterAdapter.

## Data safety

- All row data stays in your `.md` files as YAML frontmatter
- No proprietary file formats
- The only plugin artifact is `.obsidian-db.json` (formula column config per folder)
- Uninstalling the plugin leaves your `.md` files completely untouched

To clean up after uninstalling, delete any `.obsidian-db.json` files from your vault.

## Development

```bash
git clone https://github.com/VaibhavAher100/obsidian-db.git
cd obsidian-db
npm install
npm run dev
```

Then symlink (or copy) the folder into your Obsidian vault's `.obsidian/plugins/` directory
and enable the plugin from Settings > Community plugins.

Run tests:

```bash
npm test
```

See [CONTEXT.md](CONTEXT.md) for the domain glossary before contributing.
See [docs/adr/](docs/adr/) for architecture decisions.

## Contributing

Issues and PRs welcome. Please read [CONTEXT.md](CONTEXT.md) first - it defines the
vocabulary used throughout the codebase.

## License

MIT
