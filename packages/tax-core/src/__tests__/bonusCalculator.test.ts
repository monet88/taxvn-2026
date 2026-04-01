/**
 * Tests for bonusCalculator
 */
import { describe, it, expect } from 'vitest';
import { calculateBonusComparison, type BonusInput } from '../bonusCalculator';

const base: BonusInput = {
  monthlySalary: 30_000_000,
  thirteenthMonthSalary: 30_000_000,
  tetBonus: 20_000_000,
  otherBonuses: 0,
  dependents: 0,
  region: 1,
  hasInsurance: true,
};

describe('calculateBonusComparison', () => {
  it('Happy: lương 30M + thưởng 50M', () => {
    const r = calculateBonusComparison(base);
    expect(r.scenarios).toHaveLength(3);
    expect(r.recommendation).toBeDefined();
    expect(r.maxSavings).toBeGreaterThanOrEqual(0);
  });

  it('Boundary: thưởng = 0 → không có thuế thưởng bổ sung', () => {
    const r = calculateBonusComparison({
      ...base,
      thirteenthMonthSalary: 0,
      tetBonus: 0,
      otherBonuses: 0,
    });
    expect(r.scenarios[0].totalBonus).toBe(0);
    expect(r.scenarios[0].additionalTax).toBe(0);
  });

  it('Edge: luật mới (scenarios[1]) có thuế thưởng ≤ luật cũ (scenarios[0])', () => {
    const r = calculateBonusComparison(base);
    // Scenario 0: dec-2025 (old), Scenario 1: h1-2026 (new)
    expect(r.scenarios[1].additionalTax).toBeLessThanOrEqual(r.scenarios[0].additionalTax);
  });
});
