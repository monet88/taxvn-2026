/**
 * Tests for yearlyTaxCalculator
 */
import { describe, it, expect } from 'vitest';
import {
  calculateMonthlyTax,
  calculateYearlyTax,
  calculateTwoYearStrategy,
  compareStrategies,
  compareAllPresets,
  createUniformMonths,
  createBonusMonth,
  type YearScenario,
} from '../yearlyTaxCalculator';

function makeScenario(
  year: 2025 | 2026,
  salary: number,
  overrides: Partial<YearScenario> = {}
): YearScenario {
  return {
    id: `test-${year}`,
    name: `Test ${year}`,
    year,
    months: createUniformMonths(salary),
    bonusMonths: [],
    dependents: 0,
    hasInsurance: true,
    region: 1,
    ...overrides,
  };
}

describe('calculateMonthlyTax', () => {
  it('Happy: 2025 month uses old law', () => {
    const result = calculateMonthlyTax(
      { month: 1, grossIncome: 30_000_000 },
      2025, 0, true, 1
    );
    expect(result.usedLaw).toBe('old');
    expect(result.tax).toBeGreaterThan(0);
    expect(result.netIncome).toBeLessThan(30_000_000);
  });

  it('Happy: 2026 month uses new law', () => {
    const result = calculateMonthlyTax(
      { month: 1, grossIncome: 30_000_000 },
      2026, 0, true, 1
    );
    expect(result.usedLaw).toBe('new');
    expect(result.tax).toBeGreaterThan(0);
  });

  it('Edge: zero income produces zero tax', () => {
    const result = calculateMonthlyTax(
      { month: 1, grossIncome: 0 },
      2025, 0, true, 1
    );
    expect(result.tax).toBe(0);
    expect(result.netIncome).toBe(0);
  });
});

describe('calculateYearlyTax', () => {
  it('Happy: full year 2025 with 30M salary', () => {
    const result = calculateYearlyTax(makeScenario(2025, 30_000_000));

    expect(result.year).toBe(2025);
    expect(result.totalGross).toBe(30_000_000 * 12);
    expect(result.totalTax).toBeGreaterThan(0);
    expect(result.totalNet).toBeGreaterThan(0);
    expect(result.monthlyBreakdown).toHaveLength(12);
    expect(result.oldLawMonths).toBe(12);
    expect(result.newLawMonths).toBe(0);
  });

  it('Happy: 2026 with bonus month', () => {
    const result = calculateYearlyTax(
      makeScenario(2026, 30_000_000, {
        bonusMonths: [createBonusMonth(13, 30_000_000)],
      })
    );

    expect(result.monthlyBreakdown).toHaveLength(13); // 12 + 1 bonus
    expect(result.totalGross).toBe(30_000_000 * 13);
    expect(result.newLawMonths).toBe(13);
  });

  it('2026 uses new law, produces less tax than 2025', () => {
    const r2025 = calculateYearlyTax(makeScenario(2025, 30_000_000));
    const r2026 = calculateYearlyTax(makeScenario(2026, 30_000_000));

    expect(r2026.totalTax).toBeLessThan(r2025.totalTax);
  });
});

describe('calculateTwoYearStrategy', () => {
  it('Happy: combined two-year result', () => {
    const s2025 = makeScenario(2025, 30_000_000);
    const s2026 = makeScenario(2026, 30_000_000);
    const result = calculateTwoYearStrategy(s2025, s2026);

    expect(result.combinedGross).toBe(30_000_000 * 24);
    expect(result.combinedTax).toBe(
      result.year2025.totalTax + result.year2026.totalTax
    );
    expect(result.combinedNet).toBe(
      result.year2025.totalNet + result.year2026.totalNet
    );
    expect(result.combinedEffectiveRate).toBeGreaterThan(0);
  });
});

describe('compareStrategies', () => {
  it('Finds strategy with lowest tax', () => {
    const s1 = calculateTwoYearStrategy(
      makeScenario(2025, 30_000_000, {
        bonusMonths: [createBonusMonth(13, 30_000_000)],
      }),
      makeScenario(2026, 30_000_000)
    );
    const s2 = calculateTwoYearStrategy(
      makeScenario(2025, 30_000_000),
      makeScenario(2026, 30_000_000, {
        bonusMonths: [createBonusMonth(13, 30_000_000)],
      })
    );
    const comparison = compareStrategies([s1, s2]);

    expect(comparison.strategies).toHaveLength(2);
    expect([0, 1]).toContain(comparison.bestStrategy);
    expect(comparison.maxSavings).toBeGreaterThanOrEqual(0);
  });

  it('Edge: empty strategies array', () => {
    const comparison = compareStrategies([]);
    expect(comparison.bestStrategy).toBe(-1);
    expect(comparison.maxSavings).toBe(0);
  });
});

describe('compareAllPresets', () => {
  it('Happy: compare all 3 presets at 30M salary', () => {
    const comparison = compareAllPresets(30_000_000, 0, true, 1);
    expect(comparison.strategies).toHaveLength(3);
    expect(comparison.bestStrategy).toBeGreaterThanOrEqual(0);
    expect(comparison.description.length).toBeGreaterThan(0);
  });
});
