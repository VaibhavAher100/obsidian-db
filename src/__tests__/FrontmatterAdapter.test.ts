import { describe, it, expect, vi } from 'vitest';
import type { TFile } from 'obsidian';
import { FrontmatterAdapter } from '../indexer/FrontmatterAdapter';
import { createMockVault } from './helpers/mockVault';
import { createMockMetadataCache } from './helpers/mockMetadataCache';
import { createMockFileManager } from './helpers/mockFileManager';

function makeFile(path: string): TFile {
  return { path, basename: path.split('/').pop()!.replace('.md', '') } as TFile;
}

describe('FrontmatterAdapter', () => {
  // ── getRows ──────────────────────────────────────────────────────────────

  it('getRows returns [] when folder has no .md files', () => {
    const vault = createMockVault([]);
    const { cache } = createMockMetadataCache({});
    const { mock: fm } = createMockFileManager();

    const adapter = new FrontmatterAdapter(vault, cache, fm, 'notes/');
    expect(adapter.getRows()).toEqual([]);
  });

  it('getRows returns one Row per .md file with frontmatter', () => {
    const file = makeFile('notes/alpha.md');
    const vault = createMockVault([file]);
    const { cache } = createMockMetadataCache({ 'notes/alpha.md': { title: 'Alpha', rating: 5 } });
    const { mock: fm } = createMockFileManager();

    const adapter = new FrontmatterAdapter(vault, cache, fm, 'notes/');
    const rows = adapter.getRows();

    expect(rows).toHaveLength(1);
    expect(rows[0]!.file).toBe(file);
    expect(rows[0]!.frontmatter).toEqual({ title: 'Alpha', rating: 5 });
  });

  it('getRows returns all files when folderPath is the vault root', () => {
    const a = makeFile('a.md');
    const b = makeFile('notes/b.md');
    const vault = createMockVault([a, b]);
    const { cache } = createMockMetadataCache({ 'a.md': { x: 1 }, 'notes/b.md': { x: 2 } });
    const { mock: fm } = createMockFileManager();

    const adapter = new FrontmatterAdapter(vault, cache, fm, '');
    expect(adapter.getRows()).toHaveLength(2);
  });

  it('getRows ignores .md files outside the target folder', () => {
    const inside = makeFile('notes/a.md');
    const outside = makeFile('archive/b.md');
    const vault = createMockVault([inside, outside]);
    const { cache } = createMockMetadataCache({
      'notes/a.md': { x: 1 },
      'archive/b.md': { x: 2 },
    });
    const { mock: fm } = createMockFileManager();

    const adapter = new FrontmatterAdapter(vault, cache, fm, 'notes/');
    const rows = adapter.getRows();

    expect(rows).toHaveLength(1);
    expect(rows[0]!.file.path).toBe('notes/a.md');
  });

  it('getRows returns empty frontmatter {} for files with no frontmatter block', () => {
    const file = makeFile('notes/empty.md');
    const vault = createMockVault([file]);
    const { cache } = createMockMetadataCache({}); // no entry for this path

    const { mock: fm } = createMockFileManager();

    const adapter = new FrontmatterAdapter(vault, cache, fm, 'notes/');
    const rows = adapter.getRows();

    expect(rows).toHaveLength(1);
    expect(rows[0]!.frontmatter).toEqual({});
  });

  it('getRows Zod-validates frontmatter and does not throw on exotic values', () => {
    const file = makeFile('notes/exotic.md');
    const vault = createMockVault([file]);
    const { cache } = createMockMetadataCache({
      'notes/exotic.md': { nested: { a: [1, 2] }, flag: true, n: 42 },
    });
    const { mock: fm } = createMockFileManager();

    const adapter = new FrontmatterAdapter(vault, cache, fm, 'notes/');
    expect(() => adapter.getRows()).not.toThrow();
    const rows = adapter.getRows();
    expect(rows[0]!.frontmatter['flag']).toBe(true);
  });

  // ── onRowChange ──────────────────────────────────────────────────────────

  it('onRowChange fires when a file inside the folder changes', () => {
    const file = makeFile('notes/a.md');
    const vault = createMockVault([file]);
    const { cache, trigger } = createMockMetadataCache({ 'notes/a.md': { x: 1 } });
    const { mock: fm } = createMockFileManager();

    const adapter = new FrontmatterAdapter(vault, cache, fm, 'notes/');
    const cb = vi.fn();
    adapter.onRowChange(cb);

    trigger('changed', file);

    expect(cb).toHaveBeenCalledOnce();
  });

  it('onRowChange does NOT fire for files outside the folder', () => {
    const inside = makeFile('notes/a.md');
    const outside = makeFile('archive/b.md');
    const vault = createMockVault([inside]);
    const { cache, trigger } = createMockMetadataCache({ 'notes/a.md': { x: 1 } });
    const { mock: fm } = createMockFileManager();

    const adapter = new FrontmatterAdapter(vault, cache, fm, 'notes/');
    const cb = vi.fn();
    adapter.onRowChange(cb);

    trigger('changed', outside);

    expect(cb).not.toHaveBeenCalled();
  });

  it('onRowChange unsubscribe stops future callbacks', () => {
    const file = makeFile('notes/a.md');
    const vault = createMockVault([file]);
    const { cache, trigger } = createMockMetadataCache({ 'notes/a.md': { x: 1 } });
    const { mock: fm } = createMockFileManager();

    const adapter = new FrontmatterAdapter(vault, cache, fm, 'notes/');
    const cb = vi.fn();
    const unsub = adapter.onRowChange(cb);

    unsub();
    trigger('changed', file);

    expect(cb).not.toHaveBeenCalled();
  });

  it('onRowChange fires on a deleted event so the table drops removed files', () => {
    const file = makeFile('notes/a.md');
    const vault = createMockVault([file]);
    const { cache, trigger } = createMockMetadataCache({ 'notes/a.md': { x: 1 } });
    const { mock: fm } = createMockFileManager();

    const adapter = new FrontmatterAdapter(vault, cache, fm, 'notes/');
    const cb = vi.fn();
    adapter.onRowChange(cb);

    trigger('deleted', file);

    expect(cb).toHaveBeenCalledOnce();
  });

  // ── updateCell ───────────────────────────────────────────────────────────

  it('updateCell calls processFrontMatter with the new key/value', async () => {
    const file = makeFile('notes/a.md');
    const vault = createMockVault([file]);
    const { cache } = createMockMetadataCache({ 'notes/a.md': { rating: 3 } });
    const { mock: fm, calls } = createMockFileManager();

    const adapter = new FrontmatterAdapter(vault, cache, fm, 'notes/');
    await adapter.updateCell(file, 'rating', 5);

    expect(calls).toHaveLength(1);
    expect(calls[0]!.key).toBe('rating');
    expect(calls[0]!.value).toBe(5);
  });

  // ── destroy ──────────────────────────────────────────────────────────────

  it('destroy removes all MetadataCache listeners so callbacks no longer fire', () => {
    const file = makeFile('notes/a.md');
    const vault = createMockVault([file]);
    const { cache, trigger } = createMockMetadataCache({ 'notes/a.md': { x: 1 } });
    const { mock: fm } = createMockFileManager();

    const adapter = new FrontmatterAdapter(vault, cache, fm, 'notes/');
    const cb = vi.fn();
    adapter.onRowChange(cb);

    adapter.destroy();
    trigger('changed', file);

    expect(cb).not.toHaveBeenCalled();
  });
});
