// Minimal Obsidian API mock for Vitest.
// Only exports used in production code under test need to be here.

export class TFile {
  path = '';
  basename = '';
  extension = '';
  name = '';
  stat = { mtime: 0, ctime: 0, size: 0 };
  vault: unknown = null;
  parent: unknown = null;

  // Allow plain stat-shaped objects to pass instanceof checks in tests.
  static [Symbol.hasInstance](obj: unknown): boolean {
    return obj != null && typeof obj === 'object' && 'stat' in (obj as object);
  }
}
