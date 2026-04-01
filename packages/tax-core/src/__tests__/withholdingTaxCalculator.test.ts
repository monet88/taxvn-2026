/**
 * Tests for withholdingTaxCalculator
 */
import { describe, it, expect } from 'vitest';
import { calculateWithholdingTax, calculateForeignContractorTax } from '../withholdingTaxCalculator';

describe('calculateWithholdingTax', () => {
  it('Happy: resident, có HĐLĐ, lương', () => {
    const r = calculateWithholdingTax({
      paymentAmount: 30_000_000,
      incomeType: 'salary',
      residencyStatus: 'resident',
      hasLaborContract: true,
    });
    expect(r.withholdingAmount).toBeGreaterThanOrEqual(0);
    expect(r.paymentAmount).toBe(30_000_000);
  });

  it('Non-resident, dividend → khấu trừ', () => {
    const r = calculateWithholdingTax({
      paymentAmount: 20_000_000,
      incomeType: 'dividend',
      residencyStatus: 'non_resident',
    });
    expect(r.withholdingAmount).toBeGreaterThan(0);
    expect(r.requiresWithholding).toBe(true);
  });

  it('Edge: payment = 0', () => {
    const r = calculateWithholdingTax({
      paymentAmount: 0,
      incomeType: 'salary',
      residencyStatus: 'resident',
      hasLaborContract: true,
    });
    expect(r.withholdingAmount).toBe(0);
  });
});

describe('calculateForeignContractorTax', () => {
  it('Happy: contractor 100M dịch vụ', () => {
    const r = calculateForeignContractorTax({
      contractValue: 100_000_000,
      contractType: 'service',
      hasVATRegistration: false,
    });
    expect(r.vatAmount).toBeGreaterThan(0);
    expect(r.pitAmount).toBeGreaterThan(0);
    expect(r.totalTax).toBe(r.vatAmount + r.pitAmount);
  });
});
