/**
 * Tests for contentCreatorTaxCalculator
 */
import { describe, it, expect } from 'vitest';
import {
  calculateContentCreatorTax,
  getThreshold,
  getQuarterlySummary,
  type ContentCreatorInput,
  type PlatformIncome,
} from '../contentCreatorTaxCalculator';

function makePlatformIncome(
  platformId: string,
  total: number,
  withheld: number = 0
): PlatformIncome {
  const monthly = Array(12).fill(total / 12);
  return {
    platformId,
    monthlyIncome: monthly,
    totalIncome: total,
    withheldTax: withheld,
  };
}

function makeInput(overrides: Partial<ContentCreatorInput> = {}): ContentCreatorInput {
  return {
    year: 2026,
    platforms: [makePlatformIncome('youtube', 600_000_000)],
    hasOtherIncome: false,
    isRegisteredBusiness: false,
    ...overrides,
  };
}

describe('getThreshold', () => {
  it('2025 threshold is 100M', () => {
    expect(getThreshold(2025)).toBe(100_000_000);
  });

  it('2026 threshold is 500M', () => {
    expect(getThreshold(2026)).toBe(500_000_000);
  });
});

describe('calculateContentCreatorTax', () => {
  it('Happy: income 600M above 2026 threshold pays 7% total tax', () => {
    const result = calculateContentCreatorTax(makeInput());

    expect(result.totalIncome).toBe(600_000_000);
    expect(result.isExempt).toBe(false);
    expect(result.vatAmount).toBeCloseTo(600_000_000 * 0.05, 0);
    expect(result.pitAmount).toBeCloseTo(600_000_000 * 0.02, 0);
    expect(result.totalTaxDue).toBeCloseTo(600_000_000 * 0.07, 0);
    expect(result.effectiveTaxRate).toBeCloseTo(7, 1);
  });

  it('Happy: income below threshold is exempt', () => {
    const result = calculateContentCreatorTax(
      makeInput({
        platforms: [makePlatformIncome('youtube', 400_000_000)],
      })
    );

    expect(result.isExempt).toBe(true);
    expect(result.totalTaxDue).toBe(0);
    expect(result.vatAmount).toBe(0);
    expect(result.pitAmount).toBe(0);
  });

  it('Boundary: income exactly at threshold is exempt', () => {
    const result = calculateContentCreatorTax(
      makeInput({
        platforms: [makePlatformIncome('youtube', 500_000_000)],
      })
    );
    expect(result.isExempt).toBe(true);
    expect(result.totalTaxDue).toBe(0);
  });

  it('Edge: zero income results in zero everything', () => {
    const result = calculateContentCreatorTax(
      makeInput({
        platforms: [makePlatformIncome('youtube', 0)],
      })
    );
    expect(result.totalIncome).toBe(0);
    expect(result.totalTaxDue).toBe(0);
    expect(result.effectiveTaxRate).toBe(0);
  });

  it('Withholding reduces remaining tax', () => {
    const withheld = 10_000_000;
    const result = calculateContentCreatorTax(
      makeInput({
        platforms: [makePlatformIncome('shopee', 600_000_000, withheld)],
      })
    );

    expect(result.totalWithheld).toBe(withheld);
    expect(result.remainingTax).toBe(result.totalTaxDue - withheld);
  });

  it('Monthly breakdown has 12 entries', () => {
    const result = calculateContentCreatorTax(makeInput());
    expect(result.monthlyBreakdown).toHaveLength(12);
  });

  it('Recommendations always include deadline reminder', () => {
    const result = calculateContentCreatorTax(makeInput());
    const deadlineRec = result.recommendations.find((r) => r.id === 'deadline');
    expect(deadlineRec).toBeDefined();
  });
});

describe('getQuarterlySummary', () => {
  it('Returns 4 quarters from monthly breakdown', () => {
    const result = calculateContentCreatorTax(makeInput());
    const quarterly = getQuarterlySummary(result.monthlyBreakdown);
    expect(quarterly).toHaveLength(4);
    expect(quarterly[0].quarter).toBe(1);
    expect(quarterly[3].quarter).toBe(4);
  });
});
