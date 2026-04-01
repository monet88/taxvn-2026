/**
 * Tests for businessFormComparisonCalculator
 */
import { describe, it, expect } from 'vitest';
import {
  compareBusinessForms,
  type BusinessFormComparisonInput,
} from '../businessFormComparisonCalculator';

function makeInput(overrides: Partial<BusinessFormComparisonInput> = {}): BusinessFormComparisonInput {
  return {
    annualRevenue: 360_000_000, // 30M/month
    expenseRatio: 0.3,
    businessCategory: 'services',
    region: 1,
    dependents: 0,
    hasSelfInsurance: true,
    ...overrides,
  };
}

describe('compareBusinessForms', () => {
  it('Happy: compare three business forms at 360M/year revenue', () => {
    const result = compareBusinessForms(makeInput());

    // All three forms should have results
    expect(result.employee).toBeDefined();
    expect(result.freelancer).toBeDefined();
    expect(result.householdBusiness).toBeDefined();
    expect(result.recommendation).toBeDefined();
    expect(['employee', 'freelancer', 'household']).toContain(result.recommendation);

    // All net incomes should be positive
    expect(result.employee.netIncome).toBeGreaterThan(0);
    expect(result.freelancer.netIncome).toBeGreaterThan(0);
    expect(result.householdBusiness.netIncome).toBeGreaterThan(0);

    // Summary text should be present
    expect(result.summary.length).toBeGreaterThan(0);
  });

  it('Happy: freelancer pays flat 10% tax', () => {
    const result = compareBusinessForms(makeInput());
    // Freelancer withholding is 10%
    expect(result.freelancer.withholdingTax).toBeCloseTo(360_000_000 * 0.10, 0);
    expect(result.freelancer.effectiveTaxRate).toBeCloseTo(0.10, 4);
  });

  it('Boundary: household business below 500M threshold is exempt', () => {
    const result = compareBusinessForms(makeInput({ annualRevenue: 400_000_000 }));
    expect(result.householdBusiness.isExempt).toBe(true);
    expect(result.householdBusiness.totalTax).toBe(0);
  });

  it('Boundary: household business above 500M threshold pays tax', () => {
    const result = compareBusinessForms(makeInput({ annualRevenue: 600_000_000 }));
    expect(result.householdBusiness.isExempt).toBe(false);
    expect(result.householdBusiness.totalTax).toBeGreaterThan(0);
  });

  it('Edge: zero revenue results in zero or near-zero taxes', () => {
    const result = compareBusinessForms(makeInput({ annualRevenue: 0 }));
    expect(result.employee.taxAmount).toBe(0);
    expect(result.freelancer.withholdingTax).toBe(0);
    expect(result.householdBusiness.totalTax).toBe(0);
  });

  it('Savings vs employee calculated correctly', () => {
    const result = compareBusinessForms(makeInput());
    expect(result.savingsVsEmployee.freelancer).toBeCloseTo(
      result.freelancer.netIncome - result.employee.netIncome, 0
    );
    expect(result.savingsVsEmployee.householdBusiness).toBeCloseTo(
      result.householdBusiness.netIncome - result.employee.netIncome, 0
    );
  });
});
