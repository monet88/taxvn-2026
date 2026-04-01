/**
 * Tests for freelancerCalculator
 */
import { describe, it, expect } from 'vitest';
import {
  calculateFreelancerComparison,
  calculateBreakEven,
  FREELANCER_TAX_RATE,
  type FreelancerInput,
} from '../freelancerCalculator';

function makeInput(overrides: Partial<FreelancerInput> = {}): FreelancerInput {
  return {
    grossIncome: 30_000_000,
    frequency: 'monthly',
    dependents: 0,
    hasInsurance: true,
    region: 1,
    useNewLaw: true,
    ...overrides,
  };
}

describe('calculateFreelancerComparison', () => {
  it('Happy: freelancer vs employee comparison at 30M monthly', () => {
    const result = calculateFreelancerComparison(makeInput());

    // Freelancer tax = 10% flat
    expect(result.freelancer.tax).toBeCloseTo(30_000_000 * FREELANCER_TAX_RATE, 0);
    expect(result.freelancer.net).toBeCloseTo(30_000_000 * 0.9, 0);
    expect(result.freelancer.effectiveRate).toBeCloseTo(10, 1);

    // Employee has progressive tax
    expect(result.employee.tax).toBeGreaterThanOrEqual(0);
    expect(result.employee.net).toBeGreaterThan(0);

    // Comparison values are consistent
    expect(result.comparison.netDifference).toBeCloseTo(
      result.freelancer.net - result.employee.net, 0
    );
    expect(result.comparison.freelancerBetter).toBe(result.comparison.netDifference > 0);
  });

  it('Happy: annual frequency normalizes correctly', () => {
    const result = calculateFreelancerComparison(
      makeInput({ grossIncome: 360_000_000, frequency: 'annual' })
    );
    // Annual 360M = 30M/month
    expect(result.gross).toBe(30_000_000);
    expect(result.annualGross).toBe(360_000_000);
    expect(result.freelancer.annualTax).toBeCloseTo(360_000_000 * FREELANCER_TAX_RATE, 0);
  });

  it('Boundary: at low income, employee has zero tax but insurance costs reduce net', () => {
    const result = calculateFreelancerComparison(makeInput({ grossIncome: 10_000_000 }));
    // At 10M, employee deductions (15.5M personal) exceed income -> 0 tax
    // But employee insurance (10.5%) > freelancer flat tax (10%)
    expect(result.employee.tax).toBe(0);
    expect(result.freelancer.tax).toBeGreaterThan(0);
    // Freelancer is still better because 10% < 10.5% insurance
    expect(result.comparison.freelancerBetter).toBe(true);
  });

  it('Edge: zero income results in zero for both', () => {
    const result = calculateFreelancerComparison(makeInput({ grossIncome: 0 }));
    expect(result.freelancer.tax).toBe(0);
    expect(result.freelancer.net).toBe(0);
    expect(result.employee.tax).toBe(0);
  });

  it('Edge: negative income clamped to zero', () => {
    const result = calculateFreelancerComparison(makeInput({ grossIncome: -5_000_000 }));
    expect(result.gross).toBe(0);
    expect(result.freelancer.tax).toBe(0);
  });
});

describe('calculateBreakEven', () => {
  it('Break-even returns a non-negative number', () => {
    const breakEven = calculateBreakEven(0, true, 1, true);
    // With insurance (10.5%) > freelancer tax (10%), freelancer is always better
    // so break-even converges near 0
    expect(breakEven).toBeGreaterThanOrEqual(0);
    expect(breakEven).toBeLessThan(500_000_000);
  });

  it('More dependents shift break-even higher or equal', () => {
    const be0 = calculateBreakEven(0, true, 1, true);
    const be2 = calculateBreakEven(2, true, 1, true);
    // With dependents, employee gets more deductions, so break-even may shift
    expect(be2).toBeGreaterThanOrEqual(be0);
  });
});
