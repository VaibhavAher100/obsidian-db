import type { FileManager, TFile } from 'obsidian';

type FrontmatterCallback = (fm: Record<string, unknown>) => void;

// Captures processFrontMatter calls for assertion in tests.

export function createMockFileManager() {
  const calls: Array<{ file: TFile; key: string; value: unknown }> = [];

  const mock: Pick<FileManager, 'processFrontMatter'> = {
    processFrontMatter: async (file: TFile, fn: FrontmatterCallback) => {
      const fm: Record<string, unknown> = {};
      fn(fm);
      // Record the mutation for test assertions
      for (const [k, v] of Object.entries(fm)) {
        calls.push({ file, key: k, value: v });
      }
    },
  };

  return { mock, calls };
}
