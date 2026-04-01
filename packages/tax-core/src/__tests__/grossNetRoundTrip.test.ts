/**
 * GROSS↔NET round-trip tests
 * Kiểm tra tính chính xác của binary search trong grossNetCalculator
 */
import { describe, it, expect } from 'vitest';
import { grossToNet, netToGross, type GrossNetInput } from '../grossNetCalculator';

const TOLERANCE = 1000; // ±1,000 VND (precision của binary search)

function makeInput(amount: number, type: 'gross' | 'net', useNewLaw = true): GrossNetInput {
  return { amount, type, dependents: 0, hasInsurance: true, useNewLaw, region: 1 };
}

// ===== GROSS→NET→GROSS round trip =====
describe('GROSS → NET → GROSS round trip', () => {
  const testCases = [
    { gross: 10_000_000, label: 'Lương thấp 10M' },
    { gross: 20_000_000, label: 'Lương trung bình thấp 20M' },
    { gross: 30_000_000, label: 'Lương trung bình 30M' },
    { gross: 50_000_000, label: 'Lương cao 50M' },
    { gross: 80_000_000, label: 'Lương rất cao 80M' },
    { gross: 100_000_000, label: 'Lương cực cao 100M' },
  ];

  testCases.forEach(({ gross, label }) => {
    it(`${label}: GROSS ${gross.toLocaleString()} → NET → GROSS ±${TOLERANCE} VND`, () => {
      const netResult = grossToNet(makeInput(gross, 'gross'));

      // NET phải hợp lệ
      expect(netResult.net).toBeGreaterThan(0);
      expect(netResult.net).toBeLessThan(gross);

      const grossResult = netToGross(makeInput(netResult.net, 'net'));

      // Phải quay lại gần giá trị ban đầu
      expect(Math.abs(grossResult.gross - gross)).toBeLessThanOrEqual(TOLERANCE);
    });
  });
});

// ===== NET→GROSS→NET round trip =====
describe('NET → GROSS → NET round trip', () => {
  const testCases = [
    { net: 8_000_000, label: 'NET thấp 8M' },
    { net: 20_000_000, label: 'NET trung bình 20M' },
    { net: 40_000_000, label: 'NET cao 40M' },
    { net: 70_000_000, label: 'NET rất cao 70M' },
  ];

  testCases.forEach(({ net, label }) => {
    it(`${label}: NET ${net.toLocaleString()} → GROSS → NET ±${TOLERANCE} VND`, () => {
      const grossResult = netToGross(makeInput(net, 'net'));
      expect(grossResult.gross).toBeGreaterThan(net);

      const netResult = grossToNet(makeInput(grossResult.gross, 'gross'));
      expect(Math.abs(netResult.net - net)).toBeLessThanOrEqual(TOLERANCE);
    });
  });
});

// ===== Edge cases =====
describe('Edge cases', () => {
  it('GROSS = 0 → NET = 0', () => {
    const result = grossToNet(makeInput(0, 'gross'));
    expect(result.net).toBe(0);
    expect(result.tax).toBe(0);
  });

  it('GROSS dưới mức giảm trừ → thuế = 0', () => {
    const result = grossToNet(makeInput(5_000_000, 'gross'));
    expect(result.tax).toBe(0);
  });

  it('Có phụ thuộc → NET cao hơn', () => {
    const noDeps = grossToNet({ amount: 30_000_000, type: 'gross', dependents: 0, hasInsurance: true, useNewLaw: true });
    const withDeps = grossToNet({ amount: 30_000_000, type: 'gross', dependents: 2, hasInsurance: true, useNewLaw: true });
    expect(withDeps.net).toBeGreaterThanOrEqual(noDeps.net);
  });

  it('Luật cũ vs mới: NEW cho NET cao hơn', () => {
    const oldLaw = grossToNet(makeInput(40_000_000, 'gross', false));
    const newLaw = grossToNet(makeInput(40_000_000, 'gross', true));
    expect(newLaw.net).toBeGreaterThanOrEqual(oldLaw.net);
  });
});
