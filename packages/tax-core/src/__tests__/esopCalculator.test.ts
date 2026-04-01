/**
 * Tests for esopCalculator
 */
import { describe, it, expect } from 'vitest';
import { calculateESOPGain, calculateESOPTotalValue, calculateESOPComparison, type ESOPInput } from '../esopCalculator';

const base: ESOPInput = {
  grantPrice: 50_000,
  exercisePrice: 150_000,
  numberOfShares: 1000,
  dependents: 0,
  hasInsurance: true,
  region: 1,
  monthlySalary: 30_000_000,
};

describe('ESOP Calculator', () => {
  it('Happy: gain = (exercise - grant) * shares', () => {
    const gain = calculateESOPGain(base);
    expect(gain).toBe((150_000 - 50_000) * 1000);
  });

  it('Happy: total value = exercise * shares', () => {
    const total = calculateESOPTotalValue(base);
    expect(total).toBe(150_000 * 1000);
  });

  it('Comparison: có taxableGain = 100M', () => {
    const r = calculateESOPComparison(base);
    expect(r.taxableGain).toBe(100_000_000);
    expect(r.periods).toBeDefined();
    expect(r.periods.length).toBeGreaterThan(0);
  });

  it('Edge: exercisePrice = grantPrice → gain = 0', () => {
    const gain = calculateESOPGain({ ...base, exercisePrice: 50_000 });
    expect(gain).toBe(0);
  });
});
