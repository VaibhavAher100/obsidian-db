import type { TFile, Vault } from 'obsidian';

// Minimal Vault-shaped object for tests.
// Extend as needed when new Vault methods are called in tests.

export function createMockVault(files: TFile[]): Pick<Vault, 'getMarkdownFiles' | 'read' | 'create' | 'modify'> {
  return {
    getMarkdownFiles: () => files,
    read: async (_file: TFile) => '',
    create: async (path: string, content: string) => {
      // Returns a minimal TFile stub
      return { path, basename: path.split('/').pop()?.replace('.md', '') ?? '' } as TFile;
    },
    modify: async (_file: TFile, _content: string) => undefined,
  };
}
