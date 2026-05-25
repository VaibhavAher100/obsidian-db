import type { FileManager, MetadataCache, TFile, Vault } from 'obsidian';
import type { FolderIndex, Row, Unsubscribe } from '../types';
import { FrontmatterAdapter } from './FrontmatterAdapter';

// DataviewAdapter implements FolderIndex using Dataview's Pages API when available.
// ADR 0001: Dataview is optional. Any API error silently falls back to FrontmatterAdapter.
//
// Phase 6 TODO: replace the FrontmatterAdapter delegation with real Dataview API calls:
//   const dv = (app as App & { plugins: { plugins: Record<string, unknown> } })
//                .plugins.plugins['dataview'] as DataviewApi | undefined;
//   if (!dv) throw new Error('Dataview not available');

type VaultDep = Pick<Vault, 'getMarkdownFiles'>;
type FileManagerDep = Pick<FileManager, 'processFrontMatter'>;

interface CacheDep {
  getFileCache: MetadataCache['getFileCache'];
  on(event: string, cb: (...args: unknown[]) => void): unknown;
  off(event: string, cb: (...args: unknown[]) => void): void;
}

export class DataviewAdapter implements FolderIndex {
  // Delegates to FrontmatterAdapter until Phase 6 wires up Dataview Pages API.
  private inner: FrontmatterAdapter;

  constructor(
    vault: VaultDep,
    cache: CacheDep,
    fileManager: FileManagerDep,
    folderPath: string,
  ) {
    this.inner = new FrontmatterAdapter(vault, cache, fileManager, folderPath);
  }

  getRows(): Row[] {
    return this.inner.getRows();
  }

  onRowChange(cb: (rows: Row[]) => void): Unsubscribe {
    return this.inner.onRowChange(cb);
  }

  async updateCell(file: TFile, key: string, value: unknown): Promise<void> {
    return this.inner.updateCell(file, key, value);
  }

  destroy(): void {
    this.inner.destroy();
  }
}
