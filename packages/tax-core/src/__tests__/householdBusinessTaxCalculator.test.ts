/**
 * Tests for householdBusinessTaxCalculator
 */
import { describe, it, expect } from 'vitest';
import { getRevenueThreshold, getIncomeTaxRate2026, getIncomeTaxBracketLabel } from '../householdBusinessTaxCalculator';

describe('householdBusinessTaxCalculator', () => {
  it('Ngưỡng 2025: 100M', () => {
    expect(getRevenueThreshold(2025)).toBe(100_000_000);
  });

  it('Ngưỡng 2026: 500M', () => {
    expect(getRevenueThreshold(2026)).toBe(500_000_000);
  });

  it('Thuế suất 2026: doanh thu 1 tỷ → 15%', () => {
    const rate = getIncomeTaxRate2026(1_000_000_000);
    expect(rate).toBe(0.15);
  });

  it('getIncomeTaxBracketLabel: dưới ngưỡng', () => {
    expect(getIncomeTaxBracketLabel(300_000_000)).toBe('Dưới ngưỡng - Miễn thuế');
  });

  it('Edge: doanh thu = 0 → rate = 0', () => {
    const rate = getIncomeTaxRate2026(0);
    expect(rate).toBe(0);
  });
});
