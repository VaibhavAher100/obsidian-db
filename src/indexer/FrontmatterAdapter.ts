import type { FileManager, MetadataCache, TFile, Vault } from 'obsidian';
import type { FolderIndex, Row, Unsubscribe } from '../types';
import { RowFrontmatterSchema } from '../schemas';

type VaultDep = Pick<Vault, 'getMarkdownFiles'>;
type FileManagerDep = Pick<FileManager, 'processFrontMatter'>;

// Narrow interface so tests don't need to satisfy Obsidian's overloaded on() signatures.
// The real MetadataCache satisfies this structurally at runtime.
interface CacheDep {
  getFileCache: MetadataCache['getFileCache'];
  on(event: string, cb: (...args: unknown[]) => void): unknown;
  off(event: string, cb: (...args: unknown[]) => void): void;
}

type Handler = (...args: unknown[]) => void;

export class FrontmatterAdapter implements FolderIndex {
  private handlers: Handler[] = [];

  constructor(
    private vault: VaultDep,
    private cache: CacheDep,
    private fileManager: FileManagerDep,
    private folderPath: string,
  ) {}

  getRows(): Row[] {
    return this.vault
      .getMarkdownFiles()
      .filter(f => this.isInFolder(f))
      .map(f => {
        const entry = this.cache.getFileCache(f);
        const raw: unknown = entry?.frontmatter ?? {};
        const result = RowFrontmatterSchema.safeParse(raw);
        return {
          file: f,
          frontmatter: result.success ? result.data : {},
        };
      });
  }

  onRowChange(cb: (rows: Row[]) => void): Unsubscribe {
    const handler: Handler = (...args: unknown[]) => {
      const file = args[0] as TFile;
      if (this.isInFolder(file)) {
        cb(this.getRows());
      }
    };

    this.cache.on('changed', handler);
    this.handlers.push(handler);

    return () => {
      this.cache.off('changed', handler);
      this.handlers = this.handlers.filter(h => h !== handler);
    };
  }

  async updateCell(file: TFile, key: string, value: unknown): Promise<void> {
    await this.fileManager.processFrontMatter(file, fm => {
      fm[key] = value;
    });
  }

  destroy(): void {
    for (const handler of this.handlers) {
      this.cache.off('changed', handler);
    }
    this.handlers = [];
  }

  private isInFolder(file: TFile): boolean {
    const prefix = this.folderPath.endsWith('/') ? this.folderPath : `${this.folderPath}/`;
    return file.path.startsWith(prefix);
  }
}
