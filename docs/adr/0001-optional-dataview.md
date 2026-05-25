# ADR 0001 - Dataview is optional, FrontmatterAdapter is the default

## Status

Accepted

## Decision

ObsidianDB does not require the Dataview plugin. If Dataview is installed and enabled,
DataviewAdapter is used. If not, FrontmatterAdapter is used instead. The user can also
disable Dataview usage from the plugin settings even if it is installed.

## Reasons

- Obsidian community plugin review rejects plugins that require unverified third-party plugins
- Approximately 40% of DB Folder users (the predecessor) did not have Dataview installed
- Obsidian's MetadataCache is sufficient for the majority of vaults under 500 notes
- Adding a hard dependency raises the installation barrier and increases failure surface

## Consequences

- The FolderIndex interface must be identical for both adapters. TypeScript enforces this.
- DataviewAdapter wraps every Dataview API call in a try/catch. On any error, it logs a
  warning and the plugin falls back to FrontmatterAdapter silently.
- Plugin settings includes a toggle: "Use Dataview if available" (default: on).
- Features that only Dataview can provide (cross-folder DQL queries, backlink queries)
  are explicitly out of scope for v0.1.

## Revisit trigger

If FrontmatterAdapter proves too slow at more than 1,000 notes in a single folder,
revisit whether a minimum Dataview requirement is acceptable.
