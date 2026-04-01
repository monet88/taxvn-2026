/**
 * Tests for taxPlanningSimulator
 */
import { describe, it, expect } from 'vitest';
import {
  runSimulation,
  compareSimulations,
  generateSalaryAdjustmentScenarios,
  generateDependentChangeScenarios,
  calculateBonusTaxScenarios,
  generateMultiYearProjection,
  findOptimalBonusStrategy,
  calculateBreakEvenSalary,
  type SimulationBaseInput,
  type SimulationScenario,
} from '../taxPlanningSimulator';

const baseInput: SimulationBaseInput = {
  grossIncome: 30_000_000,
  dependents: 0,
  hasInsurance: true,
  region: 1,
  otherDeductions: 0,
  pensionContribution: 0,
};

describe('runSimulation', () => {
  it('Happy: baseline simulation produces old and new tax results', () => {
    const scenario: SimulationScenario = {
      id: 'baseline',
      name: 'Baseline',
      description: 'No change',
      input: {},
    };
    const result = runSimulation(baseInput, scenario);

    expect(result.oldTax.taxAmount).toBeGreaterThanOrEqual(0);
    expect(result.newTax.taxAmount).toBeGreaterThanOrEqual(0);
    // New law should be lower or equal tax
    expect(result.newTax.taxAmount).toBeLessThanOrEqual(result.oldTax.taxAmount);
    expect(result.difference.netIncome).toBe(
      result.newTax.netIncome - result.oldTax.netIncome
    );
  });
});

describe('generateSalaryAdjustmentScenarios', () => {
  it('Happy: percentage salary increase generates correct scenario', () => {
    const scenarios = generateSalaryAdjustmentScenarios(baseInput, [
      { adjustmentType: 'percentage', value: 20 },
    ]);
    expect(scenarios).toHaveLength(1);
    expect(scenarios[0].input.grossIncome).toBeCloseTo(30_000_000 * 1.2, 0);
  });

  it('Happy: absolute salary increase', () => {
    const scenarios = generateSalaryAdjustmentScenarios(baseInput, [
      { adjustmentType: 'amount', value: 5_000_000 },
    ]);
    expect(scenarios[0].input.grossIncome).toBe(35_000_000);
  });
});

describe('generateDependentChangeScenarios', () => {
  it('Adding dependent increases deduction', () => {
    const scenarios = generateDependentChangeScenarios(baseInput, [
      { changeType: 'add', count: 1 },
    ]);
    expect(scenarios).toHaveLength(1);
    expect(scenarios[0].input.dependents).toBe(1);
  });

  it('Removing from zero stays at zero', () => {
    const scenarios = generateDependentChangeScenarios(baseInput, [
      { changeType: 'remove', count: 1 },
    ]);
    expect(scenarios[0].input.dependents).toBe(0);
  });
});

describe('calculateBonusTaxScenarios', () => {
  it('Happy: bonus distribution generates 4 scenarios', () => {
    const results = calculateBonusTaxScenarios(baseInput, {
      annualBonus: 30_000_000,
    });

    // 4 strategies: one-time, split-12, split-2, split-4
    expect(results).toHaveLength(4);

    // Each has 12 monthly entries
    for (const r of results) {
      expect(r.monthlyTaxes).toHaveLength(12);
      expect(r.totalTax).toBeGreaterThan(0);
    }
  });

  it('Splitting bonus reduces total tax vs one-time', () => {
    const results = calculateBonusTaxScenarios(baseInput, {
      annualBonus: 60_000_000,
    });

    const oneTime = results[0]; // One-time
    const split12 = results[1]; // Split 12

    // Splitting evenly should produce less total tax (lower marginal rates)
    expect(split12.totalTax).toBeLessThanOrEqual(oneTime.totalTax);
  });
});

describe('findOptimalBonusStrategy', () => {
  it('Returns strategy with lowest total tax', () => {
    const results = calculateBonusTaxScenarios(baseInput, {
      annualBonus: 30_000_000,
    });
    const optimal = findOptimalBonusStrategy(results);
    expect(optimal).not.toBeNull();

    for (const r of results) {
      expect(optimal!.totalTax).toBeLessThanOrEqual(r.totalTax);
    }
  });

  it('Returns null for empty array', () => {
    expect(findOptimalBonusStrategy([])).toBeNull();
  });
});

describe('generateMultiYearProjection', () => {
  it('Happy: 3-year projection with salary increase', () => {
    const results = generateMultiYearProjection(baseInput, {
      yearsToProject: 3,
      annualSalaryIncrease: 10,
    });

    expect(results).toHaveLength(3);
    // First year salary unchanged
    expect(results[0].grossIncome).toBe(30_000_000);
    // Second year salary increased by 10%
    expect(results[1].grossIncome).toBe(33_000_000);
    // Third year compounded
    expect(results[2].grossIncome).toBeCloseTo(36_300_000, 0);

    // Tax savings (new vs old) should be >= 0
    for (const r of results) {
      expect(r.taxSavings).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('compareSimulations', () => {
  it('Impact correctly calculates changes', () => {
    const baseScenario: SimulationScenario = {
      id: 'base', name: 'Base', description: '', input: {},
    };
    const raiseScenario: SimulationScenario = {
      id: 'raise', name: 'Raise', description: '',
      input: { grossIncome: 40_000_000 },
    };

    const baseline = runSimulation(baseInput, baseScenario);
    const comparison = runSimulation(baseInput, raiseScenario);
    const result = compareSimulations(baseline, comparison, true);

    // Higher income = more tax
    expect(result.impact.taxChange).toBeGreaterThan(0);
    // Higher income = more net
    expect(result.impact.netIncomeChange).toBeGreaterThan(0);
    expect(result.impact.yearlyBenefit).toBe(-result.impact.taxChange * 12);
  });
});

describe('calculateBreakEvenSalary', () => {
  it('Returns reasonable bracket info', () => {
    const result = calculateBreakEvenSalary(baseInput);
    expect(result.currentBracket).toBeGreaterThan(0);
    expect(result.marginalRate).toBeGreaterThanOrEqual(0);
  });
});
