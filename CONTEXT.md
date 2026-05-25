# ObsidianDB - Domain Glossary

Every contributor must use these terms in code, comments, issues, and PRs.
Consistency here is what makes future contributions possible without re-explaining the design.

## Terms

**Row**
One `.md` file inside the target folder. Represented in the table as its frontmatter fields
plus its filename. A Row has no meaning outside its folder context.
Avoid: note, file, record

**Column**
A frontmatter key that appears in at least one Row. Auto-derived from the union of all keys
across all Rows in the folder. Can be a DataColumn (values in frontmatter) or a
FormulaColumn (values computed at render time).
Avoid: field, property, attribute

**DataColumn**
A Column whose values are read directly from frontmatter and written back when a user edits
a cell. Stored in the .md file itself.
Avoid: regular column, standard column

**FormulaColumn**
A Column whose values are computed by the FormulaEngine at render time. The formula is
stored in `.obsidian-db.json`, never in frontmatter. A FormulaColumn is always read-only
for the user.
Avoid: computed column, derived column, calculated column

**FolderIndex**
The deep-module interface that provides a stream of Rows for a given folder path. Hides all
MetadataCache and Dataview implementation details from callers. Four methods:
- `getRows()` — snapshot of current Rows
- `onRowChange(cb)` — subscribe to changes, returns an unsubscribe function
- `updateCell(file, key, value)` — write one frontmatter key back to disk
- `destroy()` — remove all registered listeners (call in ItemView.onClose)
Avoid: data source, provider, repository

**Adapter**
A concrete implementation of FolderIndex. Two adapters exist:
- FrontmatterAdapter: always available, reads via Obsidian MetadataCache
- DataviewAdapter: used when Dataview plugin is installed, faster indexing at scale
Avoid: implementation, service, backend

**DatabaseView**
The Obsidian ItemView that renders a FolderIndex as a table. Owns the React root.
Created when the user opens a folder as a database via the command palette or file menu.
Avoid: page, screen, panel

**DbConfig**
The per-folder plugin configuration stored in `.obsidian-db.json` inside the target folder.
Contains FormulaColumn definitions, column ordering, and hidden columns.
DbConfig holds schema only - it never contains row data.
Avoid: settings, config, schema file (use DbConfig)

## Relationships

- A DatabaseView renders exactly one FolderIndex
- A FolderIndex has one active Adapter at a time
- A folder has zero or one DbConfig
- A DbConfig contains zero or more FormulaColumns
- A FormulaColumn is a Column - it appears in the same column list as DataColumns

## Flagged ambiguities

- "note" previously used interchangeably with Row: resolved - Row is the domain term inside
  ObsidianDB. "note" is the Obsidian concept; Row is how this plugin sees it.
- "config" and "settings" both appeared: resolved - DbConfig is the per-folder .json file;
  PluginSettings is the plugin-wide Obsidian settings tab.
