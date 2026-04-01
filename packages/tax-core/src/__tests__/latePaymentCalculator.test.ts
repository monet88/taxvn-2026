/**
 * Tests for latePaymentCalculator
 */
import { describe, it, expect } from 'vitest';
import { daysBetween, calculateLatePayment } from '../latePaymentCalculator';

describe('daysBetween', () => {
  it('Cùng ngày → 0', () => {
    const d = new Date('2026-01-01');
    expect(daysBetween(d, d)).toBe(0);
  });

  it('1 ngày → 1', () => {
    expect(daysBetween(new Date('2026-01-01'), new Date('2026-01-02'))).toBe(1);
  });

  it('30 ngày', () => {
    expect(daysBetween(new Date('2026-01-01'), new Date('2026-01-31'))).toBe(30);
  });
});

describe('calculateLatePayment', () => {
  it('Happy: nộp trễ 30 ngày, thuế 10M', () => {
    const r = calculateLatePayment({
      taxType: 'pit',
      taxAmount: 10_000_000,
      dueDate: new Date('2026-01-01'),
      paymentDate: new Date('2026-01-31'),
    });
    expect(r.daysLate).toBe(30);
    expect(r.interestAmount).toBeGreaterThan(0);
  });

  it('Boundary: nộp đúng hạn → phạt = 0', () => {
    const r = calculateLatePayment({
      taxType: 'pit',
      taxAmount: 10_000_000,
      dueDate: new Date('2026-01-31'),
      paymentDate: new Date('2026-01-31'),
    });
    expect(r.daysLate).toBe(0);
    expect(r.interestAmount).toBe(0);
  });

  it('Edge: thuế = 0 → phạt = 0', () => {
    const r = calculateLatePayment({
      taxType: 'pit',
      taxAmount: 0,
      dueDate: new Date('2026-01-01'),
      paymentDate: new Date('2026-12-31'),
    });
    expect(r.interestAmount).toBe(0);
  });
});
