/**
 * Tests for foreignerTaxCalculator
 */
import { describe, it, expect } from 'vitest';
import {
  calculateForeignerTax,
  determineResidencyStatus,
  checkDoubleTaxTreaty,
  calculateDaysInVietnam,
  DEFAULT_FOREIGNER_ALLOWANCES,
} from '../foreignerTaxCalculator';

describe('determineResidencyStatus', () => {
  it('≥183 ngày → resident', () => {
    expect(determineResidencyStatus(200, false)).toBe('resident');
  });

  it('<183 ngày, không thường trú → non-resident', () => {
    expect(determineResidencyStatus(100, false)).toBe('non-resident');
  });

  it('Có thường trú → resident (bất kể ngày)', () => {
    expect(determineResidencyStatus(30, true)).toBe('resident');
  });
});

describe('checkDoubleTaxTreaty', () => {
  it('Nhật có hiệp định', () => {
    const treaty = checkDoubleTaxTreaty('JP');
    expect(treaty).toBeDefined();
    expect(treaty!.name).toContain('Nhật');
  });

  it('Quốc gia không có → undefined', () => {
    expect(checkDoubleTaxTreaty('XX')).toBeUndefined();
  });
});

describe('calculateForeignerTax', () => {
  it('Non-resident: thuế 20% cố định', () => {
    const r = calculateForeignerTax({
      nationality: 'JP',
      daysInVietnam: 90,
      hasPermanentResidence: false,
      grossIncome: 50_000_000,
      allowances: DEFAULT_FOREIGNER_ALLOWANCES,
      hasVietnameseInsurance: false,
      dependents: 0,
      taxYear: 2026,
    });
    expect(r.residencyStatus).toBe('non-resident');
    expect(r.taxAmount).toBe(50_000_000 * 0.20);
  });

  it('Resident: thuế lũy tiến', () => {
    const r = calculateForeignerTax({
      nationality: 'JP',
      daysInVietnam: 200,
      hasPermanentResidence: false,
      grossIncome: 50_000_000,
      allowances: DEFAULT_FOREIGNER_ALLOWANCES,
      hasVietnameseInsurance: true,
      dependents: 0,
      taxYear: 2026,
    });
    expect(r.residencyStatus).toBe('resident');
    expect(r.taxAmount).toBeLessThan(50_000_000 * 0.20); // Lũy tiến < 20% cố định
  });

  it('Edge: grossIncome = 0', () => {
    const r = calculateForeignerTax({
      nationality: 'US',
      daysInVietnam: 200,
      hasPermanentResidence: false,
      grossIncome: 0,
      allowances: DEFAULT_FOREIGNER_ALLOWANCES,
      hasVietnameseInsurance: false,
      dependents: 0,
      taxYear: 2026,
    });
    expect(r.taxAmount).toBe(0);
  });
});
