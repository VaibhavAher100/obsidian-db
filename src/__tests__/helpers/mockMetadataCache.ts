import type { MetadataCache, TFile } from 'obsidian';

type FrontmatterMap = Record<string, Record<string, unknown>>;

// Minimal MetadataCache stub for tests.
// Pass a map of { [filePath]: frontmatter } to seed the cache.

export function createMockMetadataCache(frontmatterByPath: FrontmatterMap): Pick<
  MetadataCache,
  'getFileCache' | 'on' | 'off'
> {
  const listeners: Map<string, Set<(...args: unknown[]) => void>> = new Map();

  return {
    getFileCache: (file: TFile) => {
      const fm = frontmatterByPath[file.path];
      if (!fm) return null;
      return { frontmatter: fm } as ReturnType<MetadataCache['getFileCache']>;
    },
    on: (_event: string, cb: (...args: unknown[]) => void) => {
      if (!listeners.has(_event)) listeners.set(_event, new Set());
      listeners.get(_event)!.add(cb);
      return { id: Math.random() } as ReturnType<MetadataCache['on']>;
    },
    off: (_event: string, cb: (...args: unknown[]) => void) => {
      listeners.get(_event)?.delete(cb);
    },
  };
}
