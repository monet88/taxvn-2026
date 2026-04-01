/**
 * Tests for cryptoTaxCalculator
 */
import { describe, it, expect } from 'vitest';
import { calculateCryptoTax, type CryptoTransaction } from '../cryptoTaxCalculator';

const sellTxn: CryptoTransaction = {
  id: 'tx-1',
  date: new Date('2026-07-15'),
  type: 'sell',
  assetType: 'cryptocurrency',
  assetName: 'Bitcoin',
  quantity: 1,
  pricePerUnit: 100_000_000,
  totalValue: 100_000_000,
  fee: 0,
};

describe('cryptoTaxCalculator', () => {
  it('Happy: bán crypto 100M — có thuế', () => {
    const r = calculateCryptoTax({
      year: 2026,
      transactions: [sellTxn],
    });
    expect(r.totalTax).toBeGreaterThan(0);
    expect(r.totalSellValue).toBeGreaterThan(0);
  });

  it('Boundary: giá trị = 0', () => {
    const r = calculateCryptoTax({
      year: 2026,
      transactions: [{ ...sellTxn, totalValue: 0, pricePerUnit: 0 }],
    });
    expect(r.totalTax).toBe(0);
  });

  it('Edge: no transactions', () => {
    const r = calculateCryptoTax({ year: 2026, transactions: [] });
    expect(r.totalTax).toBe(0);
    expect(r.totalTransactions).toBe(0);
  });
});
