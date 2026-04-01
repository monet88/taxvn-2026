/**
 * Regression test: FOUND-06
 * isSecondHalf2026 flag must NOT be present in any calculator interface or
 * function signature in tax-core. It should only exist in comments documenting removal.
 */
import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('FOUND-06: isSecondHalf2026 flag removed from active code', () => {
  it('No calculator source file uses isSecondHalf2026 as a code identifier', () => {
    const srcDir = path.resolve(__dirname, '..');
    const tsFiles = fs.readdirSync(srcDir).filter(
      (f) => f.endsWith('.ts') && !f.endsWith('.test.ts')
    );

    const violations: string[] = [];

    for (const file of tsFiles) {
      const content = fs.readFileSync(path.join(srcDir, file), 'utf-8');
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Skip comment-only lines (they document the removal)
        const trimmed = line.trim();
        if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) {
          continue;
        }
        // Check for active use of isSecondHalf2026
        if (line.includes('isSecondHalf2026')) {
          violations.push(`${file}:${i + 1}: ${trimmed}`);
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
