# ADR 0002 - Formula column schema stored in .obsidian-db.json

## Status

Accepted

## Decision

FormulaColumn definitions are stored in `.obsidian-db.json` inside the target folder,
not in the frontmatter of any .md file.

## Reasons

- FormulaColumns are per-folder configuration. Frontmatter is per-file data. Storing
  folder-level config in a file's frontmatter would be a category error.
- `.obsidian-db.json` is clearly a plugin artifact. Users understand they should not edit
  it manually.
- Keeping the config file inside the target folder means the configuration travels with
  the folder if the user moves or renames it.
- Storing in frontmatter would pollute every note in the folder with plugin-specific keys,
  which conflicts with Obsidian's plain-text philosophy.

## Consequences

- Each folder opened as a database gets its own `.obsidian-db.json` file.
- Deleting `.obsidian-db.json` removes formula columns only. All Row data (.md files)
  remains intact.
- Plugin uninstall does NOT auto-delete `.obsidian-db.json` files. The README must document
  how to clean up these files after uninstalling.
- Sharing a formula config across multiple folders requires manual copy of the JSON file.
  This is acceptable for v0.1.

## Revisit trigger

If users frequently want the same formula columns across many folders, consider a shared
formula config in plugin settings (v0.2+).
