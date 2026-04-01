/**
 * Regression test: FOUND-07
 * inheritanceGiftTaxCalculator must use formatNumber from ./taxCalculator
 * (the tax-core local module), NOT from @/lib/taxCalculator (the web app module).
 * This ensures the package is self-contained.
 */
import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { formatNumber } from '../taxCalculator';

describe('FOUND-07: inheritanceGiftTaxCalculator uses local formatNumber', () => {
  it('Does not import formatNumber from @/lib/taxCalculator', () => {
    const filePath = path.resolve(__dirname, '..', 'inheritanceGiftTaxCalculator.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    // Must NOT import from @/lib/
    expect(content).not.toMatch(/@\/lib\/taxCalculator/);
    expect(content).not.toMatch(/@\/lib\//);
  });

  it('Imports formatNumber from a relative path (local tax-core)', () => {
    const filePath = path.resolve(__dirname, '..', 'inheritanceGiftTaxCalculator.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    // Must import formatNumber from a relative path like ./taxCalculator or ./utils
    const hasRelativeImport = /import\s*\{[^}]*formatNumber[^}]*\}\s*from\s*['"]\.\//m.test(content);
    expect(hasRelativeImport).toBe(true);
  });

  it('formatNumber from tax-core works correctly for currency formatting', () => {
    // Verify the formatNumber function resolves correctly via ESM import
    expect(formatNumber(1_234_567)).toMatch(/1.*234.*567/);
    expect(formatNumber(0)).toBeDefined();
    expect(formatNumber(null)).toBeDefined();
    expect(formatNumber(undefined)).toBeDefined();
  });
});
