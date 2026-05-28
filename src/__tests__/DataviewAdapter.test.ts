import { describe, it, expect, vi } from 'vitest';
import type { TFile } from 'obsidian';
import { DataviewAdapter } from '../indexer/DataviewAdapter';

// Minimal TFile-shaped object with stat so TFile detection works
function makeFile(path: string): TFile {
  return {
    path,
    stat: { mtime: 0, ctime: 0, size: 0 },
    basename: path.split('/').pop()!.replace('.md', ''),
    extension: 'md',
    name: path.split('/').pop()!,
    vault: null as unknown as TFile['vault'],
    parent: null,
  } as unknown as TFile;
}

// Build a minimal App mock. Pass dvPluginApi=undefined to simulate "no Dataview".
function makeAppMock(dvPluginApi: unknown) {
  const listeners: Map<string, Set<() => void>> = new Map();
  const files: TFile[] = [makeFile('notes/a.md')];

  const app = {
    vault: {
      getMarkdownFiles: () => files,
      getAbstractFileByPath: (path: string) => {
        return files.find(f => f.path === path) ?? null;
      },
    },
    metadataCache: {
      getFileCache: (file: TFile) => {
        if (file.path === 'notes/a.md') return { frontmatter: { title: 'Alpha' } };
        return null;
      },
      on: (_event: string, cb: () => void) => {
        if (!listeners.has(_event)) listeners.set(_event, new Set());
        listeners.get(_event)!.add(cb);
        return {};
      },
      off: (_event: string, cb: () => void) => {
        listeners.get(_event)?.delete(cb);
      },
    },
    plugins: {
      plugins:
        dvPluginApi !== undefined
          ? { dataview: { api: dvPluginApi } }
          : {},
    },
  };

  const triggerMetadata = (event: string) => {
    listeners.get(event)?.forEach(cb => cb());
  };

  return { app, triggerMetadata };
}

// Minimal vault / cache / fileManager deps (FrontmatterAdapter)
function makeFallbackDeps() {
  const file = makeFile('notes/a.md');
  const vault = {
    getMarkdownFiles: () => [file],
  };
  const cache = {
    getFileCache: (_f: TFile) => ({ frontmatter: { title: 'Fallback' } }),
    on: vi.fn().mockReturnValue({}),
    off: vi.fn(),
  };
  const fileManager = {
    processFrontMatter: vi.fn().mockResolvedValue(undefined),
  };
  return { vault, cache, fileManager, file };
}

describe('DataviewAdapter', () => {
  // ── fallback (dvApi absent) ───────────────────────────────────────────────

  it('getRows() delegates to FrontmatterAdapter when dvApi is undefined', () => {
    const { app } = makeAppMock(undefined);
    const { vault, cache, fileManager } = makeFallbackDeps();

    const adapter = new DataviewAdapter(
      app as never,
      vault,
      cache,
      fileManager,
      'notes/',
    );
    const rows = adapter.getRows();

    // FrontmatterAdapter picks up 'notes/a.md' with title=Fallback
    expect(rows).toHaveLength(1);
    expect(rows[0]!.frontmatter['title']).toBe('Fallback');
  });

  it('onRowChange() delegates to FrontmatterAdapter when dvApi is undefined', () => {
    const { app } = makeAppMock(undefined);
    const { vault, cache, fileManager } = makeFallbackDeps();

    const adapter = new DataviewAdapter(
      app as never,
      vault,
      cache,
      fileManager,
      'notes/',
    );
    const cb = vi.fn();
    adapter.onRowChange(cb);

    // FrontmatterAdapter listens to 'changed' on cache
    expect(cache.on).toHaveBeenCalledWith('changed', expect.any(Function));
  });

  // ── Dataview present ──────────────────────────────────────────────────────

  it('getRows() calls dv.pages() and maps results when dvApi is present', () => {
    const dvFile = { path: 'notes/a.md' };
    const dvApi = {
      pages: vi.fn().mockReturnValue({
        values: [{ file: dvFile, title: 'DVTitle', rating: 9 }],
      }),
    };

    const { app } = makeAppMock(dvApi);
    const { vault, cache, fileManager } = makeFallbackDeps();

    const adapter = new DataviewAdapter(
      app as never,
      vault,
      cache,
      fileManager,
      'notes/',
    );
    const rows = adapter.getRows();

    expect(dvApi.pages).toHaveBeenCalledWith('"notes/"');
    expect(rows).toHaveLength(1);
    expect(rows[0]!.frontmatter['title']).toBe('DVTitle');
    expect(rows[0]!.frontmatter['rating']).toBe(9);
  });

  it('getRows() falls back silently when dvApi.pages() throws', () => {
    const dvApi = {
      pages: vi.fn().mockImplementation(() => {
        throw new Error('Dataview internal error');
      }),
    };

    const { app } = makeAppMock(dvApi);
    const { vault, cache, fileManager } = makeFallbackDeps();

    const adapter = new DataviewAdapter(
      app as never,
      vault,
      cache,
      fileManager,
      'notes/',
    );

    let rows: ReturnType<typeof adapter.getRows>;
    expect(() => {
      rows = adapter.getRows();
    }).not.toThrow();
    // Should fall back to FrontmatterAdapter result
    expect(rows!).toHaveLength(1);
    expect(rows![0]!.frontmatter['title']).toBe('Fallback');
  });

  it('onRowChange() subscribes to dataview:metadata-change when dvApi is present', () => {
    const dvApi = {
      pages: vi.fn().mockReturnValue({ values: [] }),
    };

    const { app, triggerMetadata } = makeAppMock(dvApi);
    const { vault, cache, fileManager } = makeFallbackDeps();

    const adapter = new DataviewAdapter(
      app as never,
      vault,
      cache,
      fileManager,
      'notes/',
    );
    const cb = vi.fn();
    adapter.onRowChange(cb);

    triggerMetadata('dataview:metadata-change');

    expect(cb).toHaveBeenCalledOnce();
  });

  it('onRowChange() unsubscribe removes dataview:metadata-change listener', () => {
    const dvApi = {
      pages: vi.fn().mockReturnValue({ values: [] }),
    };

    const { app, triggerMetadata } = makeAppMock(dvApi);
    const { vault, cache, fileManager } = makeFallbackDeps();

    const adapter = new DataviewAdapter(
      app as never,
      vault,
      cache,
      fileManager,
      'notes/',
    );
    const cb = vi.fn();
    const unsub = adapter.onRowChange(cb);

    unsub();
    triggerMetadata('dataview:metadata-change');

    expect(cb).not.toHaveBeenCalled();
  });

  // ── updateCell always delegates ───────────────────────────────────────────

  it('updateCell() always delegates to FrontmatterAdapter', async () => {
    const dvApi = {
      pages: vi.fn().mockReturnValue({ values: [] }),
    };

    const { app } = makeAppMock(dvApi);
    const { vault, cache, fileManager, file } = makeFallbackDeps();

    const adapter = new DataviewAdapter(
      app as never,
      vault,
      cache,
      fileManager,
      'notes/',
    );

    await adapter.updateCell(file, 'rating', 10);

    expect(fileManager.processFrontMatter).toHaveBeenCalledOnce();
  });
});
