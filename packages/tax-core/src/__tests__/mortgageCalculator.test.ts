/**
 * Tests for mortgageCalculator
 */
import { describe, it, expect } from 'vitest';
import { calculatePMT, calculateNotaryFee } from '../mortgageCalculator';

describe('mortgageCalculator', () => {
  it('PMT: 2.1 tỷ (70% of 3B), 7%/năm, 20 năm', () => {
    // annualRate as percentage, e.g. 7.0
    const pmt = calculatePMT(2_100_000_000, 7.0, 20 * 12);
    // Khoảng 16-17M/tháng
    expect(pmt).toBeGreaterThan(14_000_000);
    expect(pmt).toBeLessThan(20_000_000);
  });

  it('PMT: lãi suất = 0 → trả đều', () => {
    const pmt = calculatePMT(120_000_000, 0, 12);
    expect(pmt).toBeCloseTo(10_000_000, 0);
  });

  it('calculateNotaryFee: nhà 3 tỷ', () => {
    const fee = calculateNotaryFee(3_000_000_000);
    expect(fee).toBeGreaterThan(0);
    expect(fee).toBeLessThan(10_000_000);
  });

  it('Edge: principal = 0 → PMT = 0', () => {
    const pmt = calculatePMT(0, 7.0, 240);
    expect(pmt).toBe(0);
  });
});
