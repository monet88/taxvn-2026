jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined),
  multiGet: jest.fn().mockResolvedValue([]),
  multiSet: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('zustand/middleware', () => ({
  persist: (fn: any) => fn,
  createJSONStorage: () => ({}),
}));

import { fireEvent, render } from '@testing-library/react-native';
import { calculateNewTax, calculateOldTax, formatCurrency } from '../../../packages/tax-core/src/taxCalculator';
import { grossToNet } from '../../../packages/tax-core/src/grossNetCalculator';

import { ToolDetailScreenContent } from '../app/(tabs)/tools/[slug]';
import { useCalculatorStore } from '../stores/useCalculatorStore';

const WAVE_3_SLUGS = [
  'calculator',
  'gross-net',
  'overtime',
  'annual-settlement',
  'bonus-calculator',
  'esop-calculator',
  'foreigner-tax',
  'securities',
  'rental',
  'household-business',
  'real-estate',
  'pension',
  'severance',
  'vat',
  'withholding-tax',
  'multi-source-income',
  'content-creator',
  'crypto-tax',
  'income-summary',
  'monthly-planner',
  'mua-nha',
  'inheritance-gift',
  'employer-cost',
  'freelancer',
  'salary-compare',
  'yearly',
  'business-form',
  'couple-optimizer',
  'region-compare',
  'tax-planning-simulator',
] as const;

describe('Tool detail runtime (UX-03, UX-04)', () => {
  beforeEach(() => {
    useCalculatorStore.setState({ history: [], drafts: {} } as any);
  });

  it('khôi phục draft đã lưu cho tool hiện tại', () => {
    useCalculatorStore.getState().saveDraft('calculator', { primaryAmount: '25000000' });

    const screen = render(<ToolDetailScreenContent slug="calculator" />);

    expect(screen.getByText('Bản nháp')).toBeTruthy();
    expect(screen.getByDisplayValue('25.000.000 đ')).toBeTruthy();
  });

  it('sanitize input tiền tệ và cập nhật lại draft store khi người dùng nhập', () => {
    const screen = render(<ToolDetailScreenContent slug="calculator" />);
    const input = screen.getByLabelText('Giá trị nháp');

    fireEvent.changeText(input, '30.000.000 đ');

    expect(useCalculatorStore.getState().drafts.calculator.values.primaryAmount).toBe('30000000');
    expect(screen.getByDisplayValue('30.000.000 đ')).toBeTruthy();
  });

  it('tool calculator hiển thị kết quả luật cũ và luật mới từ tax-core', () => {
    const grossIncome = 30_000_000;
    const oldResult = calculateOldTax({ grossIncome, dependents: 0, hasInsurance: true, region: 1 });
    const newResult = calculateNewTax({ grossIncome, dependents: 0, hasInsurance: true, region: 1 });

    const screen = render(<ToolDetailScreenContent slug="calculator" />);
    fireEvent.changeText(screen.getByLabelText('Giá trị nháp'), '30.000.000 đ');

    expect(screen.getByText('Thuế theo luật cũ')).toBeTruthy();
    expect(screen.getByText(formatCurrency(oldResult.taxAmount))).toBeTruthy();
    expect(screen.getByText('Thuế theo luật mới')).toBeTruthy();
    expect(screen.getByText(formatCurrency(newResult.taxAmount))).toBeTruthy();
  });

  it('tool gross-net hiển thị net ước tính từ tax-core', () => {
    const grossIncome = 30_000_000;
    const result = grossToNet({
      amount: grossIncome,
      type: 'gross',
      dependents: 0,
      hasInsurance: true,
      useNewLaw: true,
      region: 1,
    });

    const screen = render(<ToolDetailScreenContent slug="gross-net" />);
    fireEvent.changeText(screen.getByLabelText('Giá trị nháp'), '30.000.000 đ');

    expect(screen.getByText('Net ước tính')).toBeTruthy();
    expect(screen.getByText(formatCurrency(result.net))).toBeTruthy();
  });

  it('tool salary-compare hiển thị chênh lệch offer khi nhập 2 mức lương', () => {
    const screen = render(<ToolDetailScreenContent slug="salary-compare" />);

    fireEvent.changeText(screen.getByLabelText('Offer A'), '25.000.000 đ');
    fireEvent.changeText(screen.getByLabelText('Offer B'), '32.000.000 đ');

    expect(screen.getAllByText('So sánh offer').length).toBeGreaterThan(0);
    expect(screen.getByText('Chênh lệch NET tháng')).toBeTruthy();
  });

  it.each(WAVE_3_SLUGS)(
    'tool %s không còn rơi về DraftRuntime mặc định',
    (slug) => {
      const screen = render(<ToolDetailScreenContent slug={slug} />);

      expect(screen.queryByText('Bản nháp đầu vào')).toBeNull();
    }
  );

  it('tool annual-settlement hiển thị ước tính quyết toán khi nhập thu nhập tháng', () => {
    const screen = render(<ToolDetailScreenContent slug="annual-settlement" />);

    fireEvent.changeText(screen.getByLabelText('Thu nhập tháng'), '30.000.000 đ');

    expect(screen.getByText('Dự kiến chênh lệch')).toBeTruthy();
  });

  it('tool freelancer hiển thị so sánh freelancer và nhân viên', () => {
    const screen = render(<ToolDetailScreenContent slug="freelancer" />);

    fireEvent.changeText(screen.getByLabelText('Thu nhập gross'), '30.000.000 đ');

    expect(screen.getByText('Freelancer')).toBeTruthy();
    expect(screen.getByText('Nhân viên')).toBeTruthy();
  });

  it('tool region-compare hiển thị chênh lệch giữa vùng 1 và vùng 2', () => {
    const screen = render(<ToolDetailScreenContent slug="region-compare" />);

    fireEvent.changeText(screen.getByLabelText('Thu nhập gross'), '30.000.000 đ');

    expect(screen.getByText('Vùng 1')).toBeTruthy();
    expect(screen.getByText('Vùng 2')).toBeTruthy();
  });

  it('tool tax-planning-simulator hiển thị kịch bản mô phỏng sau khi nhập bonus', () => {
    const screen = render(<ToolDetailScreenContent slug="tax-planning-simulator" />);

    fireEvent.changeText(screen.getByLabelText('Thu nhập gross'), '30.000.000 đ');
    fireEvent.changeText(screen.getByLabelText('Thưởng năm'), '60.000.000 đ');

    expect(screen.getByText('Kịch bản tối ưu')).toBeTruthy();
  });
});
