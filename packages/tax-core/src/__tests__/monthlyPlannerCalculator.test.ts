/**
 * Tests for monthlyPlannerCalculator
 */
import { describe, it, expect } from 'vitest';
import {
  calculateMonthlyPlan,
  createDefaultMonths,
  type MonthlyPlannerInput,
  type MonthlyEntry,
} from '../monthlyPlannerCalculator';

function makeInput(overrides: Partial<MonthlyPlannerInput> = {}): MonthlyPlannerInput {
  return {
    baseSalary: 30_000_000,
    months: createDefaultMonths(),
    dependents: 0,
    hasInsurance: true,
    region: 1,
    ...overrides,
  };
}

describe('calculateMonthlyPlan', () => {
  it('Happy: 12 months uniform salary produces consistent results', () => {
    const result = calculateMonthlyPlan(makeInput());

    expect(result.months).toHaveLength(12);
    expect(result.summary.totalGross).toBe(30_000_000 * 12);

    // All months should have the same tax (uniform salary)
    const firstTax = result.months[0].tax;
    result.months.forEach((m) => {
      expect(m.tax).toBeCloseTo(firstTax, 0);
    });

    // Difference between actual and uniform should be near zero
    expect(Math.abs(result.summary.taxDifference)).toBeLessThan(1);
  });

  it('Happy: bonus month increases that month tax', () => {
    const months = createDefaultMonths();
    months[11].bonus = 30_000_000; // 30M bonus in December
    const result = calculateMonthlyPlan(makeInput({ months }));

    // December should have higher gross and tax
    const decResult = result.months[11];
    const janResult = result.months[0];
    expect(decResult.gross).toBe(60_000_000);
    expect(decResult.tax).toBeGreaterThan(janResult.tax);
  });

  it('Happy: variable income costs more tax than uniform (tax difference > 0)', () => {
    const months = createDefaultMonths();
    months[0].bonus = 60_000_000; // Big bonus in Jan
    // Total gross is 30M*12 + 60M = 420M
    // If spread uniformly: 35M/month
    const result = calculateMonthlyPlan(makeInput({ months }));

    // Progressive tax means variable income costs MORE tax
    expect(result.summary.taxDifference).toBeGreaterThan(0);
  });

  it('Boundary: zero base salary with all zeros results in zero tax', () => {
    const result = calculateMonthlyPlan(makeInput({ baseSalary: 0 }));

    expect(result.summary.totalGross).toBe(0);
    expect(result.summary.totalTax).toBe(0);
    expect(result.summary.totalNet).toBe(0);
  });

  it('Edge: fewer than 12 months pads remaining with defaults', () => {
    const shortMonths: MonthlyEntry[] = [
      { bonus: 0, overtime: 0, otherIncome: 0 },
    ];
    const result = calculateMonthlyPlan(makeInput({ months: shortMonths }));

    expect(result.months).toHaveLength(12);
  });

  it('Summary effective rate is tax / gross percentage', () => {
    const result = calculateMonthlyPlan(makeInput());

    const expectedRate = (result.summary.totalTax / result.summary.totalGross) * 100;
    expect(result.summary.effectiveRate).toBeCloseTo(expectedRate, 2);
  });
});
