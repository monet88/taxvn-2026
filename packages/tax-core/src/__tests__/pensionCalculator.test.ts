/**
 * Tests for pensionCalculator
 */
import { describe, it, expect } from 'vitest';
import { calculateRetirementAge, calculateBaseRate, calculateEarlyRetirementDeduction } from '../pensionCalculator';

describe('pensionCalculator', () => {
  it('Happy: nam sinh 1970 → tuổi nghỉ hưu', () => {
    const r = calculateRetirementAge(1970, 'male');
    expect(r.years).toBeGreaterThan(60);
  });

  it('Happy: nữ sinh 1970 → tuổi nghỉ hưu', () => {
    const r = calculateRetirementAge(1970, 'female');
    expect(r.years).toBeGreaterThan(55);
  });

  it('calculateBaseRate: 20 năm đóng BHXH — nam', () => {
    const rate = calculateBaseRate(20, 'male');
    expect(rate).toBe(0.45); // 45%
  });

  it('calculateBaseRate: 30 năm — nam', () => {
    const rate = calculateBaseRate(30, 'male');
    // 45% + (30-20)*2% = 45% + 20% = 65%
    expect(rate).toBeCloseTo(0.65, 2);
  });

  it('Edge: nghỉ sớm 2 năm → trừ 4%', () => {
    const deduction = calculateEarlyRetirementDeduction(2);
    expect(deduction).toBe(0.04); // 2% * 2 năm
  });

  it('Edge: 0 năm nghỉ sớm → 0 trừ', () => {
    expect(calculateEarlyRetirementDeduction(0)).toBe(0);
  });
});
