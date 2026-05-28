import { TFile } from 'obsidian';
import type { App, FileManager, MetadataCache, Vault } from 'obsidian';
import type { FolderIndex, Row, Unsubscribe } from '../types';
import { FrontmatterAdapter } from './FrontmatterAdapter';
import { RowFrontmatterSchema } from '../schemas';

// DataviewAdapter implements FolderIndex using Dataview's Pages API when available.
// ADR 0001: Dataview is optional. Any API error silently falls back to FrontmatterAdapter.

type VaultDep = Pick<Vault, 'getMarkdownFiles'>;
type FileManagerDep = Pick<FileManager, 'processFrontMatter'>;

interface CacheDep {
  getFileCache: MetadataCache['getFileCache'];
  on(event: string, cb: (...args: unknown[]) => void): unknown;
  off(event: string, cb: (...args: unknown[]) => void): void;
}

type DvPageRecord = Record<string, unknown> & { file: { path: string } };
type DvApi = { pages(source: string): { values: DvPageRecord[] } };

function getDataviewApi(app: App): DvApi | undefined {
  const plugins = (app as unknown as { plugins?: { plugins?: Record<string, unknown> } })
    ?.plugins?.plugins;
  const dvPlugin = plugins?.['dataview'] as Record<string, unknown> | undefined;
  const api = dvPlugin?.['api'];
  if (typeof (api as Record<string, unknown> | undefined)?.['pages'] !== 'function') return undefined;
  return api as DvApi;
}

export class DataviewAdapter implements FolderIndex {
  private fallback: FrontmatterAdapter;
  private dvApi: DvApi | undefined;

  constructor(
    private app: App,
    vault: VaultDep,
    cache: CacheDep,
    fileManager: FileManagerDep,
    private folderPath: string,
  ) {
    // Cast vault to the narrower type FrontmatterAdapter needs (getMarkdownFiles only)
    this.fallback = new FrontmatterAdapter(
      vault as Pick<Vault, 'getMarkdownFiles'>,
      cache,
      fileManager,
      folderPath,
    );
    this.dvApi = getDataviewApi(app);
  }

  getRows(): Row[] {
    if (!this.dvApi) return this.fallback.getRows();
    try {
      const pages = this.dvApi.pages(`"${this.folderPath}"`);
      return pages.values.flatMap(page => {
        const tfile = this.app.vault.getAbstractFileByPath(page.file.path);
        if (!tfile || !(tfile instanceof TFile)) return []; // Dataview may briefly hold a path the vault has already removed
        const { file: _file, ...fm } = page;
        const result = RowFrontmatterSchema.safeParse(fm);
        return [{ file: tfile as TFile, frontmatter: result.success ? result.data : {} }];
      });
    } catch {
      return this.fallback.getRows();
    }
  }

  onRowChange(cb: (rows: Row[]) => void): Unsubscribe {
    if (!this.dvApi) return this.fallback.onRowChange(cb);
    const handler = () => cb(this.getRows());
    const mc = this.app.metadataCache as unknown as {
      on(event: string, cb: () => void): unknown;
      off(event: string, cb: () => void): void;
    };
    mc.on('dataview:metadata-change', handler);
    return () => mc.off('dataview:metadata-change', handler);
  }

  async updateCell(file: TFile, key: string, value: unknown): Promise<void> {
    return this.fallback.updateCell(file, key, value);
  }

  destroy(): void {
    this.fallback.destroy();
  }
}
