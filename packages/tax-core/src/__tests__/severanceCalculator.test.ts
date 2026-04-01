/**
 * Tests for severanceCalculator
 */
import { describe, it, expect } from 'vitest';
import { calculateSeveranceTax, estimateSeveranceAmount, estimateJobLossAmount } from '../severanceCalculator';

describe('severanceCalculator', () => {
  it('Happy: severance thôi việc 100M', () => {
    const r = calculateSeveranceTax({
      type: 'severance',
      totalAmount: 100_000_000,
      averageSalary: 20_000_000,
      yearsWorked: 5,
    });
    expect(r.taxableIncome).toBeGreaterThanOrEqual(0);
    expect(r.taxAmount).toBeGreaterThanOrEqual(0);
  });

  it('estimateSeveranceAmount: 10 năm * 20M', () => {
    const amount = estimateSeveranceAmount(10, 20_000_000);
    expect(amount).toBeGreaterThan(0);
  });

  it('estimateJobLossAmount: 10 năm', () => {
    const amount = estimateJobLossAmount(10, 20_000_000);
    expect(amount).toBeGreaterThan(0);
  });

  it('Edge: 0 năm → trợ cấp = 0', () => {
    const amount = estimateSeveranceAmount(0, 30_000_000);
    expect(amount).toBe(0);
  });
});
