import { Modal, Notice, type App } from 'obsidian';
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

  private sanitizeSlug(raw: string): string {
    return raw
      .replace(/[/\\]/g, '-')
      .replace(/\.\./g, '-')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase()
      .replace(/^-+|-+$/g, '') || 'row';
  }

  private async runImport(file: File): Promise<void> {
    try {
      const text = await file.text();
      const { rows, headers } = new CsvImporter().parse(text);
      const firstHeader = headers[0] ?? '';

      // Build all slugs and preflight paths before creating anything
      const seen = new Set<string>();
      const plan: { row: Record<string, string>; filePath: string }[] = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]!;
        let slug = firstHeader && row[firstHeader]
          ? this.sanitizeSlug(row[firstHeader]!)
          : `row-${i}`;
        if (seen.has(slug)) slug = `${slug}-${i}`;
        seen.add(slug);

        const filePath = this.folderPath
          ? `${this.folderPath}/${slug}.md`
          : `${slug}.md`;

        if (this.app.vault.getAbstractFileByPath(filePath)) {
          throw new Error(`File already exists: ${filePath}`);
        }
        plan.push({ row, filePath });
      }

      // All paths clear — create files and populate frontmatter safely
      let created = 0;
      for (const { row, filePath } of plan) {
        const noteFile = await this.app.vault.create(filePath, '');
        await this.app.fileManager.processFrontMatter(noteFile, fm => {
          for (const h of headers) {
            fm[h] = row[h] ?? '';
          }
        });
        created++;
      }

      new Notice(`Imported ${created} row${created !== 1 ? 's' : ''}`);
      this.close();
    } catch (err) {
      new Notice(`Import failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}
