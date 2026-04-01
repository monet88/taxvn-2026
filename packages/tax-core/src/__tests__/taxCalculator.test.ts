/**
 * Golden-output tests cho taxCalculator.ts
 * Bao gồm: calculateOldTax (7 bậc), calculateNewTax (5 bậc),
 *           calculateTaxForDate, getInsuranceDetailed
 */
import { describe, it, expect } from 'vitest';
import {
  calculateOldTax,
  calculateNewTax,
  calculateTaxForDate,
  getInsuranceDetailed,
  getTaxConfigForDate,
  OLD_TAX_BRACKETS,
  NEW_TAX_BRACKETS,
  OLD_DEDUCTIONS,
  NEW_DEDUCTIONS,
  MAX_SOCIAL_INSURANCE_SALARY,
  TOTAL_INSURANCE_RATE,
  calculateAllowancesBreakdown,
  DEFAULT_INSURANCE_OPTIONS,
  type TaxInput,
} from '../taxCalculator';

// ===== HELPER: Tạo input mặc định =====
function input(grossIncome: number, deps = 0): TaxInput {
  return { grossIncome, dependents: deps, hasInsurance: true, region: 1 };
}

// ===== CẤU TRÚC BIỂU THUẾ =====
describe('Bracket structure', () => {
  it('OLD_TAX_BRACKETS có 7 bậc', () => {
    expect(OLD_TAX_BRACKETS).toHaveLength(7);
  });

  it('NEW_TAX_BRACKETS có 5 bậc', () => {
    expect(NEW_TAX_BRACKETS).toHaveLength(5);
  });

  it('OLD brackets liên tục (max bậc trước = min bậc sau)', () => {
    for (let i = 0; i < OLD_TAX_BRACKETS.length - 1; i++) {
      expect(OLD_TAX_BRACKETS[i].max).toBe(OLD_TAX_BRACKETS[i + 1].min);
    }
  });

  it('NEW brackets liên tục', () => {
    for (let i = 0; i < NEW_TAX_BRACKETS.length - 1; i++) {
      expect(NEW_TAX_BRACKETS[i].max).toBe(NEW_TAX_BRACKETS[i + 1].min);
    }
  });

  it('Cả 2 biểu thuế đều kết thúc bằng Infinity', () => {
    expect(OLD_TAX_BRACKETS[OLD_TAX_BRACKETS.length - 1].max).toBe(Infinity);
    expect(NEW_TAX_BRACKETS[NEW_TAX_BRACKETS.length - 1].max).toBe(Infinity);
  });
});

// ===== calculateOldTax (7 bậc) =====
describe('calculateOldTax', () => {
  it('Thu nhập = 0 → thuế = 0', () => {
    const result = calculateOldTax(input(0));
    expect(result.taxAmount).toBe(0);
    expect(result.taxableIncome).toBe(0);
  });

  it('Thu nhập dưới giảm trừ bản thân → thuế = 0', () => {
    // 11M giảm trừ, lương 10M → bảo hiểm ~1.05M → taxable < 0 → 0
    const result = calculateOldTax(input(10_000_000));
    expect(result.taxAmount).toBe(0);
  });

  it('Thu nhập 20M - không phụ thuộc - có BHXH', () => {
    const result = calculateOldTax(input(20_000_000));
    // 20M - BHXH(10.5%) - 11M personal = taxable
    const insurance = 20_000_000 * TOTAL_INSURANCE_RATE;
    const taxable = 20_000_000 - insurance - OLD_DEDUCTIONS.personal;
    expect(result.taxableIncome).toBeCloseTo(taxable, 0);
    expect(result.taxAmount).toBeGreaterThan(0);
  });

  it('Thu nhập 30M - 1 phụ thuộc', () => {
    const result = calculateOldTax(input(30_000_000, 1));
    // 30M - BHXH - 11M - 4.4M
    const insurance = 30_000_000 * TOTAL_INSURANCE_RATE;
    const taxable = 30_000_000 - insurance - OLD_DEDUCTIONS.personal - OLD_DEDUCTIONS.dependent;
    expect(result.taxableIncome).toBeCloseTo(taxable, 0);
    expect(result.taxAmount).toBeGreaterThan(0);
  });

  it('Thu nhập 100M - 0 phụ thuộc (bậc cao)', () => {
    const result = calculateOldTax(input(100_000_000));
    // BHXH capped ở 46.8M
    const insurance = MAX_SOCIAL_INSURANCE_SALARY * 0.08 + MAX_SOCIAL_INSURANCE_SALARY * 0.015
      + Math.min(100_000_000, 99_200_000) * 0.01;
    expect(result.taxAmount).toBeGreaterThan(10_000_000);
    expect(result.effectiveRate).toBeGreaterThan(0);
  });

  it('BHXH bị cap tại 46.8M', () => {
    const result = calculateOldTax(input(50_000_000));
    // BHXH = 46.8M * 8% = 3,744,000
    expect(result.insuranceDetail.bhxh).toBe(MAX_SOCIAL_INSURANCE_SALARY * 0.08);
  });

  it('netIncome = grossIncome - insurance - tax (khi không có phụ cấp)', () => {
    const result = calculateOldTax(input(25_000_000));
    expect(result.netIncome).toBeCloseTo(
      result.grossIncome - result.insuranceDeduction - result.taxAmount, 0
    );
  });
});

