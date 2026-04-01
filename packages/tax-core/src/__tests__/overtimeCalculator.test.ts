/**
 * Tests for overtimeCalculator
 */
import { describe, it, expect } from 'vitest';
import { getOvertimeRate, calculateHourlyRate } from '../overtimeCalculator';

describe('overtimeCalculator', () => {
  it('Happy: ngày thường ca ngày → 150%', () => {
    const rate = getOvertimeRate('weekday', 'day');
    expect(rate).toBe(1.5);
  });

  it('Happy: cuối tuần ca ngày → 200%', () => {
    const rate = getOvertimeRate('weekend', 'day');
    expect(rate).toBe(2.0);
  });

  it('Happy: lễ ca ngày → 300%', () => {
    const rate = getOvertimeRate('holiday', 'day');
    expect(rate).toBe(3.0);
  });

  it('Boundary: cuối tuần ca đêm → 270%', () => {
    const rate = getOvertimeRate('weekend', 'night');
    expect(rate).toBe(2.7);
  });

  it('calculateHourlyRate: lương 30M / 22 ngày / 8 giờ', () => {
    const hourly = calculateHourlyRate(30_000_000, 22, 8);
    expect(hourly).toBeCloseTo(30_000_000 / 22 / 8, 0);
  });
});
