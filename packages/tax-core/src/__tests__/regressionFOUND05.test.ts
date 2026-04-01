/**
 * Regression test: FOUND-05
 * MAX_MONTHLY_INCOME must be defined in tax-core (not imported from @/utils/inputSanitizers)
 * and used by grossNetCalculator's binary search
 */
import { describe, it, expect } from 'vitest';
import { grossToNet, netToGross } from '../grossNetCalculator';

describe('FOUND-05: MAX_MONTHLY_INCOME in tax-core', () => {
  it('grossToNet handles very large income without referencing external inputSanitizers', () => {
    // If MAX_MONTHLY_INCOME were missing, the binary search would fail
    // or produce garbage results for large incomes
    const result = grossToNet({
      amount: 500_000_000,
      type: 'gross',
      dependents: 0,
      hasInsurance: true,
      useNewLaw: true,
      region: 1,
    });

    expect(result.gross).toBe(500_000_000);
    expect(result.net).toBeGreaterThan(0);
    expect(result.net).toBeLessThan(500_000_000);
    expect(result.tax).toBeGreaterThan(0);
  });

  it('netToGross binary search converges for large NET values', () => {
    const result = netToGross({
      amount: 300_000_000,
      type: 'net',
      dependents: 0,
      hasInsurance: true,
      useNewLaw: true,
      region: 1,
    });

    expect(result.gross).toBeGreaterThan(300_000_000);
    expect(result.net).toBeCloseTo(300_000_000, -3); // within 1K VND
  });
});
