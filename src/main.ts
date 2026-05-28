import { Plugin } from 'obsidian';
import type { PluginSettings } from './types';
import { DEFAULT_SETTINGS } from './types';
import { PluginSettingsSchema } from './schemas';
import { DatabaseView, VIEW_TYPE_DATABASE } from './view/DatabaseView';
import { ImportModal } from './importer/ImportModal';
import { SettingsTab } from './settings/SettingsTab';

export default class ObsidianDBPlugin extends Plugin {
  settings: PluginSettings = DEFAULT_SETTINGS;
  private pendingFolderPath = '';

  override async onload(): Promise<void> {
    await this.loadSettings();

    this.registerView(
      VIEW_TYPE_DATABASE,
      leaf => new DatabaseView(leaf, this, this.pendingFolderPath),
    );

    this.addSettingTab(new SettingsTab(this.app, this));

    this.addCommand({
      id: 'open-as-database',
      name: 'Open folder as database',
      callback: () => { void this.openActiveFolderAsDatabase(); },
    });

    this.addCommand({
      id: 'import-csv',
      name: 'Import CSV into folder',
      callback: () => {
        const folder = this.app.workspace.getActiveFile()?.parent;
        if (!folder) return;
        new ImportModal(this.app, this, folder.path).open();
      },
    });
  }

  override onunload(): void {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_DATABASE);
  }

  private async openActiveFolderAsDatabase(): Promise<void> {
    const folder = this.app.workspace.getActiveFile()?.parent;
    if (!folder) return;
    this.pendingFolderPath = folder.path;
    const leaf = this.app.workspace.getLeaf(true);
    await leaf.setViewState({ type: VIEW_TYPE_DATABASE, active: true });
  }

  async loadSettings(): Promise<void> {
    const raw = (await this.loadData()) ?? {};
    const parsed = PluginSettingsSchema.safeParse({ ...DEFAULT_SETTINGS, ...(raw as object) });
    this.settings = parsed.success ? parsed.data : { ...DEFAULT_SETTINGS };
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }
}
