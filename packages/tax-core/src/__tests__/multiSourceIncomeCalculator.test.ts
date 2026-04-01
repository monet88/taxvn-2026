/**
 * Tests for multiSourceIncomeCalculator
 */
import { describe, it, expect } from 'vitest';
import { calculateMultiSourceTax, createIncomeSource, getIncomeSourceOptions } from '../multiSourceIncomeCalculator';

describe('multiSourceIncomeCalculator', () => {
  it('getIncomeSourceOptions: trả về danh sách', () => {
    const opts = getIncomeSourceOptions();
    expect(opts.length).toBeGreaterThan(0);
    expect(opts[0]).toHaveProperty('value');
    expect(opts[0]).toHaveProperty('label');
  });

  it('createIncomeSource: tạo mới', () => {
    const source = createIncomeSource('salary');
    expect(source.type).toBe('salary');
    expect(source.id).toBeTruthy();
    expect(source.amount).toBe(0);
  });

  it('Happy: 1 nguồn lương 30M', () => {
    const salary = createIncomeSource('salary');
    salary.amount = 30_000_000;
    salary.frequency = 'monthly';

    const r = calculateMultiSourceTax({
      incomeSources: [salary],
      dependents: 0,
      hasInsurance: true,
      pensionContribution: 0,
      charitableContribution: 0,
      taxYear: 2026,
    });
    expect(r.totalGrossIncome).toBeGreaterThan(0);
    expect(r.totalTax).toBeGreaterThan(0);
  });

  it('Edge: không có nguồn nào', () => {
    const r = calculateMultiSourceTax({
      incomeSources: [],
      dependents: 0,
      hasInsurance: true,
      pensionContribution: 0,
      charitableContribution: 0,
      taxYear: 2026,
    });
    expect(r.totalGrossIncome).toBe(0);
    expect(r.totalTax).toBe(0);
  });
});
