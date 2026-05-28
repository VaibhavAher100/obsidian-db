import { Modal, type App } from 'obsidian';
import type ObsidianDBPlugin from '../main';
import { CsvImporter } from './CsvImporter';

export class ImportModal extends Modal {
  constructor(
    app: App,
    private plugin: ObsidianDBPlugin,
    private folderPath: string,
  ) {
    super(app);
  }

  override onOpen(): void {
    const { contentEl } = this;

    contentEl.createEl('h3', { text: 'Import CSV into folder' });

    const fileInput = contentEl.createEl('input', { type: 'file' });
    fileInput.accept = '.csv';

    const btn = contentEl.createEl('button', { text: 'Import' });
    btn.style.marginTop = '12px';

    btn.addEventListener('click', () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      void this.runImport(file);
    });
  }

  override onClose(): void {
    this.contentEl.empty();
  }

  private async runImport(file: File): Promise<void> {
    const text = await file.text();
    const { rows, headers } = new CsvImporter().parse(text);
    const firstHeader = headers[0] ?? '';

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]!;
      const rawName = firstHeader && row[firstHeader]
        ? row[firstHeader]!.replace(/\s+/g, '-').toLowerCase()
        : `row-${i}`;
      const fileName = `${rawName}.md`;
      const filePath = this.folderPath ? `${this.folderPath}/${fileName}` : fileName;

      const frontmatterLines = Object.entries(row)
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n');
      const content = `---\n${frontmatterLines}\n---\n`;

      await this.app.vault.create(filePath, content);
    }

    this.close();
  }
}
