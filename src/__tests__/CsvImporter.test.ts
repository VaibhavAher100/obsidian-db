import { describe, it, expect } from 'vitest';
import { CsvImporter } from '../importer/CsvImporter';

describe('CsvImporter', () => {
  const importer = new CsvImporter();

  // Test 1: Parses headers from first row
  it('parses headers from first row', () => {
    const csv = 'name,age,city\nAlice,30,Berlin';
    const result = importer.parse(csv);
    expect(result.headers).toEqual(['name', 'age', 'city']);
  });

  // Test 2: Parses data rows as string-keyed objects
  it('parses data rows as string-keyed objects', () => {
    const csv = 'name,age\nAlice,30\nBob,25';
    const result = importer.parse(csv);
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0]).toEqual({ name: 'Alice', age: '30' });
    expect(result.rows[1]).toEqual({ name: 'Bob', age: '25' });
  });

  // Test 3: Returns empty rows array for header-only CSV
  it('returns empty rows array for header-only CSV', () => {
    const csv = 'name,age,city';
    const result = importer.parse(csv);
    expect(result.headers).toEqual(['name', 'age', 'city']);
    expect(result.rows).toEqual([]);
    expect(result.errors).toEqual([]);
  });

  // Test 4: Fills missing fields with empty string (short row)
  it('fills missing fields with empty string for short rows', () => {
    const csv = 'name,age,city\nAlice,30';
    const result = importer.parse(csv);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]).toEqual({ name: 'Alice', age: '30', city: '' });
  });

  // Test 5: Returns errors for malformed input (unclosed quote)
  it('returns errors for malformed input with unclosed quote', () => {
    const csv = 'name,age\n"Alice,30';
    const result = importer.parse(csv);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  // Test 6: Handles empty string input
  it('handles empty string input gracefully', () => {
    const result = importer.parse('');
    expect(result.headers).toEqual([]);
    expect(result.rows).toEqual([]);
    expect(result.errors).toEqual([]);
  });
});
