import { describe, it, expect, vi } from 'vitest';
import { DbConfigManager } from '../config/DbConfigManager';
import type { VaultDep } from '../config/DbConfigManager';

const FOLDER = 'notes/projects';
const CONFIG_PATH = 'notes/projects/.obsidian-db.json';

function makeVault(overrides: Partial<VaultDep> = {}): VaultDep {
  return {
    read: vi.fn().mockRejectedValue(new Error('file not found')),
    write: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('DbConfigManager', () => {
  describe('load()', () => {
    it('returns empty config when file does not exist', async () => {
      const vault = makeVault({
        read: vi.fn().mockRejectedValue(new Error('file not found')),
      });
      const mgr = new DbConfigManager(vault, FOLDER);
      const config = await mgr.load();
      expect(config).toEqual({ formulaColumns: [] });
    });

    it('returns empty config when file contains invalid JSON', async () => {
      const vault = makeVault({
        read: vi.fn().mockResolvedValue('not valid json {{'),
      });
      const mgr = new DbConfigManager(vault, FOLDER);
      const config = await mgr.load();
      expect(config).toEqual({ formulaColumns: [] });
    });

    it('returns empty config when JSON does not match schema', async () => {
      const vault = makeVault({
        read: vi.fn().mockResolvedValue(JSON.stringify({ formulaColumns: 'wrong type' })),
      });
      const mgr = new DbConfigManager(vault, FOLDER);
      const config = await mgr.load();
      expect(config).toEqual({ formulaColumns: [] });
    });

    it('parses and returns a valid config', async () => {
      const raw = {
        formulaColumns: [
          { kind: 'formula', key: 'total', label: 'Total', formula: '=SUM(price)' },
        ],
      };
      const vault = makeVault({
        read: vi.fn().mockResolvedValue(JSON.stringify(raw)),
      });
      const mgr = new DbConfigManager(vault, FOLDER);
      const config = await mgr.load();
      expect(config.formulaColumns).toHaveLength(1);
      expect(config.formulaColumns[0]?.key).toBe('total');
      expect(config.formulaColumns[0]?.formula).toBe('=SUM(price)');
    });

    it('parses optional fields when present', async () => {
      const raw = {
        formulaColumns: [],
        columnOrder: ['name', 'price'],
        hiddenColumns: ['secret'],
        pinnedColumns: ['name'],
      };
      const vault = makeVault({
        read: vi.fn().mockResolvedValue(JSON.stringify(raw)),
      });
      const mgr = new DbConfigManager(vault, FOLDER);
      const config = await mgr.load();
      expect(config.columnOrder).toEqual(['name', 'price']);
      expect(config.hiddenColumns).toEqual(['secret']);
      expect(config.pinnedColumns).toEqual(['name']);
    });
  });

  describe('save()', () => {
    it('calls vault.write with the correct path', async () => {
      const write = vi.fn().mockResolvedValue(undefined);
      const vault = makeVault({ write });
      const mgr = new DbConfigManager(vault, FOLDER);
      await mgr.save({ formulaColumns: [] });
      expect(write).toHaveBeenCalledOnce();
      const [calledPath] = write.mock.calls[0] as [string, string];
      expect(calledPath).toBe(CONFIG_PATH);
    });

    it('serializes the config as JSON', async () => {
      const write = vi.fn().mockResolvedValue(undefined);
      const vault = makeVault({ write });
      const mgr = new DbConfigManager(vault, FOLDER);
      const config = {
        formulaColumns: [
          { kind: 'formula' as const, key: 'sum', label: 'Sum', formula: '=SUM(x)' },
        ],
      };
      await mgr.save(config);
      const [, content] = write.mock.calls[0] as [string, string];
      const parsed = JSON.parse(content) as unknown;
      expect(parsed).toEqual(config);
    });

    it('serializes optional fields when present', async () => {
      const write = vi.fn().mockResolvedValue(undefined);
      const vault = makeVault({ write });
      const mgr = new DbConfigManager(vault, FOLDER);
      const config = {
        formulaColumns: [],
        columnOrder: ['a', 'b'],
      };
      await mgr.save(config);
      const [, content] = write.mock.calls[0] as [string, string];
      const parsed = JSON.parse(content) as { columnOrder?: string[] };
      expect(parsed.columnOrder).toEqual(['a', 'b']);
    });
  });
});
