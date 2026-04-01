/**
 * Tests for rentalIncomeTaxCalculator
 */
import { describe, it, expect } from 'vitest';
import {
  getRentalThreshold,
  calculatePropertyTax,
  calculateRentalIncomeTax,
  createEmptyProperty,
  type RentalProperty,
} from '../rentalIncomeTaxCalculator';

describe('rentalIncomeTaxCalculator', () => {
  it('Ngưỡng 2025 = 100M', () => {
    expect(getRentalThreshold(2025)).toBe(100_000_000);
  });

  it('Ngưỡng 2026 = 500M', () => {
    expect(getRentalThreshold(2026)).toBe(500_000_000);
  });

  it('calculatePropertyTax: thuê 200M/năm (>100M threshold 2025)', () => {
    const prop = createEmptyProperty();
    prop.monthlyRent = 16_700_000;
    prop.occupiedMonths = 12;
    const totalAnnualRent = prop.monthlyRent * prop.occupiedMonths;
    const r = calculatePropertyTax(prop, totalAnnualRent, 2025);
    expect(r.annualRent).toBeGreaterThan(0);
    expect(r.deemedTotalTax).toBeGreaterThan(0);
  });

  it('calculateRentalIncomeTax: doanh thu < threshold → thuế = 0', () => {
    const prop = createEmptyProperty();
    prop.monthlyRent = 5_000_000;
    prop.occupiedMonths = 12;
    const r = calculateRentalIncomeTax({
      properties: [prop],
      useActualExpenses: false,
      year: 2025,
    });
    // 5M * 12 = 60M < 100M → not taxable
    expect(r.summary.totalDeemedTax).toBe(0);
  });

  it('Edge: monthlyRent = 0', () => {
    const prop = createEmptyProperty();
    const r = calculatePropertyTax(prop, 0, 2025);
    expect(r.deemedTotalTax).toBe(0);
  });
});
