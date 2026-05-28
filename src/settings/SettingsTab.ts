import { App, Notice, PluginSettingTab, Setting } from 'obsidian';
import type ObsidianDBPlugin from '../main';

export class SettingsTab extends PluginSettingTab {
  constructor(app: App, private plugin: ObsidianDBPlugin) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName('Use Dataview when available')
      .setDesc('When the Dataview plugin is installed, use it for faster indexing of large vaults.')
      .addToggle(toggle =>
        toggle
          .setValue(this.plugin.settings.useDataviewIfAvailable)
          .onChange(async value => {
            this.plugin.settings.useDataviewIfAvailable = value;
            await this.plugin.saveSettings();
            new Notice('Reopen database tabs for this change to take effect.');
          }),
      );

    new Setting(containerEl)
      .setName('Default date format')
      .setDesc('Format string used when displaying date columns (e.g. YYYY-MM-DD).')
      .addText(text =>
        text
          .setPlaceholder('YYYY-MM-DD')
          .setValue(this.plugin.settings.defaultDateFormat)
          .onChange(async value => {
            this.plugin.settings.defaultDateFormat = value.trim();
            await this.plugin.saveSettings();
          }),
      );
  }
}
