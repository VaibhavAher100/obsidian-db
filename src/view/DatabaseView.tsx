import React from 'react';
import { ItemView, type WorkspaceLeaf } from 'obsidian';
import { createRoot, type Root } from 'react-dom/client';
import type ObsidianDBPlugin from '../main';
import { FrontmatterAdapter } from '../indexer/FrontmatterAdapter';
import { FormulaEngine } from '../formula/FormulaEngine';
import type { Row, Unsubscribe, DataColumn } from '../types';
import { DatabaseTable } from './DatabaseTable';

export const VIEW_TYPE_DATABASE = 'obsidian-db-view';

function deriveColumns(rows: Row[]): DataColumn[] {
  const keys = new Set<string>();
  for (const row of rows) {
    for (const key of Object.keys(row.frontmatter)) {
      keys.add(key);
    }
  }
  return [...keys].map(key => ({ kind: 'data', key, label: key, type: 'text' }));
}

export class DatabaseView extends ItemView {
  private root: Root | null = null;
  private rows: Row[] = [];
  private unsubscribe: Unsubscribe | null = null;
  private folderIndex: FrontmatterAdapter | null = null;
  private readonly engine = new FormulaEngine();

  constructor(
    leaf: WorkspaceLeaf,
    private readonly plugin: ObsidianDBPlugin,
    readonly folderPath: string,
  ) {
    super(leaf);
  }

  getViewType(): string {
    return VIEW_TYPE_DATABASE;
  }

  getDisplayText(): string {
    return `DB: ${this.folderPath}`;
  }

  override async onOpen(): Promise<void> {
    const { vault, metadataCache, fileManager } = this.app;
    this.folderIndex = new FrontmatterAdapter(vault, metadataCache, fileManager, this.folderPath);
    this.rows = this.folderIndex.getRows();

    this.unsubscribe = this.folderIndex.onRowChange(rows => {
      this.rows = rows;
      this.renderTable();
    });

    const container = this.containerEl.children[1];
    if (!container) return;
    this.root = createRoot(container as HTMLElement);
    this.renderTable();
  }

  override onClose(): Promise<void> {
    this.root?.unmount();
    this.root = null;
    this.unsubscribe?.();
    this.unsubscribe = null;
    this.folderIndex?.destroy();
    this.folderIndex = null;
    return Promise.resolve();
  }

  private renderTable(): void {
    if (!this.root || !this.folderIndex) return;
    const columns = deriveColumns(this.rows);
    this.root.render(
      React.createElement(DatabaseTable, {
        rows: this.rows,
        columns,
        engine: this.engine,
        onUpdate: (file, key, value) => this.folderIndex!.updateCell(file, key, value),
      }),
    );
  }
}
