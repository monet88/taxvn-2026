/**
 * Tests for coupleTaxOptimizer
 */
import { describe, it, expect } from 'vitest';
import {
  optimizeCoupleTax,
  type CoupleInput,
  type PersonIncome,
} from '../coupleTaxOptimizer';

function makePerson(name: string, gross: number): PersonIncome {
  return {
    name,
    grossIncome: gross,
    hasInsurance: true,
    pensionContribution: 0,
    otherDeductions: 0,
  };
}

function makeInput(overrides: Partial<CoupleInput> = {}): CoupleInput {
  return {
    person1: makePerson('Chong', 40_000_000),
    person2: makePerson('Vo', 20_000_000),
    totalDependents: 2,
    charitableContribution: 0,
    voluntaryPension: 0,
    ...overrides,
  };
}

describe('optimizeCoupleTax', () => {
  it('Happy: two-income couple with 2 dependents finds optimal allocation', () => {
    const result = optimizeCoupleTax(makeInput());

    // Should have (totalDependents + 1) scenarios
    expect(result.allScenarios).toHaveLength(3); // 0/2, 1/1, 2/0
    expect(result.optimalScenario).toBeDefined();
    expect(result.currentScenario).toBeDefined();

    // Optimal should have lowest total tax
    for (const scenario of result.allScenarios) {
      expect(result.optimalScenario.totalTax).toBeLessThanOrEqual(scenario.totalTax);
    }

    expect(result.combinedGrossIncome).toBe(60_000_000);
    expect(result.effectiveTaxRate).toBeGreaterThanOrEqual(0);
  });

  it('Happy: higher earner gets more dependents for optimal tax', () => {
    const result = optimizeCoupleTax(makeInput());

    // With 40M vs 20M income, assigning dependents to higher earner
    // should yield lower total tax (higher marginal rate = more savings)
    const allDepsToHigher = result.allScenarios.find(
      (s) => s.person1Dependents === 2
    );
    const allDepsToLower = result.allScenarios.find(
      (s) => s.person2Dependents === 2
    );
    expect(allDepsToHigher).toBeDefined();
    expect(allDepsToLower).toBeDefined();
    // Higher earner gets more savings per dependent
    expect(allDepsToHigher!.totalTax).toBeLessThanOrEqual(allDepsToLower!.totalTax);
  });

  it('Boundary: zero dependents means only 1 scenario', () => {
    const result = optimizeCoupleTax(makeInput({ totalDependents: 0 }));
    expect(result.allScenarios).toHaveLength(1);
    expect(result.optimalScenario.person1Dependents).toBe(0);
    expect(result.optimalScenario.person2Dependents).toBe(0);
  });

  it('Edge: both incomes zero results in zero tax', () => {
    const result = optimizeCoupleTax(
      makeInput({
        person1: makePerson('A', 0),
        person2: makePerson('B', 0),
      })
    );
    expect(result.optimalScenario.totalTax).toBe(0);
    expect(result.combinedGrossIncome).toBe(0);
  });

  it('Tips are generated with categories', () => {
    const result = optimizeCoupleTax(makeInput());
    expect(result.tips.length).toBeGreaterThan(0);
    for (const tip of result.tips) {
      expect(['dependent', 'deduction', 'timing', 'structure']).toContain(tip.category);
    }
  });
});
