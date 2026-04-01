/**
 * Tests for realEstateTransferTaxCalculator
 */
import { describe, it, expect } from 'vitest';
import {
  calculateRealEstateTransferTax,
  calculateTransferTax,
  checkExemption,
  calculateHoldingPeriod,
  estimateTransferTax,
  type RealEstateTransfer,
  type RealEstateTransferTaxInput,
} from '../realEstateTransferTaxCalculator';

function makeTransfer(overrides: Partial<RealEstateTransfer> = {}): RealEstateTransfer {
  return {
    id: 'test-1',
    propertyType: 'apartment',
    transferType: 'sale',
    propertyAddress: '123 Nguyen Hue, Q1, HCM',
    landArea: 60,
    buildingArea: 60,
    transferValue: 5_000_000_000, // 5 billion VND
    transferDate: '2026-06-15',
    relationship: 'none',
    isFirstHome: false,
    ...overrides,
  };
}

describe('calculateTransferTax', () => {
  it('Happy: standard sale at 5B VND pays 2% PIT + 0.5% registration', () => {
    const result = calculateTransferTax(makeTransfer());

    expect(result.pitAmount).toBe(Math.round(5_000_000_000 * 0.02));
    expect(result.registrationFee).toBe(Math.round(5_000_000_000 * 0.005));
    expect(result.totalFees).toBe(result.pitAmount + result.registrationFee);
    expect(result.netProceeds).toBe(5_000_000_000 - result.totalFees);
    expect(result.isExempt).toBe(false);
  });

  it('Boundary: family transfer between spouse is exempt', () => {
    const result = calculateTransferTax(
      makeTransfer({
        transferType: 'family',
        relationship: 'spouse',
      })
    );
    expect(result.isExempt).toBe(true);
    expect(result.pitAmount).toBe(0);
    expect(result.registrationFee).toBe(0);
    expect(result.exemptionAmount).toBeGreaterThan(0);
  });

  it('Boundary: inheritance from parent is exempt', () => {
    const result = calculateTransferTax(
      makeTransfer({
        transferType: 'inheritance',
        relationship: 'parent_child',
      })
    );
    expect(result.isExempt).toBe(true);
    expect(result.pitAmount).toBe(0);
  });

  it('Edge: zero transfer value results in zero tax', () => {
    const result = calculateTransferTax(makeTransfer({ transferValue: 0 }));
    expect(result.pitAmount).toBe(0);
    expect(result.registrationFee).toBe(0);
    expect(result.netProceeds).toBe(0);
  });
});

describe('checkExemption', () => {
  it('Gift from grandparent is exempt', () => {
    const { isExempt } = checkExemption(
      makeTransfer({ transferType: 'gift', relationship: 'grandparent' })
    );
    expect(isExempt).toBe(true);
  });

  it('Sale to unrelated party is not exempt', () => {
    const { isExempt } = checkExemption(
      makeTransfer({ transferType: 'sale', relationship: 'none' })
    );
    expect(isExempt).toBe(false);
  });
});

describe('calculateHoldingPeriod', () => {
  it('Calculates months correctly', () => {
    expect(calculateHoldingPeriod('2024-01-01', '2026-01-01')).toBe(24);
  });

  it('Returns 0 when no dates', () => {
    expect(calculateHoldingPeriod(undefined, '2026-01-01')).toBe(0);
  });
});

describe('calculateRealEstateTransferTax', () => {
  it('Summary aggregates multiple transfers', () => {
    const input: RealEstateTransferTaxInput = {
      transfers: [
        makeTransfer({ id: '1', transferValue: 3_000_000_000 }),
        makeTransfer({ id: '2', transferValue: 2_000_000_000 }),
      ],
    };
    const result = calculateRealEstateTransferTax(input);

    expect(result.transfers).toHaveLength(2);
    expect(result.summary.totalTransferValue).toBe(5_000_000_000);
    expect(result.summary.totalPIT).toBe(
      result.transfers.reduce((s, t) => s + t.pitAmount, 0)
    );
  });
});

describe('estimateTransferTax', () => {
  it('Quick estimate matches rates', () => {
    const est = estimateTransferTax(1_000_000_000);
    expect(est.pit).toBe(20_000_000);
    expect(est.registrationFee).toBe(5_000_000);
    expect(est.total).toBe(25_000_000);
  });

  it('Exempt estimate returns zeros', () => {
    const est = estimateTransferTax(1_000_000_000, true);
    expect(est.pit).toBe(0);
    expect(est.registrationFee).toBe(0);
    expect(est.total).toBe(0);
  });
});
