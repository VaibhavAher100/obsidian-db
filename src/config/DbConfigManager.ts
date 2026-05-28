import type { DataAdapter } from 'obsidian';
import { DbConfigSchema } from '../schemas';
import type { DbConfig } from '../types';

// Narrow dependency - only the DataAdapter methods we actually use.
// Keeps tests simple: pass an inline object, no real Obsidian needed.
export type VaultDep = Pick<DataAdapter, 'read' | 'write'>;

export class DbConfigManager {
  private readonly configPath: string;

  constructor(
    private readonly vault: VaultDep,
    folderPath: string,
  ) {
    this.configPath = `${folderPath}/.obsidian-db.json`;
  }

  async load(): Promise<DbConfig> {
    let raw: string;
    try {
      raw = await this.vault.read(this.configPath);
    } catch {
      return { formulaColumns: [] };
    }

    let json: unknown;
    try {
      json = JSON.parse(raw) as unknown;
    } catch {
      return { formulaColumns: [] };
    }

    const result = DbConfigSchema.safeParse(json);
    return result.success ? result.data : { formulaColumns: [] };
  }

  async save(config: DbConfig): Promise<void> {
    await this.vault.write(this.configPath, JSON.stringify(config, null, 2));
  }
}
