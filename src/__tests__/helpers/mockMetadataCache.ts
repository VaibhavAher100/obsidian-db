import type { MetadataCache, TFile } from 'obsidian';

type FrontmatterMap = Record<string, Record<string, unknown>>;

export function createMockMetadataCache(frontmatterByPath: FrontmatterMap) {
  const listeners: Map<string, Set<(...args: unknown[]) => void>> = new Map();

  // No explicit Pick<MetadataCache> annotation — Obsidian's overloaded on() signature
  // conflicts with our generic (...args: unknown[]) handler. FrontmatterAdapter uses
  // a narrow CacheDep interface that this inferred type satisfies.
  const cache = {
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

  const trigger = (event: string, ...args: unknown[]) => {
    listeners.get(event)?.forEach(cb => cb(...args));
  };

  return { cache, trigger };
}
