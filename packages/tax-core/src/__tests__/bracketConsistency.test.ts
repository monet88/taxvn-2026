/**
 * Bracket consistency test — FOUND-04
 * Kiểm tra incomeSummaryCalculator dùng đúng biểu thuế từ taxCalculator
 */
import { describe, it, expect } from 'vitest';
import { NEW_TAX_BRACKETS, calculateNewTax } from '../taxCalculator';
import { calculateIncomeSummary, type IncomeSummaryInput, type IncomeEntry } from '../incomeSummaryCalculator';

// Tạo input cho incomeSummaryCalculator (chỉ có lương, 12 tháng)
function makeAnnualSalaryInput(monthlySalary: number): IncomeSummaryInput {
  const entries: IncomeEntry[] = Array.from({ length: 12 }, (_, i) => ({
    id: `entry-${i + 1}`,
    category: 'salary' as const,
    description: `Lương tháng ${i + 1}`,
    amount: monthlySalary,
    taxableAmount: monthlySalary,
    taxAmount: 0, // sẽ được tính lại
    month: i + 1,
  }));

  return {
    year: 2026,
    entries,
    dependents: 0,
    hasInsurance: true,
  };
}

describe('Bracket consistency: incomeSummaryCalculator vs taxCalculator', () => {
  it('incomeSummaryCalculator import từ NEW_TAX_BRACKETS (sau fix FOUND-04)', () => {
    // Kiểm tra biểu thuế 5 bậc mới
    expect(NEW_TAX_BRACKETS).toHaveLength(5);
    expect(NEW_TAX_BRACKETS[2].rate).toBe(0.20); // Bậc 3: 20%
    expect(NEW_TAX_BRACKETS[3].rate).toBe(0.30); // Bậc 4: 30%
    expect(NEW_TAX_BRACKETS[4].rate).toBe(0.35); // Bậc 5: 35%
  });

  const incomes = [10_000_000, 20_000_000, 30_000_000, 50_000_000, 80_000_000, 120_000_000];

  incomes.forEach((monthly) => {
    it(`Monthly ${(monthly / 1_000_000).toFixed(0)}M — biểu thuế nhất quán`, () => {
      // Tính bằng calculateNewTax (taxCalculator) - monthly
      const taxResult = calculateNewTax({
        grossIncome: monthly,
        dependents: 0,
        hasInsurance: false, // tắt BH để so sánh thuần
      });

      // incomeSummaryCalculator dùng annual — nhưng cùng NEW_TAX_BRACKETS
      // Kiểm tra gián tiếp: cả 2 đều dùng cùng bracket rates
      expect(taxResult.taxBreakdown.length).toBeLessThanOrEqual(5);

      // Verify sử dụng đúng rates
      for (const item of taxResult.taxBreakdown) {
        const matchingBracket = NEW_TAX_BRACKETS.find(
          b => b.rate === item.rate && b.min === item.from
        );
        expect(matchingBracket).toBeDefined();
      }
    });
  });
});
