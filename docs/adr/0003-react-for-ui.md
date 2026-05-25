# ADR 0003 - React 18 for UI components

## Status

Accepted

## Decision

All UI components (table, cell editor, import modal, formula column UI) are written in
React 18 with TSX. Vanilla TypeScript with Obsidian's DOM API is not used for these
components.

## Reasons

- TanStack React Table v8 requires React and provides sorting, filtering, and virtualization
  that would take weeks to replicate with vanilla DOM
- DB Folder (the plugin this replaces) used React successfully - patterns are well understood
- Zustand is React-native; its devtools integration aids debugging during development
- Vanilla DOM manipulation for a sortable, filterable, inline-editable table would require
  approximately 3x the code and produce a harder-to-maintain result

## Consequences

- The React bundle adds approximately 45KB gzip to main.js. This is acceptable for an
  Electron-based app.
- Components must use `createRoot` inside Obsidian's ItemView `onOpen` and destroy the root
  in `onClose` to avoid memory leaks.
- Tests use Vitest with React Testing Library and jsdom.
- The plugin is more opinionated than a simple DOM plugin but easier to extend.

## What this rules out

- Preact as a lighter alternative: ruled out for v0.1 because the React ecosystem tooling
  (devtools, Testing Library) is better for this use case.
- Svelte: incompatible with the esbuild config without significant extra setup.
