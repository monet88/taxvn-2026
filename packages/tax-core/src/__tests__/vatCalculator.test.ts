/**
 * Tests for vatCalculator
 */
import { describe, it, expect } from 'vitest';
import { getStandardVATRate, calculateVATDeduction } from '../vatCalculator';

describe('vatCalculator', () => {
  it('getStandardVATRate trả về 8% hoặc 10%', () => {
    const rate = getStandardVATRate();
    expect([0.08, 0.10]).toContain(rate);
  });

  it('calculateVATDeduction: khấu trừ method — output > input', () => {
    const r = calculateVATDeduction({
      salesRevenue: 100_000_000,
      purchaseValue: 50_000_000,
      outputRate: 0.10,
      inputRate: 0.10,
      method: 'deduction',
    });
    // Output VAT = 100M * 10% = 10M
    // Input VAT = 50M * 10% = 5M
    // VAT payable = 10M - 5M = 5M
    expect(r.outputVAT).toBe(10_000_000);
    expect(r.inputVAT).toBe(5_000_000);
    expect(r.vatPayable).toBe(5_000_000);
  });

  it('calculateVATDeduction: input > output → vatRefundable > 0', () => {
    const r = calculateVATDeduction({
      salesRevenue: 50_000_000,
      purchaseValue: 120_000_000,
      outputRate: 0.10,
      inputRate: 0.10,
      method: 'deduction',
    });
    // Output = 5M, Input = 12M → refundable
    expect(r.vatRefundable).toBeGreaterThan(0);
    expect(r.vatPayable).toBe(0);
  });

  it('Edge: revenue = 0', () => {
    const r = calculateVATDeduction({
      salesRevenue: 0,
      purchaseValue: 0,
      outputRate: 0.10,
      inputRate: 0.10,
      method: 'deduction',
    });
    expect(r.outputVAT).toBe(0);
    expect(r.vatPayable).toBe(0);
  });
});
