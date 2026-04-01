/**
 * Tests for securitiesTaxCalculator
 */
import { describe, it, expect } from 'vitest';
import {
  calculateTransactionTax,
  calculateDividendTax,
  calculateBondInterestTax,
  type SecuritiesTransaction,
  type DividendEntry,
  type BondInterestEntry,
} from '../securitiesTaxCalculator';

describe('calculateTransactionTax', () => {
  const baseTxn: SecuritiesTransaction = {
    id: 'tx-1',
    symbol: 'VNM',
    type: 'listed',
    buyPrice: 80_000,
    sellPrice: 100_000,
    quantity: 1000,
    buyDate: new Date('2026-01-15'),
    sellDate: new Date('2026-06-15'),
    buyFeeRate: 0.0015,
    sellFeeRate: 0.0015,
  };

  it('Happy: CK niêm yết — có tax > 0', () => {
    const r = calculateTransactionTax(baseTxn);
    expect(r.tax).toBeGreaterThan(0);
    expect(r.sellValue).toBe(100_000 * 1000);
  });

  it('Boundary: sellPrice = buyPrice → vẫn tính thuế trên giá bán', () => {
    const r = calculateTransactionTax({ ...baseTxn, sellPrice: 80_000 });
    expect(r.sellValue).toBe(80_000 * 1000);
  });

  it('Edge: quantity = 0', () => {
    const r = calculateTransactionTax({ ...baseTxn, quantity: 0 });
    expect(r.tax).toBe(0);
  });
});

describe('calculateDividendTax', () => {
  const baseDividend: DividendEntry = {
    id: 'div-1',
    symbol: 'VNM',
    company: 'Vinamilk',
    dividendPerShare: 1_000,
    shares: 10_000,
    exDate: '2026-06-01',
    taxWithheld: 0,
  };

  it('Happy: cổ tức 10M → thuế 5%', () => {
    const r = calculateDividendTax(baseDividend);
    // grossDividend = 1000 * 10000 = 10M
    expect(r.grossDividend).toBe(10_000_000);
    expect(r.tax).toBeCloseTo(500_000, 0);
    expect(r.taxRate).toBe(5);
  });

  it('Edge: cổ tức = 0', () => {
    const r = calculateDividendTax({ ...baseDividend, shares: 0 });
    expect(r.tax).toBe(0);
  });
});

describe('calculateBondInterestTax', () => {
  const baseBond: BondInterestEntry = {
    id: 'bond-1',
    bondName: 'TP DN XYZ',
    bondType: 'corporate',
    interestReceived: 5_000_000,
    maturityDate: new Date('2027-01-01'),
  };

  it('Happy: TPDN 5M → thuế 5%', () => {
    const r = calculateBondInterestTax(baseBond);
    expect(r.tax).toBeCloseTo(250_000, 0);
  });

  it('Edge: TPCP miễn thuế', () => {
    const r = calculateBondInterestTax({ ...baseBond, bondType: 'government' });
    expect(r.tax).toBe(0);
  });
});
