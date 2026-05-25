import { Plugin } from 'obsidian';
import type { PluginSettings } from './types';
import { DEFAULT_SETTINGS } from './types';

// Entry point - implementation added in Phase 1 (FolderIndex) and Phase 3 (DatabaseView)

export default class ObsidianDBPlugin extends Plugin {
  settings: PluginSettings = DEFAULT_SETTINGS;

  override async onload(): Promise<void> {
    await this.loadSettings();
    // DatabaseView registration and commands added in Phase 3
  }

  override onunload(): void {
    // Cleanup added alongside each registered component
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData()) as PluginSettings;
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }
}
