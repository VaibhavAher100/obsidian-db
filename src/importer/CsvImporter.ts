import Papa from 'papaparse';

export interface ParsedCsv {
  headers: string[];
  rows: Record<string, string>[];
  errors: string[];
}

export class CsvImporter {
  parse(csvText: string): ParsedCsv {
    if (csvText.trim() === '') {
      return { headers: [], rows: [], errors: [] };
    }

    const result = Papa.parse<Record<string, string>>(csvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
    });

    const headers: string[] = result.meta.fields ?? [];

    // papaparse omits fields entirely for short rows; normalise to '' for each header
    const rows: Record<string, string>[] = result.data.map(raw => {
      const normalised: Record<string, string> = {};
      for (const h of headers) {
        normalised[h] = raw[h] ?? '';
      }
      return normalised;
    });

    const errors: string[] = result.errors.map(e => e.message);

    return { headers, rows, errors };
  }
}
