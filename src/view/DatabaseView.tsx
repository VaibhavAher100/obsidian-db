import React from 'react';
import { ItemView, type WorkspaceLeaf, type ViewStateResult } from 'obsidian';
import { createRoot, type Root } from 'react-dom/client';
import type ObsidianDBPlugin from '../main';
import { DbConfigManager } from '../config/DbConfigManager';
import { DataviewAdapter } from '../indexer/DataviewAdapter';
import { FrontmatterAdapter } from '../indexer/FrontmatterAdapter';
import { FormulaEngine } from '../formula/FormulaEngine';
import type { Row, Unsubscribe, DataColumn, DbConfig, FolderIndex } from '../types';
import { DatabaseTable } from './DatabaseTable';

export const VIEW_TYPE_DATABASE = 'obsidian-db-view';

function inferType(value: unknown): DataColumn['type'] {
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'string') {
    if (/^\[\[[^\]]+\]\]$/.test(value)) return 'wikilink';
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) return 'date';
  }
  return 'text';
}

function deriveColumns(rows: Row[]): DataColumn[] {
  const seen = new Map<string, DataColumn['type']>();
  for (const row of rows) {
    for (const [key, value] of Object.entries(row.frontmatter)) {
      if (!seen.has(key)) {
        seen.set(key, value != null ? inferType(value) : 'text');
      }
    }
  }
  return [...seen.entries()].map(([key, type]) => ({ kind: 'data', key, label: key, type }));
}

export class DatabaseView extends ItemView {
  private root: Root | null = null;
  private rows: Row[] = [];
  private unsubscribe: Unsubscribe | null = null;
  private folderIndex: FolderIndex | null = null;
  private dbConfigManager: DbConfigManager | null = null;
  private dbConfig: DbConfig | null = null;
  private readonly engine = new FormulaEngine();
  private folderPath = '';

  constructor(
    leaf: WorkspaceLeaf,
    private readonly plugin: ObsidianDBPlugin,
  ) {
    super(leaf);
  }

  getViewType(): string {
    return VIEW_TYPE_DATABASE;
  }

  getDisplayText(): string {
    return this.folderPath ? `DB: ${this.folderPath}` : 'ObsidianDB';
  }

  override getState(): Record<string, unknown> {
    return { folderPath: this.folderPath };
  }

  override async setState(state: Record<string, unknown>, result: ViewStateResult): Promise<void> {
    if (typeof state['folderPath'] === 'string') {
      this.folderPath = state['folderPath'];
    }
    await super.setState(state, result);
    await this.initData();
  }

  override async onOpen(): Promise<void> {
    const container = this.containerEl.children[1];
    if (!container) return;
    this.root = createRoot(container as HTMLElement);
  }

  override onClose(): Promise<void> {
    this.root?.unmount();
    this.root = null;
    this.unsubscribe?.();
    this.unsubscribe = null;
    this.folderIndex?.destroy();
    this.folderIndex = null;
    this.dbConfigManager = null;
    this.dbConfig = null;
    return Promise.resolve();
  }

  private async initData(): Promise<void> {
    if (!this.folderPath || !this.root) return;

    this.unsubscribe?.();
    this.unsubscribe = null;
    this.folderIndex?.destroy();

    const { vault, metadataCache, fileManager } = this.app;
    const useDataview = this.plugin.settings.useDataviewIfAvailable;
    this.folderIndex = useDataview
      ? new DataviewAdapter(this.app, vault, metadataCache, fileManager, this.folderPath)
      : new FrontmatterAdapter(vault, metadataCache, fileManager, this.folderPath);
    this.rows = this.folderIndex.getRows();

    this.dbConfigManager = new DbConfigManager(vault.adapter, this.folderPath);
    this.dbConfig = await this.dbConfigManager.load();

    this.unsubscribe = this.folderIndex.onRowChange(rows => {
      this.rows = rows;
      this.renderTable();
    });

    this.renderTable();
  }

  private renderTable(): void {
    if (!this.root || !this.folderIndex) return;
    const dataColumns = deriveColumns(this.rows);
    const formulaColumns = this.dbConfig?.formulaColumns ?? [];
    const columns = [...dataColumns, ...formulaColumns];
    this.root.render(
      React.createElement(DatabaseTable, {
        rows: this.rows,
        columns,
        engine: this.engine,
        app: this.app,
        onUpdate: (file, key, value) => this.folderIndex!.updateCell(file, key, value),
      }),
    );
  }
}