// ===== calculateNewTax (5 bậc) =====
describe('calculateNewTax', () => {
  it('Thu nhập = 0 → thuế = 0', () => {
    const result = calculateNewTax(input(0));
    expect(result.taxAmount).toBe(0);
  });

  it('Thu nhập dưới giảm trừ mới 15.5M → thuế = 0', () => {
    const result = calculateNewTax(input(15_000_000));
    expect(result.taxAmount).toBe(0);
  });

  it('Thu nhập 30M - 0 phụ thuộc', () => {
    const result = calculateNewTax(input(30_000_000));
    const insurance = 30_000_000 * TOTAL_INSURANCE_RATE;
    const taxable = 30_000_000 - insurance - NEW_DEDUCTIONS.personal;
    expect(result.taxableIncome).toBeCloseTo(taxable, 0);
    expect(result.taxAmount).toBeGreaterThan(0);
  });

  it('Luật mới giảm thuế so với luật cũ (30M)', () => {
    const oldResult = calculateOldTax(input(30_000_000));
    const newResult = calculateNewTax(input(30_000_000));
    expect(newResult.taxAmount).toBeLessThan(oldResult.taxAmount);
  });

  it('Luật mới giảm thuế so với luật cũ (50M)', () => {
    const oldResult = calculateOldTax(input(50_000_000));
    const newResult = calculateNewTax(input(50_000_000));
    expect(newResult.taxAmount).toBeLessThan(oldResult.taxAmount);
  });

  it('Thu nhập 100M — breakdown chỉ có 5 bậc', () => {
    const result = calculateNewTax(input(100_000_000));
    expect(result.taxBreakdown.length).toBeLessThanOrEqual(5);
  });

  it('Bracket breakdown tổng = taxAmount', () => {
    const result = calculateNewTax(input(60_000_000));
    const breakdownTotal = result.taxBreakdown.reduce((s, b) => s + b.taxAmount, 0);
    expect(breakdownTotal).toBeCloseTo(result.taxAmount, 0);
  });
});

// ===== calculateTaxForDate =====
describe('calculateTaxForDate', () => {
  it('Ngày 2025-06-15 → dùng biểu thuế cũ (7 bậc)', () => {
    const result = calculateTaxForDate({
      grossIncome: 30_000_000,
      dependents: 0,
      calculationDate: new Date('2025-06-15'),
    });
    expect(result.taxConfig.isNew2026).toBe(false);
    expect(result.taxConfig.lawName).toContain('7 bậc');
  });

  it('Ngày 2026-01-01 → dùng biểu thuế mới (5 bậc)', () => {
    const result = calculateTaxForDate({
      grossIncome: 30_000_000,
      dependents: 0,
      calculationDate: new Date('2026-01-01'),
    });
    expect(result.taxConfig.isNew2026).toBe(true);
    expect(result.taxConfig.lawName).toContain('5 bậc');
  });

  it('Kết quả 2025 giống calculateOldTax', () => {
    const inp = input(40_000_000, 1);
    const dated = calculateTaxForDate({ ...inp, calculationDate: new Date('2025-03-01') });
    const old = calculateOldTax(inp);
    expect(dated.taxAmount).toBeCloseTo(old.taxAmount, 0);
  });

  it('Kết quả 2026 giống calculateNewTax', () => {
    const inp = input(40_000_000, 1);
    const dated = calculateTaxForDate({ ...inp, calculationDate: new Date('2026-06-15') });
    const newR = calculateNewTax(inp);
    expect(dated.taxAmount).toBeCloseTo(newR.taxAmount, 0);
  });
});

// ===== Insurance =====
describe('getInsuranceDetailed', () => {
  it('Lương 30M — tất cả BH', () => {
    const detail = getInsuranceDetailed(30_000_000);
    expect(detail.bhxh).toBe(30_000_000 * 0.08);
    expect(detail.bhyt).toBe(30_000_000 * 0.015);
    expect(detail.bhtn).toBe(30_000_000 * 0.01);
    expect(detail.total).toBeCloseTo(detail.bhxh + detail.bhyt + detail.bhtn, 0);
  });

  it('Lương 50M — BHXH capped tại 46.8M', () => {
    const detail = getInsuranceDetailed(50_000_000);
    expect(detail.bhxh).toBe(MAX_SOCIAL_INSURANCE_SALARY * 0.08);
    expect(detail.bhyt).toBe(MAX_SOCIAL_INSURANCE_SALARY * 0.015);
  });

  it('Lương = 0 → tất cả = 0', () => {
    const detail = getInsuranceDetailed(0);
    expect(detail.total).toBe(0);
  });

  it('Tắt BHXH → bhxh = 0', () => {
    const detail = getInsuranceDetailed(30_000_000, 1, { bhxh: false, bhyt: true, bhtn: true });
    expect(detail.bhxh).toBe(0);
    expect(detail.bhyt).toBeGreaterThan(0);
  });
});

// ===== Allowances =====
describe('calculateAllowancesBreakdown', () => {
  it('Không có phụ cấp → all zero', () => {
    const result = calculateAllowancesBreakdown(undefined);
    expect(result.total).toBe(0);
  });

  it('Trang phục dưới giới hạn → miễn thuế', () => {
    const result = calculateAllowancesBreakdown({ meal: 0, phone: 0, transport: 0, hazardous: 0, clothing: 300_000, housing: 0, position: 0 });
    expect(result.clothingExempt).toBe(300_000);
    expect(result.clothingTaxable).toBe(0);
  });

  it('Trang phục vượt giới hạn → phần vượt chịu thuế', () => {
    const result = calculateAllowancesBreakdown({ meal: 0, phone: 0, transport: 0, hazardous: 0, clothing: 1_000_000, housing: 0, position: 0 });
    expect(result.clothingExempt).toBe(416_666);
    expect(result.clothingTaxable).toBe(1_000_000 - 416_666);
  });
});
