/**
 * Tests for annualSettlementCalculator
 */
import { describe, it, expect } from 'vitest';
import {
  calculateAnnualSettlement,
  estimateSettlement,
  validateSettlementInput,
  createDefaultMonthlyIncome,
  getLawForMonth,
  type AnnualSettlementInput,
  type DependentInfo,
} from '../annualSettlementCalculator';
import { DEFAULT_INSURANCE_OPTIONS } from '../taxCalculator';

// Helper: create full-year input with uniform salary
function makeInput(
  year: 2025 | 2026,
  monthlySalary: number,
  deps: DependentInfo[] = [],
  opts: Partial<AnnualSettlementInput> = {}
): AnnualSettlementInput {
  return {
    year,
    monthlyIncome: createDefaultMonthlyIncome(monthlySalary),
    dependents: deps,
    charitableContributions: 0,
    voluntaryPension: 0,
    insuranceOptions: DEFAULT_INSURANCE_OPTIONS,
    region: 1,
    ...opts,
  };
}

// ===== getLawForMonth =====
describe('getLawForMonth', () => {
  it('2025 any month returns old law', () => {
    expect(getLawForMonth(2025, 1)).toBe('old');
    expect(getLawForMonth(2025, 6)).toBe('old');
    expect(getLawForMonth(2025, 12)).toBe('old');
  });

  it('2026 any month returns new law (unified from 01/01/2026)', () => {
    expect(getLawForMonth(2026, 1)).toBe('new');
    expect(getLawForMonth(2026, 6)).toBe('new');
    expect(getLawForMonth(2026, 12)).toBe('new');
  });
});

// ===== calculateAnnualSettlement =====
describe('calculateAnnualSettlement', () => {
  it('Happy: standard annual settlement for 2025 with 30M salary', () => {
    const input = makeInput(2025, 30_000_000);
    const result = calculateAnnualSettlement(input);

    expect(result.year).toBe(2025);
    expect(result.isTransitionYear).toBe(false);
    expect(result.totalGrossIncome).toBe(30_000_000 * 12);
    expect(result.annualTaxDue).toBeGreaterThan(0);
    expect(result.monthlyBreakdown).toHaveLength(12);
    expect(result.settlementType).toBeDefined();
  });

  it('Happy: 2026 uses new law deductions uniformly', () => {
    const input = makeInput(2026, 30_000_000);
    const result = calculateAnnualSettlement(input);

    expect(result.year).toBe(2026);
    // All monthly breakdowns should use new law
    result.monthlyBreakdown.forEach((m) => {
      expect(m.law).toBe('new');
    });
    // New law has higher personal deduction (15.5M vs 11M) so lower tax
    const input2025 = makeInput(2025, 30_000_000);
    const result2025 = calculateAnnualSettlement(input2025);
    expect(result.annualTaxDue).toBeLessThan(result2025.annualTaxDue);
  });

  it('Boundary: with dependents registered for partial year', () => {
    const deps: DependentInfo[] = [
      { id: 'dep1', name: 'Child', fromMonth: 6, toMonth: 12 },
    ];
    const input = makeInput(2025, 30_000_000, deps);
    const result = calculateAnnualSettlement(input);

    // Dependent registered for 7 months (6-12)
    expect(result.dependentSummary.count).toBe(1);
    expect(result.dependentSummary.totalMonths).toBe(7);
    expect(result.totalDependentDeduction).toBeGreaterThan(0);
  });

  it('Edge: zero income all year results in zero tax', () => {
    const input = makeInput(2025, 0);
    const result = calculateAnnualSettlement(input);

    expect(result.totalGrossIncome).toBe(0);
    expect(result.annualTaxDue).toBe(0);
    expect(result.totalTaxableIncome).toBe(0);
  });

  it('Settlement type pay when tax paid < tax due', () => {
    const input = makeInput(2025, 30_000_000);
    // No tax paid at all
    const result = calculateAnnualSettlement(input);

    expect(result.totalTaxPaid).toBe(0);
    expect(result.difference).toBeGreaterThan(0);
    expect(result.settlementType).toBe('pay');
  });

  it('Settlement type refund when manualTaxPaid exceeds due', () => {
    const input = makeInput(2025, 30_000_000, [], {
      manualTaxPaid: 999_999_999,
    });
    const result = calculateAnnualSettlement(input);

    expect(result.difference).toBeLessThan(0);
    expect(result.settlementType).toBe('refund');
  });
});

// ===== estimateSettlement =====
describe('estimateSettlement', () => {
  it('Quick estimate returns consistent values', () => {
    const est = estimateSettlement(2025, 30_000_000, 10_000_000, 1);
    expect(est.estimatedTaxDue).toBeGreaterThan(0);
    expect(est.estimatedDifference).toBe(
      est.estimatedTaxDue - est.estimatedTaxPaid
    );
  });
});

// ===== validateSettlementInput =====
describe('validateSettlementInput', () => {
  it('Valid input returns no errors', () => {
    const input = makeInput(2025, 30_000_000);
    const errors = validateSettlementInput(input);
    expect(errors).toHaveLength(0);
  });

  it('Invalid year returns error', () => {
    const errors = validateSettlementInput({ year: 2020 as any });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('Negative salary returns error', () => {
    const input = makeInput(2025, 30_000_000);
    input.monthlyIncome[0].grossSalary = -1;
    const errors = validateSettlementInput(input);
    expect(errors.length).toBeGreaterThan(0);
  });
});
