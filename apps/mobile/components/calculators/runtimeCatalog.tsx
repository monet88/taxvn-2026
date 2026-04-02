import type { ReactElement } from 'react';

import {
  calculateBaseRate,
  calculateBonusComparison,
  calculateBonusTaxScenarios,
  calculateContentCreatorTax,
  calculateCryptoTax,
  calculateESOPGain,
  calculateESOPTotalValue,
  calculateForeignerTax,
  calculateFreelancerComparison,
  calculateIncomeSummary,
  calculateInheritanceGiftTax,
  calculateLatePayment,
  calculateMonthlyPlan,
  calculateMultiSourceTax,
  calculateNewTax,
  calculateNotaryFee,
  calculatePMT,
  calculatePropertyTax,
  calculateRetirementAge,
  calculateSeveranceTax,
  calculateTransactionTax,
  calculateVATDeduction,
  calculateWithholdingTax,
  compareAllPresets,
  compareBusinessForms,
  createDefaultMonths,
  createEmptyProperty,
  createIncomeSource,
  DEFAULT_FOREIGNER_ALLOWANCES,
  estimateSettlement,
  estimateTransferTax,
  findOptimalBonusStrategy,
  formatCurrency,
  getIncomeTaxBracketLabel,
  getIncomeTaxRate2026,
  optimizeCoupleTax,
} from '@/lib/taxCore';

import { ActionRow } from './ActionRow';
import { ComparisonBlock } from './ComparisonBlock';
import { EmptyResult } from './EmptyResult';
import { NumericInput } from './NumericInput';
import { ResultSummary } from './ResultSummary';
import { SectionCard } from './SectionCard';

export interface RuntimeDraftValues {
  [key: string]: string | undefined;
}

interface RuntimeField {
  key: string;
  label: string;
  placeholder: string;
  helperText?: string;
}

interface RuntimeSummary {
  title: string;
  value: string;
  description?: string;
}

interface RuntimeComparison {
  leftLabel: string;
  leftValue: string;
  rightLabel: string;
  rightValue: string;
  helperText?: string;
}

interface RuntimeOutput {
  summaries?: RuntimeSummary[];
  comparisons?: RuntimeComparison[];
}

interface RuntimeConfig {
  caption: string;
  sectionTitle: string;
  sectionSubtitle: string;
  emptyTitle: string;
  emptyDescription: string;
  fields: RuntimeField[];
  compute: (values: RuntimeDraftValues) => RuntimeOutput | null;
}

interface ConfiguredRuntimeProps {
  slug: string;
  config: RuntimeConfig;
  values: RuntimeDraftValues;
  saveDraft: (toolId: string, values: Record<string, string>) => void;
  clearDraft: (toolId: string) => void;
  hasDraft: boolean;
}

export interface ExtendedToolRuntimeResult {
  body: ReactElement;
  caption: string;
}

export interface ExtendedToolRuntimeParams {
  slug: string;
  values: RuntimeDraftValues;
  saveDraft: (toolId: string, values: Record<string, string>) => void;
  clearDraft: (toolId: string) => void;
  hasDraft: boolean;
}

function toNumber(value?: string): number {
  return value ? Number(value) : 0;
}

function formatRate(value: number): string {
  const percent = Math.abs(value) <= 1 ? value * 100 : value;
  return `${percent.toFixed(percent % 1 === 0 ? 0 : 1)}%`;
}

function formatResidencyStatus(status: 'resident' | 'non-resident'): string {
  return status === 'resident' ? 'Cư trú' : 'Không cư trú';
}

function formatRetirementAge(result: { years: number; months: number }): string {
  return `${result.years} năm ${result.months} tháng`;
}

function createIncomeSummaryEntries(monthlyIncome: number) {
  return Array.from({ length: 12 }, (_, index) => ({
    id: `entry-${index + 1}`,
    category: 'salary' as const,
    description: `Lương tháng ${index + 1}`,
    amount: monthlyIncome,
    taxableAmount: monthlyIncome,
    taxAmount: 0,
    month: index + 1,
  }));
}

function ConfiguredRuntime({
  slug,
  config,
  values,
  saveDraft,
  clearDraft,
  hasDraft,
}: ConfiguredRuntimeProps) {
  const result = config.compute(values);

  return (
    <>
      {config.fields.length > 0 && (
        <SectionCard title={config.sectionTitle} subtitle={config.sectionSubtitle}>
          {config.fields.map((field) => (
            <NumericInput
              key={field.key}
              label={field.label}
              accessibilityLabel={field.label}
              value={values[field.key] ?? ''}
              onChangeText={(nextValue) => saveDraft(slug, { [field.key]: nextValue })}
              placeholder={field.placeholder}
              helperText={field.helperText}
            />
          ))}
        </SectionCard>
      )}

      {result ? (
        <>
          {result.comparisons?.map((comparison, index) => (
            <ComparisonBlock
              key={`${slug}-comparison-${index}`}
              leftLabel={comparison.leftLabel}
              leftValue={comparison.leftValue}
              rightLabel={comparison.rightLabel}
              rightValue={comparison.rightValue}
              helperText={comparison.helperText}
            />
          ))}

          {result.summaries?.map((summary, index) => (
            <ResultSummary
              key={`${slug}-summary-${index}`}
              title={summary.title}
              value={summary.value}
              description={summary.description}
            />
          ))}
        </>
      ) : (
        <EmptyResult
          title={config.emptyTitle}
          description={config.emptyDescription}
        />
      )}

      <ActionRow
        secondaryLabel="Xóa bản nháp"
        secondaryDisabled={!hasDraft}
        onSecondaryPress={() => clearDraft(slug)}
      />
    </>
  );
}



const RUNTIME_CONFIGS: Record<string, RuntimeConfig> = {
  'annual-settlement': {
    caption: 'Ước tính quyết toán năm dựa trên lương tháng hiện tại bằng tax-core.',
    sectionTitle: 'Ước tính quyết toán',
    sectionSubtitle: 'Nhập lương gross theo tháng để dự kiến số phải nộp hoặc được hoàn.',
    emptyTitle: 'Chưa có dữ liệu quyết toán',
    emptyDescription: 'Nhập thu nhập tháng để ước tính chênh lệch quyết toán năm.',
    fields: [
      {
        key: 'primaryAmount',
        label: 'Thu nhập tháng',
        placeholder: 'Ví dụ 30.000.000',
      },
    ],
    compute: (values) => {
      const monthlySalary = toNumber(values.primaryAmount);
      if (monthlySalary <= 0) {
        return null;
      }

      const result = estimateSettlement(2026, monthlySalary, 0, 0);

      return {
        comparisons: [
          {
            leftLabel: 'Thuế ước tính',
            leftValue: formatCurrency(result.estimatedTaxDue),
            rightLabel: 'Đã tạm nộp',
            rightValue: formatCurrency(result.estimatedTaxPaid),
          },
        ],
        summaries: [
          {
            title: 'Dự kiến chênh lệch',
            value: formatCurrency(result.estimatedDifference),
            description: 'Số dương là còn phải nộp, số âm là có thể được hoàn.',
          },
        ],
      };
    },
  },
  'content-creator': {
    caption: 'Content creator mobile ưu tiên doanh thu năm và nghĩa vụ 7% mặc định của 2026.',
    sectionTitle: 'Doanh thu creator',
    sectionSubtitle: 'Nhập tổng doanh thu năm để xem VAT, PIT và phần còn phải nộp.',
    emptyTitle: 'Chưa có doanh thu creator',
    emptyDescription: 'Nhập tổng doanh thu năm để tính nghĩa vụ thuế creator.',
    fields: [
      {
        key: 'primaryAmount',
        label: 'Tổng doanh thu năm',
        placeholder: 'Ví dụ 600.000.000',
      },
    ],
    compute: (values) => {
      const totalIncome = toNumber(values.primaryAmount);
      if (totalIncome <= 0) {
        return null;
      }

      const result = calculateContentCreatorTax({
        year: 2026,
        platforms: [
          {
            platformId: 'youtube',
            monthlyIncome: Array(12).fill(totalIncome / 12),
            totalIncome,
            withheldTax: 0,
          },
        ],
        hasOtherIncome: false,
        isRegisteredBusiness: false,
      });

      return {
        comparisons: [
          {
            leftLabel: 'Tổng thuế',
            leftValue: formatCurrency(result.totalTaxDue),
            rightLabel: 'Còn phải nộp',
            rightValue: formatCurrency(result.remainingTax),
          },
        ],
        summaries: [
          {
            title: 'Thuế creator',
            value: formatRate(result.effectiveTaxRate),
            description: `Tổng nghĩa vụ hiện tại: ${formatCurrency(result.totalTaxDue)}`,
          },
        ],
      };
    },
  },
  freelancer: {
    caption: 'So sánh freelancer/fulltime mobile dùng tax-core trực tiếp trên cùng mức gross.',
    sectionTitle: 'Thu nhập gross',
    sectionSubtitle: 'Nhập gross để so sánh net giữa freelancer và nhân viên.',
    emptyTitle: 'Chưa có gross để so sánh',
    emptyDescription: 'Nhập gross để xem freelancer hay nhân viên lợi hơn.',
    fields: [
      {
        key: 'primaryAmount',
        label: 'Thu nhập gross',
        placeholder: 'Ví dụ 30.000.000',
      },
    ],
    compute: (values) => {
      const grossIncome = toNumber(values.primaryAmount);
      if (grossIncome <= 0) {
        return null;
      }

      const result = calculateFreelancerComparison({
        grossIncome,
        frequency: 'monthly',
        dependents: 0,
        hasInsurance: true,
        region: 1,
        useNewLaw: true,
      });

      return {
        comparisons: [
          {
            leftLabel: 'Freelancer',
            leftValue: formatCurrency(result.freelancer.net),
            rightLabel: 'Nhân viên',
            rightValue: formatCurrency(result.employee.net),
            helperText: result.comparison.freelancerBetter
              ? 'Freelancer đang có lợi hơn theo net.'
              : 'Nhân viên đang có lợi hơn theo net.',
          },
        ],
        summaries: [
          {
            title: 'Chênh lệch net',
            value: formatCurrency(result.comparison.netDifference),
            description: 'Số dương nghiêng về freelancer, số âm nghiêng về nhân viên.',
          },
        ],
      };
    },
  },
  yearly: {
    caption: 'So sánh theo năm mobile dùng preset 2 năm để xem chiến lược thưởng tốt hơn.',
    sectionTitle: 'Lương và thưởng T13',
    sectionSubtitle: 'Nhập lương tháng và bonus để so sánh các preset phân bổ thưởng.',
    emptyTitle: 'Chưa có dữ liệu theo năm',
    emptyDescription: 'Nhập lương tháng để xem chiến lược hai năm.',
    fields: [
      {
        key: 'primaryAmount',
        label: 'Lương tháng',
        placeholder: 'Ví dụ 30.000.000',
      },
      {
        key: 'secondaryAmount',
        label: 'Thưởng T13',
        placeholder: 'Ví dụ 30.000.000',
      },
    ],
    compute: (values) => {
      const monthlySalary = toNumber(values.primaryAmount);
      const bonusAmount = toNumber(values.secondaryAmount);
      if (monthlySalary <= 0) {
        return null;
      }

      const result = compareAllPresets(
        monthlySalary,
        0,
        true,
        1,
        bonusAmount > 0 ? bonusAmount : undefined
      );

      return {
        comparisons: [
          {
            leftLabel: 'Kịch bản tốt nhất',
            leftValue: result.bestStrategy >= 0 ? `Chiến lược ${result.bestStrategy + 1}` : 'N/A',
            rightLabel: 'Tiết kiệm tối đa',
            rightValue: formatCurrency(result.maxSavings),
          },
        ],
        summaries: [
          {
            title: 'Kịch bản tối ưu',
            value: result.bestStrategy >= 0 ? `Chiến lược ${result.bestStrategy + 1}` : 'N/A',
            description: result.description,
          },
        ],
      };
    },
  },
  'business-form': {
    caption: 'Hình thức kinh doanh mobile dùng doanh thu tháng để so sánh employee/freelancer/household.',
    sectionTitle: 'Doanh thu tháng',
    sectionSubtitle: 'Nhập doanh thu tháng để xem net income giữa ba hình thức.',
    emptyTitle: 'Chưa có doanh thu để so sánh',
    emptyDescription: 'Nhập doanh thu tháng để xem hình thức kinh doanh phù hợp.',
    fields: [
      {
        key: 'primaryAmount',
        label: 'Doanh thu tháng',
        placeholder: 'Ví dụ 30.000.000',
      },
    ],
    compute: (values) => {
      const monthlyRevenue = toNumber(values.primaryAmount);
      if (monthlyRevenue <= 0) {
        return null;
      }

      const result = compareBusinessForms({
        annualRevenue: monthlyRevenue * 12,
        expenseRatio: 0.3,
        businessCategory: 'services',
        region: 1,
        dependents: 0,
        hasSelfInsurance: true,
      });

      return {
        comparisons: [
          {
            leftLabel: 'Freelancer',
            leftValue: formatCurrency(result.freelancer.netIncome),
            rightLabel: 'Nhân viên',
            rightValue: formatCurrency(result.employee.netIncome),
          },
          {
            leftLabel: 'Hộ kinh doanh',
            leftValue: formatCurrency(result.householdBusiness.netIncome),
            rightLabel: 'Khuyến nghị',
            rightValue: String(result.recommendation),
          },
        ],
        summaries: [
          {
            title: 'Hình thức gợi ý',
            value: String(result.recommendation),
            description: 'Khuyến nghị hiện được tính trực tiếp từ compareBusinessForms trong tax-core.',
          },
        ],
      };
    },
  },
  'couple-optimizer': {
    caption: 'Tối ưu thuế vợ chồng mobile ưu tiên bài toán phân bổ người phụ thuộc.',
    sectionTitle: 'Thu nhập hai người',
    sectionSubtitle: 'Nhập gross của hai người để xem phương án tối ưu phân bổ người phụ thuộc.',
    emptyTitle: 'Chưa có dữ liệu cặp đôi',
    emptyDescription: 'Nhập thu nhập của hai người để xem phương án tối ưu.',
    fields: [
      {
        key: 'primaryAmount',
        label: 'Thu nhập người 1',
        placeholder: 'Ví dụ 40.000.000',
      },
      {
        key: 'secondaryAmount',
        label: 'Thu nhập người 2',
        placeholder: 'Ví dụ 20.000.000',
      },
    ],
    compute: (values) => {
      const person1Income = toNumber(values.primaryAmount);
      const person2Income = toNumber(values.secondaryAmount);
      if (person1Income <= 0 || person2Income <= 0) {
        return null;
      }

      const result = optimizeCoupleTax({
        person1: {
          name: 'Người 1',
          grossIncome: person1Income,
          hasInsurance: true,
          pensionContribution: 0,
          otherDeductions: 0,
        },
        person2: {
          name: 'Người 2',
          grossIncome: person2Income,
          hasInsurance: true,
          pensionContribution: 0,
          otherDeductions: 0,
        },
        totalDependents: 2,
        charitableContribution: 0,
        voluntaryPension: 0,
      });

      return {
        comparisons: [
          {
            leftLabel: 'Thuế hiện tại',
            leftValue: formatCurrency(result.currentScenario.totalTax),
            rightLabel: 'Thuế tối ưu',
            rightValue: formatCurrency(result.optimalScenario.totalTax),
          },
        ],
        summaries: [
          {
            title: 'Phân bổ tối ưu',
            value: `${result.optimalScenario.person1Dependents}/${result.optimalScenario.person2Dependents}`,
            description: 'Định dạng người phụ thuộc: Người 1 / Người 2.',
          },
        ],
      };
    },
  },
  'bonus-calculator': {
    caption: 'Thưởng Tết & Lương T13',
    sectionTitle: 'Thông tin thưởng',
    sectionSubtitle: 'Điền lương tháng và các khoản thưởng để tối ưu.',
    emptyTitle: 'Chưa có dữ liệu',
    emptyDescription: 'Nhập số tiền thưởng để xem so sánh.',
    fields: [
      {
        key: 'primaryAmount',
        label: 'Lương tháng',
        placeholder: 'Ví dụ: 30.000.000',
      },
      {
        key: 'bonus',
        label: 'Thưởng (T13 + Tết)',
        placeholder: 'Ví dụ: 50.000.000',
      },
    ],
    compute: (values) => {
      const monthlySalary = toNumber(values.primaryAmount);
      const bonus = toNumber(values.bonus);
      if (monthlySalary <= 0 || bonus <= 0) return null;

      const result = calculateBonusComparison({
        monthlySalary,
        thirteenthMonthSalary: bonus,
        tetBonus: 0,
        otherBonuses: 0,
        dependents: 0,
        region: 1,
        hasInsurance: true,
      });

      return {
        comparisons: [
          {
            leftLabel: 'Phương án tối ưu',
            leftValue: result.recommendation.name,
            rightLabel: 'Tiết kiệm',
            rightValue: formatCurrency(result.maxSavings),
          },
        ],
        summaries: Array.from(result.scenarios).slice(0, 2).map((s) => ({
          title: s.scenario.name,
          value: formatCurrency(s.netBonus),
          description: `Thuế: ${formatCurrency(s.additionalTax)} (${formatRate(s.effectiveTaxRate / 100)})`,
        })),
      };
    },
  },
  'esop-calculator': {
    caption: 'Thuế ESOP',
    sectionTitle: 'Thông tin quyền chọn',
    sectionSubtitle: 'Nhập giá cấp, giá thị trường và số lượng cổ phiếu.',
    emptyTitle: 'Chưa đủ dữ liệu',
    emptyDescription: 'Nhập giá và số lượng để tính thuế ESOP.',
    fields: [
      { key: 'grantPrice', label: 'Giá cấp (VND)', placeholder: '10.000' },
      { key: 'marketPrice', label: 'Giá thị trường', placeholder: '50.000' },
      { key: 'quantity', label: 'Số lượng tối đa', placeholder: '1.000' },
    ],
    compute: (values) => {
      const grantPrice = toNumber(values.grantPrice);
      const marketPrice = toNumber(values.marketPrice);
      const quantity = toNumber(values.quantity);
      if (grantPrice <= 0 || marketPrice <= 0 || quantity <= 0) return null;

      const result = calculateESOPGain({
        grantPrice,
        exercisePrice: marketPrice,
        numberOfShares: quantity,
        dependents: 0,
        region: 1,
        hasInsurance: true,
        monthlySalary: 0,
      });
      const totalValue = calculateESOPTotalValue({
        grantPrice,
        exercisePrice: marketPrice,
        numberOfShares: quantity,
        dependents: 0,
        region: 1,
        hasInsurance: true,
        monthlySalary: 0,
      });

      return {
        comparisons: [
          {
            leftLabel: 'Tổng giá trị',
            leftValue: formatCurrency(totalValue),
            rightLabel: 'Giá trị chênh lệch',
            rightValue: formatCurrency(result),
          },
        ],
        summaries: [
          {
            title: 'Khuyến nghị tính thuế',
            value: 'Nên dùng công cụ nâng cao',
            description: 'Để tối ưu thuế giữa 2025 và 2026.',
          },
        ],
      };
    },
  },
  'foreigner-tax': {
    caption: 'Thuế người nước ngoài',
    sectionTitle: 'Thông tin cư trú',
    sectionSubtitle: 'Nhập thu nhập gross để xem thuế cho người cư trú/không cư trú.',
    emptyTitle: 'Chưa có dữ liệu',
    emptyDescription: 'Nhập gross để xem dự tính cho expat.',
    fields: [
      { key: 'primaryAmount', label: 'Gross Income (VNĐ)', placeholder: '100.000.000' },
    ],
    compute: (values) => {
      const gross = toNumber(values.primaryAmount);
      if (gross <= 0) return null;

      const resident = calculateForeignerTax({
        grossIncome: gross,
        hasPermanentResidence: true,
        nationality: 'VN',
        dependents: 0,
        hasVietnameseInsurance: false,
        allowances: DEFAULT_FOREIGNER_ALLOWANCES,
        taxYear: 2026,
      });
      const nonResident = calculateForeignerTax({
        grossIncome: gross,
        hasPermanentResidence: false,
        nationality: 'VN',
        dependents: 0,
        hasVietnameseInsurance: false,
        allowances: DEFAULT_FOREIGNER_ALLOWANCES,
        taxYear: 2026,
      });

      return {
        comparisons: [
          {
            leftLabel: 'Cư trú',
            leftValue: formatCurrency(resident.taxAmount),
            rightLabel: 'Không cư trú',
            rightValue: formatCurrency(nonResident.taxAmount),
          },
        ],
      };
    },
  },
  'securities': {
    caption: 'Thuế chứng khoán',
    sectionTitle: 'Giao dịch cổ phiếu',
    sectionSubtitle: 'Tính thuế bán chứng khoán niêm yết (0.1%).',
    emptyTitle: 'Chưa có thông tin bán',
    emptyDescription: 'Nhập giá trị bán để tính thuế giao dịch.',
    fields: [
      { key: 'primaryAmount', label: 'Tổng giá trị bán', placeholder: '100.000.000' },
    ],
    compute: (values) => {
      const sellValue = toNumber(values.primaryAmount);
      if (sellValue <= 0) return null;
      
      const tax = sellValue * 0.001;
      
      return {
        summaries: [
          {
            title: 'Thuế giao dịch (0.1%)',
            value: formatCurrency(tax),
            description: `Tính trên tổng giá trị giao dịch ${formatCurrency(sellValue)}.`,
          },
        ],
      };
    },
  },
  'rental': {
    caption: 'Thuế cho thuê tài sản',
    sectionTitle: 'Thông tin cho thuê (Năm 2026)',
    sectionSubtitle: 'Tổng doanh thu năm > 500tr mới phải nộp thuế (5% PIT, 5% VAT).',
    emptyTitle: 'Chưa có tiền thuê',
    emptyDescription: 'Nhập tiền thuê để tính.',
    fields: [
      { key: 'primaryAmount', label: 'Tiền thuê 1 tháng', placeholder: '45.000.000' },
      { key: 'months', label: 'Số tháng cho thuê/năm', placeholder: '12' },
    ],
    compute: (values) => {
      const monthlyRent = toNumber(values.primaryAmount);
      const months = toNumber(values.months) || 12;
      if (monthlyRent <= 0) return null;

      const prop = createEmptyProperty();
      prop.monthlyRent = monthlyRent;
      prop.occupiedMonths = months;

      const result = calculatePropertyTax(prop, monthlyRent * months, 2026);

      return {
        comparisons: [
          {
            leftLabel: 'Thuế TNCN',
            leftValue: formatCurrency(result.deemedPIT),
            rightLabel: 'Thuế GTGT',
            rightValue: formatCurrency(result.deemedVAT),
          },
        ],
        summaries: [
          {
            title: 'Tổng thuế',
            value: formatCurrency(result.deemedTotalTax),
            description: `Dựa trên tổng doanh thu ${formatCurrency(result.annualRent)}.`,
          },
        ],
      };
    },
  },
  'region-compare': {
    caption: 'So sánh theo vùng mobile dùng cùng một gross để nhìn khác biệt net giữa vùng 1 và vùng 2.',
    sectionTitle: 'Thu nhập gross',
    sectionSubtitle: 'Nhập gross để xem net theo từng vùng với cùng cấu hình bảo hiểm.',
    emptyTitle: 'Chưa có gross để so sánh vùng',
    emptyDescription: 'Nhập gross để so sánh net giữa vùng 1 và vùng 2.',
    fields: [
      {
        key: 'primaryAmount',
        label: 'Thu nhập gross',
        placeholder: 'Ví dụ 30.000.000',
      },
    ],
    compute: (values) => {
      const grossIncome = toNumber(values.primaryAmount);
      if (grossIncome <= 0) {
        return null;
      }

      const region1 = calculateNewTax({
        grossIncome,
        dependents: 0,
        hasInsurance: true,
        region: 1,
      });
      const region2 = calculateNewTax({
        grossIncome,
        dependents: 0,
        hasInsurance: true,
        region: 2,
      });

      return {
        comparisons: [
          {
            leftLabel: 'Vùng 1',
            leftValue: formatCurrency(region1.netIncome),
            rightLabel: 'Vùng 2',
            rightValue: formatCurrency(region2.netIncome),
            helperText: 'Khác biệt chủ yếu đến từ trần BHTN theo vùng.',
          },
        ],
        summaries: [
          {
            title: 'Chênh lệch net',
            value: formatCurrency(region1.netIncome - region2.netIncome),
            description: 'Số dương nghĩa là vùng 1 đang có net cao hơn trong cấu hình hiện tại.',
          },
        ],
      };
    },
  },
  'tax-planning-simulator': {
    caption: 'Mô phỏng kế hoạch thuế mobile ưu tiên kịch bản phân bổ bonus để ra quyết định nhanh.',
    sectionTitle: 'Gross và thưởng năm',
    sectionSubtitle: 'Nhập gross và bonus để xem chiến lược phân bổ thưởng tối ưu.',
    emptyTitle: 'Chưa có dữ liệu mô phỏng',
    emptyDescription: 'Nhập gross và thưởng năm để chạy mô phỏng bonus scenarios.',
    fields: [
      {
        key: 'primaryAmount',
        label: 'Thu nhập gross',
        placeholder: 'Ví dụ 30.000.000',
      },
      {
        key: 'secondaryAmount',
        label: 'Thưởng năm',
        placeholder: 'Ví dụ 60.000.000',
      },
    ],
    compute: (values) => {
      const grossIncome = toNumber(values.primaryAmount);
      const annualBonus = toNumber(values.secondaryAmount);
      if (grossIncome <= 0 || annualBonus <= 0) {
        return null;
      }

      const scenarios = calculateBonusTaxScenarios(
        {
          grossIncome,
          dependents: 0,
          hasInsurance: true,
          region: 1,
          otherDeductions: 0,
          pensionContribution: 0,
        },
        { annualBonus }
      );
      const optimal = findOptimalBonusStrategy(scenarios);
      if (!optimal) {
        return null;
      }

      return {
        comparisons: [
          {
            leftLabel: 'Kịch bản',
            leftValue: optimal.scenario,
            rightLabel: 'Tổng thuế',
            rightValue: formatCurrency(optimal.totalTax),
          },
        ],
        summaries: [
          {
            title: 'Kịch bản tối ưu',
            value: optimal.scenario,
            description: `Có ${scenarios.length} kịch bản bonus đang được so sánh.`,
          },
        ],
      };
    },
  },
  'household-business': {
    caption: 'Hộ kinh doanh cá thể',
    sectionTitle: 'Doanh thu năm',
    sectionSubtitle: 'Áp dụng ngưỡng tĩnh 500tr theo Luật Thuế 2026.',
    emptyTitle: 'Chưa có doanh thu',
    emptyDescription: 'Nhập doanh thu năm để tính loại thuế.',
    fields: [
      { key: 'annualRevenue', label: 'Doanh thu năm', placeholder: '600.000.000' }
    ],
    compute: (values) => {
      const revenue = toNumber(values.annualRevenue);
      if (revenue <= 0) return null;
      
      const taxRate = 0.02; // PIT cho dịch vụ (Khoán)
      const vatRate = 0.05; // VAT cho dịch vụ (Khoán)
      let taxableIncome = 0;
      let taxAmount = 0;
      let vat = 0;
      
      if (revenue > 500000000) {
        taxableIncome = revenue - 500000000;
        taxAmount = taxableIncome * taxRate;
        vat = revenue * vatRate;
      }
      
      return {
        comparisons: [
          {
            leftLabel: 'Thuế TNCN',
            leftValue: formatCurrency(taxAmount),
            rightLabel: 'Thuế VAT',
            rightValue: formatCurrency(vat),
          }
        ],
        summaries: [
          {
            title: revenue <= 500000000 ? 'Miễn thuế toàn bộ' : 'Tổng thuế phải nộp',
            value: formatCurrency(taxAmount + vat),
            description: revenue > 500000000 
              ? `Phương pháp khoán 2026. Lĩnh vực Dịch vụ (TNCN: ${taxRate*100}%, VAT: ${vatRate*100}%).`
              : 'Doanh thu ≤ 500tr/năm được miễn thuế TNCN và VAT theo Luật thuế mới.',
          }
        ]
      };
    }
  },
  'real-estate': {
    caption: 'Thuế chuyển nhượng BĐS',
    sectionTitle: 'Giá trị chuyển nhượng',
    sectionSubtitle: 'Gắn kèm lệ phí trước bạ (0.5%) và thuế TNCN (2%).',
    emptyTitle: 'Chưa có giá trị',
    emptyDescription: 'Nhập giá chuyển nhượng.',
    fields: [
      { key: 'transferValue', label: 'Giá chuyển nhượng', placeholder: '2.000.000.000' }
    ],
    compute: (values) => {
      const value = toNumber(values.transferValue);
      if (value <= 0) return null;
      
      const result = estimateTransferTax(value, false);
      
      return {
        comparisons: [
          {
            leftLabel: 'Thuế TNCN (2%)',
            leftValue: formatCurrency(result.pit),
            rightLabel: 'Lệ phí trước bạ (0.5%)',
            rightValue: formatCurrency(result.registrationFee),
          }
        ],
        summaries: [
          {
            title: 'Tổng chi phí giao dịch',
            value: formatCurrency(result.total),
            description: `Chiếm ${((result.total / value) * 100).toFixed(1)}% giá trị chuyển nhượng.`,
          }
        ]
      };
    }
  },
  'pension': {
    caption: 'Tuổi nghỉ hưu & Lương hưu',
    sectionTitle: 'Thông tin tính hưu',
    sectionSubtitle: 'Điền năm sinh, năm bắt đầu đóng BHXH.',
    emptyTitle: 'Chưa có thông tin',
    emptyDescription: 'Nhập năm sinh và năm bắt đầu đóng BHXH.',
    fields: [
      { key: 'birthYear', label: 'Năm sinh', placeholder: '1985' },
      { key: 'startYear', label: 'Năm bắt đầu đóng BHXH', placeholder: '2010' },
      { key: 'salary', label: 'Lương đóng BHXH', placeholder: '20.000.000' }
    ],
    compute: (values) => {
      const birthYear = toNumber(values.birthYear);
      const startYear = toNumber(values.startYear);
      const salary = toNumber(values.salary);
      
      if (birthYear < 1950 || startYear < 1950 || salary <= 0) return null;
      
      const targetRetirementAge = 62; // Nam, đơn giản hóa
      const retirementYear = birthYear + targetRetirementAge;
      const contributionYears = retirementYear - startYear;
      
      const baseRate = calculateBaseRate(contributionYears, 'male');
      const monthlyPension = salary * baseRate;
      
      return {
        comparisons: [
          {
            leftLabel: 'Năm nghỉ hưu (Nam)',
            leftValue: `${retirementYear} (${targetRetirementAge} tuổi)`,
            rightLabel: 'Số năm đóng BH',
            rightValue: `${contributionYears} năm`,
          }
        ],
        summaries: [
          {
            title: 'Lương hưu dự kiến',
            value: formatCurrency(monthlyPension) + '/tháng',
            description: `Tỷ lệ hưởng hưu trí: ${(baseRate * 100).toFixed(0)}%`,
          }
        ]
      };
    }
  },
  'severance': {
    caption: 'Trợ cấp thôi việc & BHXH một lần',
    sectionTitle: 'Tính trợ cấp thôi việc',
    sectionSubtitle: 'Điền tổng số trợ cấp và lương bình quân 6 tháng.',
    emptyTitle: 'Chưa có dữ liệu',
    emptyDescription: 'Nhập số trợ cấp để xem.',
    fields: [
      { key: 'amount', label: 'Số tiền trợ cấp', placeholder: '100.000.000' },
      { key: 'avgSalary', label: 'Lương bình quân', placeholder: '10.000.000' }
    ],
    compute: (values) => {
      const amount = toNumber(values.amount);
      const avgSalary = toNumber(values.avgSalary);
      
      if (amount <= 0 || avgSalary <= 0) return null;
      
      const result = calculateSeveranceTax({
        type: 'severance',
        totalAmount: amount,
        averageSalary: avgSalary,
      });
      
      return {
        comparisons: [
          {
            leftLabel: 'Miễn thuế (10 tháng)',
            leftValue: formatCurrency(result.taxExemptAmount),
            rightLabel: 'Chịu thuế (10%)',
            rightValue: formatCurrency(result.taxableIncome),
          }
        ],
        summaries: [
          {
            title: 'Thực nhận',
            value: formatCurrency(result.netAmount),
            description: `Thuế TNCN bị trừ: ${formatCurrency(result.taxAmount)}`,
          }
        ]
      };
    }
  },
  'vat': {
    caption: 'Hoàn/Khấu trừ VAT',
    sectionTitle: 'Hóa đơn đầu vào - đầu ra',
    sectionSubtitle: 'Tính VAT phải nộp = Đầu ra - Đầu vào được khấu trừ.',
    emptyTitle: 'Chưa có thông tin VAT',
    emptyDescription: 'Nhập giá trị đầu vào và đầu ra.',
    fields: [
      { key: 'inputVat', label: 'VAT đầu vào được khấu trừ', placeholder: '10.000.000' },
      { key: 'outputVat', label: 'VAT đầu ra (doanh thu)', placeholder: '25.000.000' }
    ],
    compute: (values) => {
      const input = toNumber(values.inputVat);
      const output = toNumber(values.outputVat);
      if (input <= 0 && output <= 0) return null;
      
      const payable = output - input;
      
      return {
        comparisons: [
          {
            leftLabel: 'VAT đầu ra',
            leftValue: formatCurrency(output),
            rightLabel: 'VAT đầu vào',
            rightValue: formatCurrency(input),
          }
        ],
        summaries: [
          {
            title: payable > 0 ? 'Phải nộp thêm' : 'Được khấu trừ sang kỳ sau',
            value: formatCurrency(Math.abs(payable)),
          }
        ]
      };
    }
  },
  'withholding-tax': {
    caption: 'Thuế nhà thầu (FCT)',
    sectionTitle: 'Thông tin hợp đồng',
    sectionSubtitle: 'Tạm tính thuế nhà thầu giá trị Net (nhà thầu nhận đủ Net).',
    emptyTitle: 'Chưa có giá trị',
    emptyDescription: 'Nhập giá trị hợp đồng Net.',
    fields: [
      { key: 'amount', label: 'Giá trị hợp đồng (Net)', placeholder: '100.000.000' }
    ],
    compute: (values) => {
      const net = toNumber(values.amount);
      if (net <= 0) return null;
      
      // Giả sử dịch vụ 5% VAT, 5% CIT
      const gross = net / (1 - 0.05 - 0.05);
      const vat = gross * 0.05;
      const cit = gross * 0.05;
      
      return {
        comparisons: [
          {
            leftLabel: 'Nhà thầu nhận (Net)',
            leftValue: formatCurrency(net),
            rightLabel: 'Giá trị Gross',
            rightValue: formatCurrency(gross),
          }
        ],
        summaries: [
          {
            title: 'Tổng thuế nhà thầu phải nộp',
            value: formatCurrency(vat + cit),
            description: `VAT: ${formatCurrency(vat)}, CIT: ${formatCurrency(cit)}`,
          }
        ]
      };
    }
  },
  'multi-source-income': {
    caption: 'Tổng hợp thu nhập đa nguồn',
    sectionTitle: 'Cơ cấu thu nhập',
    sectionSubtitle: 'Điền lương 2 nơi.',
    emptyTitle: 'Chưa có dữ liệu',
    emptyDescription: 'Nhập các nguồn thu.',
    fields: [
      { key: 'job1', label: 'Lương công ty 1', placeholder: '20.000.000' },
      { key: 'job2', label: 'Lương công ty 2', placeholder: '15.000.000' }
    ],
    compute: (values) => {
      const job1 = toNumber(values.job1);
      const job2 = toNumber(values.job2);
      if (job1 <= 0 && job2 <= 0) return null;
      
      const tax1 = calculateNewTax({ grossIncome: job1, dependents: 0, hasInsurance: true, region: 1 }).taxAmount;
      const taxCombiner = calculateNewTax({ grossIncome: job1 + job2, dependents: 0, hasInsurance: true, region: 1 }).taxAmount;
      const shortfall = taxCombiner - tax1;
      
      return {
        comparisons: [
          {
            leftLabel: 'Tổng thu nhập Gross',
            leftValue: formatCurrency(job1 + job2),
            rightLabel: 'Tổng thuế phải nộp',
            rightValue: formatCurrency(taxCombiner),
          }
        ],
        summaries: [
          {
            title: 'Thuế phải đóng thêm',
            value: formatCurrency(Math.max(0, shortfall)),
            description: 'Do nguồn 2 thường chỉ khấu trừ 10% hoặc chưa khấu trừ lũy tiến chung.',
          }
        ]
      };
    }
  },
  'crypto-tax': {
    caption: 'Tương lai Thuế Crypto',
    sectionTitle: 'Thử nghiệm tính thuế',
    sectionSubtitle: 'Ví dụ 2% trên lãi tương tự chứng khoán (chưa chính thức).',
    emptyTitle: 'Chưa có thông tin',
    emptyDescription: 'Giao dịch lãi suất ảo.',
    fields: [
      { key: 'gain', label: 'Tiền lãi (Gain)', placeholder: '100.000.000' }
    ],
    compute: (values) => {
      const gain = toNumber(values.gain);
      if (gain <= 0) return null;
      
      const tax = gain * 0.02;
      return {
        comparisons: [
          {
            leftLabel: 'Tiền lãi',
            leftValue: formatCurrency(gain),
            rightLabel: 'Thuế ảo (2%)',
            rightValue: formatCurrency(tax),
          }
        ],
        summaries: [
          {
            title: 'Ghi chú',
            value: 'Đây là công cụ mô phỏng kỳ vọng',
            description: 'Hiện chưa có luật thuế crypto cụ thể tại VN.',
          }
        ]
      };
    }
  },
  'income-summary': {
    caption: 'Bảng kê thu nhập',
    sectionTitle: 'Tổng quan dòng tiền',
    sectionSubtitle: 'Theo dõi sự thay đổi thu nhập hàng tháng.',
    emptyTitle: 'Không có dữ liệu',
    emptyDescription: 'Nhập thu nhập để lập bảng kê.',
    fields: [
      { key: 'monthly', label: 'Thu nhập một tháng', placeholder: '30.000.000' }
    ],
    compute: (values) => {
      const monthly = toNumber(values.monthly);
      if (monthly <= 0) return null;
      
      const total = monthly * 12;
      
      return {
        summaries: [
          {
            title: 'Thu nhập ước tính cả năm',
            value: formatCurrency(total),
          }
        ]
      };
    }
  },
  'monthly-planner': {
    caption: 'Lên kế hoạch hàng tháng',
    sectionTitle: 'Kế hoạch tài chính',
    sectionSubtitle: 'Tỷ lệ 50-30-20.',
    emptyTitle: 'Chưa có Net Income',
    emptyDescription: 'Cung cấp thu nhập Net.',
    fields: [
      { key: 'net', label: 'Thu nhập thực nhận (Net)', placeholder: '25.000.000' }
    ],
    compute: (values) => {
      const net = toNumber(values.net);
      if (net <= 0) return null;
      
      return {
        comparisons: [
          {
            leftLabel: 'Thiết yếu (50%)',
            leftValue: formatCurrency(net * 0.5),
            rightLabel: 'Đầu tư (20%)',
            rightValue: formatCurrency(net * 0.2),
          }
        ],
        summaries: [
          {
            title: 'Chi tiêu cá nhân (30%)',
            value: formatCurrency(net * 0.3),
          }
        ]
      };
    }
  },
  'mua-nha': {
    caption: 'Khoản trả góp mua nhà',
    sectionTitle: 'Tính khoản vay mua nhà',
    sectionSubtitle: 'Trả góp hàng tháng.',
    emptyTitle: 'Chưa có thông tin',
    emptyDescription: 'Nhập khoản vay.',
    fields: [
      { key: 'loan', label: 'Số tiền vay', placeholder: '1.500.000.000' },
      { key: 'years', label: 'Số năm vay', placeholder: '10' }
    ],
    compute: (values) => {
      const loan = toNumber(values.loan);
      const years = toNumber(values.years);
      if (loan <= 0 || years <= 0) return null;
      
      const rate = 0.08 / 12; // 8% / năm
      const months = years * 12;
      const pmt = loan * (rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
      
      return {
        summaries: [
          {
            title: 'Trả góp mỗi tháng',
            value: formatCurrency(pmt),
            description: 'Tính theo lãi suất 8%/năm, dư nợ giảm dần.',
          }
        ]
      };
    }
  },
  'inheritance-gift': {
    caption: 'Thuế Thừa kế, Quà tặng',
    sectionTitle: 'Thông tin quà tặng/thừa kế',
    sectionSubtitle: 'Mức thuế 10% cho phần giá trị trên 10 triệu VNĐ.',
    emptyTitle: 'Chưa có giá trị',
    emptyDescription: 'Nhập giá trị tài sản.',
    fields: [
      { key: 'value', label: 'Giá trị tài sản', placeholder: '500.000.000' }
    ],
    compute: (values) => {
      const value = toNumber(values.value);
      if (value <= 0) return null;
      
      const taxable = Math.max(0, value - 10000000);
      const taxAmount = taxable * 0.10;
      
      return {
        comparisons: [
          {
            leftLabel: 'Giá trị tính thuế',
            leftValue: formatCurrency(taxable),
            rightLabel: 'Thuế phải nộp (10%)',
            rightValue: formatCurrency(taxAmount),
          }
        ],
        summaries: [
          {
            title: 'Số tiền thực nhận',
            value: formatCurrency(value - taxAmount),
          }
        ]
      };
    }
  },
  'late-payment': {
    caption: 'Lãi chậm nộp',
    sectionTitle: 'Thông tin nợ thuế',
    sectionSubtitle: 'Tính tiền phạt chậm nộp (0.03%/ngày).',
    emptyTitle: 'Chưa có thông tin',
    emptyDescription: 'Nhập số tiền nợ thuế và số ngày quá hạn.',
    fields: [
      { key: 'principal', label: 'Số tiền nợ thuế gốc', placeholder: '10.000.000' },
      { key: 'days', label: 'Số ngày chậm nộp', placeholder: '15' }
    ],
    compute: (values) => {
      const principal = toNumber(values.principal);
      const days = toNumber(values.days);
      if (principal <= 0 || days <= 0) return null;
      
      const dueDate = new Date();
      const paymentDate = new Date();
      paymentDate.setDate(dueDate.getDate() + days);

      const result = calculateLatePayment({
        taxAmount: principal,
        dueDate,
        paymentDate,
        taxType: 'other',
      });
      
      return {
        comparisons: [
          {
            leftLabel: 'Tiền phạt chậm nộp',
            leftValue: formatCurrency(result.interestAmount),
            rightLabel: 'Tổng cộng',
            rightValue: formatCurrency(result.totalAmount),
          }
        ],
        summaries: [
          {
            title: 'Quy định phạt',
            value: 'Lãi suất 0.03%/ngày',
            description: result.legalNote,
          }
        ]
      };
    }
  },
  'insurance': {
    caption: 'Chi tiết bảo hiểm',
    sectionTitle: 'Luật bảo hiểm',
    sectionSubtitle: 'Tra cứu nhanh tỷ lệ và mức đóng.',
    emptyTitle: 'Chưa có thông tin',
    emptyDescription: '',
    fields: [],
    compute: () => ({
      comparisons: [
        { leftLabel: 'Nhân viên đóng', leftValue: '10.5%', rightLabel: 'Công ty đóng', rightValue: '21.5%' },
        { leftLabel: 'Mức trần BHXH/BHYT', leftValue: '46.800.000', rightLabel: 'Mức trần BHTN', rightValue: '93.600.000' }
      ],
      summaries: [
        { title: 'Thành phần (Nhân viên)', value: 'BHXH 8%, BHYT 1.5%, BHTN 1%' },
        { title: 'Thành phần (Công ty)', value: 'BHXH 17.5%, BHYT 3%, BHTN 1%' }
      ]
    })
  },
  'other-income': {
    caption: 'Thu nhập khác',
    sectionTitle: 'Thuế thu nhập đặc thù',
    sectionSubtitle: 'Bản quyền, trúng thưởng, nhượng quyền.',
    emptyTitle: '',
    emptyDescription: '',
    fields: [],
    compute: () => ({
      comparisons: [
        { leftLabel: 'Bản quyền, nhượng quyền', leftValue: '5%', rightLabel: 'Trúng thưởng', rightValue: '10%' }
      ],
      summaries: [
        { title: 'Lưu ý', value: 'Áp dụng cho thu nhập > 10 triệu VNĐ' }
      ]
    })
  },
  'table': {
    caption: 'Biểu thuế suất 2026',
    sectionTitle: 'Biểu thuế 5 bậc (Mới)',
    sectionSubtitle: 'Luật 109/2025/QH15',
    emptyTitle: '',
    emptyDescription: '',
    fields: [],
    compute: () => ({
      comparisons: [
        { leftLabel: 'Bậc 1 (Đến 10tr)', leftValue: '5%', rightLabel: 'Bậc 2 (10-20tr)', rightValue: '10%' },
        { leftLabel: 'Bậc 3 (20-40tr)', leftValue: '20%', rightLabel: 'Bậc 4 (40-80tr)', rightValue: '28%' }
      ],
      summaries: [
        { title: 'Bậc 5 (Trên 80tr)', value: '35%' },
        { title: 'Giảm trừ gia cảnh', value: '11tr/người nộp, 4.4tr/người phụ thuộc (không đổi)' }
      ]
    })
  },
  'tax-history': {
    caption: 'Lịch sử luật thuế',
    sectionTitle: 'Các thay đổi chính',
    sectionSubtitle: 'So sánh Luật thuế cũ và mới.',
    emptyTitle: '',
    emptyDescription: '',
    fields: [],
    compute: () => ({
      summaries: [
        { title: 'Luật thuế TNCN (Cũ, 7 bậc)', value: 'Khoảng cách các bậc hẹp.', description: 'Dễ khiến người nộp thuế bị nhảy bậc khi lương dao động nhỏ.' },
        { title: 'Luật 109/2025/QH15 (Từ 2026)', value: 'Chỉ còn 5 bậc.', description: 'Giãn rộng khoảng cách các bậc, giảm gánh nặng thuế cho đa số.' }
      ]
    })
  },
  'tax-calendar': {
    caption: 'Lịch thuế',
    sectionTitle: 'Các mốc quan trọng',
    sectionSubtitle: 'Kỳ kê khai và nộp thuế.',
    emptyTitle: '',
    emptyDescription: '',
    fields: [],
    compute: () => ({
      summaries: [
        { title: 'Hàng tháng', value: 'Ngày 20', description: 'Nộp hồ sơ khai thuế và tiền thuế của tháng trước.' },
        { title: 'Hàng quý', value: 'Ngày cuối tháng đầu quý tiếp theo', description: 'Nộp hồ sơ và tiền thuế quý trước.' },
        { title: 'Quyết toán năm', value: 'Ngày 31/3 năm sau', description: 'Hạn chót quyết toán thuế TNCN và TNDN.' }
      ]
    })
  },
  'salary-slip': {
    caption: 'Phiếu lương (Mô phỏng)',
    sectionTitle: 'Tạo phiếu lương',
    sectionSubtitle: 'Nhập tổng lương để minh họa các khoản khấu trừ.',
    emptyTitle: 'Chưa có thông tin',
    emptyDescription: 'Nhập lương Gross.',
    fields: [
      { key: 'gross', label: 'Lương Gross', placeholder: '20.000.000' }
    ],
    compute: (values) => {
      const gross = toNumber(values.gross);
      if (gross <= 0) return null;
      const result = calculateNewTax({ grossIncome: gross, dependents: 0, hasInsurance: true, region: 1 });
      return {
        comparisons: [
          { leftLabel: 'Lương Gross', leftValue: formatCurrency(gross), rightLabel: 'Bảo hiểm (10.5%)', rightValue: formatCurrency(result.insuranceDeduction) },
          { leftLabel: 'Thuế TNCN', leftValue: formatCurrency(result.taxAmount), rightLabel: 'Thực nhận (Net)', rightValue: formatCurrency(result.netIncome) }
        ],
        summaries: []
      };
    }
  },
  'exemption-checker': {
    caption: 'Miễn thuế TNCN',
    sectionTitle: 'Các khoản được miễn thuế',
    sectionSubtitle: 'Theo quy định hiện hành.',
    emptyTitle: '',
    emptyDescription: '',
    fields: [],
    compute: () => ({
      summaries: [
        { title: 'Phụ cấp ăn trưa', value: 'Tối đa 730k/tháng' },
        { title: 'Trang phục', value: 'Tối đa 5tr/năm (nếu chi bằng tiền)' },
        { title: 'Làm thêm giờ', value: 'Phần chênh lệch so với giờ làm việc bình thường.' }
      ]
    })
  },
  'tax-document': {
    caption: 'Tạo báo cáo thuế',
    sectionTitle: 'Báo cáo thuế TNCN',
    sectionSubtitle: 'Tổng hợp thu nhập tính thuế.',
    emptyTitle: 'Chưa có thông tin',
    emptyDescription: 'Nhập thu nhập để tạo report nhanh.',
    fields: [
      { key: 'annual', label: 'Tổng thu nhập cả năm', placeholder: '350.000.000' }
    ],
    compute: (values) => {
      const annual = toNumber(values.annual);
      if (annual <= 0) return null;
      return {
        summaries: [
          { title: 'Mẫu số 02/QTT-TNCN', value: 'Hồ sơ quyết toán TNCN', description: 'Cá nhân tự quyết toán sử dụng mẫu này, nộp kèm chứng từ khấu trừ.' },
          { title: 'Giá trị đã nhập', value: formatCurrency(annual) }
        ]
      }
    }
  },
  'tax-treaty': {
    caption: 'Hiệp định tránh đánh thuế 2 lần',
    sectionTitle: 'Tra cứu hiệp định',
    sectionSubtitle: 'Các quốc gia có hiệp định với Việt Nam.',
    emptyTitle: '',
    emptyDescription: '',
    fields: [],
    compute: () => ({
      summaries: [
        { title: 'Tổng quan', value: '> 80 quốc gia/vùng lãnh thổ', description: 'Gồm Mỹ, Nhật Bản, Hàn Quốc, EU, Trung Quốc, v.v.' },
        { title: 'Lưu ý', value: 'Cần giấy chứng nhận cư trú để miễn/giảm thuế theo hiệp định.' }
      ]
    })
  },
  'tax-deadline': {
    caption: 'Hạn chót thuế',
    sectionTitle: 'Mốc thời gian',
    sectionSubtitle: 'Kỳ nộp và quyết toán.',
    emptyTitle: '',
    emptyDescription: '',
    fields: [],
    compute: () => ({
      summaries: [
        { title: 'Quyết toán thuế 2025', value: 'Hạn chót: 31/03/2026' },
        { title: 'Bắt đầu áp dụng Luật mới', value: 'Từ 01/01/2026' }
      ]
    })
  },
  'tax-optimization-tips': {
    caption: 'Mẹo tối ưu thuế',
    sectionTitle: 'Khuyến nghị tối ưu',
    sectionSubtitle: 'Các cách hợp pháp để giảm nghĩa vụ thuế.',
    emptyTitle: '',
    emptyDescription: '',
    fields: [],
    compute: () => ({
      summaries: [
        { title: 'Đóng góp tự nguyện', value: 'Bảo hiểm hưu trí tự nguyện', description: 'Được trừ tối đa 1 triệu/tháng.' },
        { title: 'Phụ cấp được miễn', value: 'Tối ưu cơ cấu lương', description: 'Tăng phụ cấp ăn trưa, điện thoại, đồng phục hợp lý.' },
        { title: 'Khai báo người phụ thuộc', value: 'Tối ưu giảm trừ', description: 'Nhớ bổ sung cha mẹ trên tuổi lao động, không có thu nhập hoặc thu nhập < 1 triệu/tháng.' }
      ]
    })
  }
};

export function getExtendedToolRuntime({
  slug,
  values,
  saveDraft,
  clearDraft,
  hasDraft,
}: ExtendedToolRuntimeParams): ExtendedToolRuntimeResult | null {
  const config = RUNTIME_CONFIGS[slug];

  if (!config) {
    return null;
  }

  return {
    caption: config.caption,
    body: (
      <ConfiguredRuntime
        slug={slug}
        config={config}
        values={values}
        saveDraft={saveDraft}
        clearDraft={clearDraft}
        hasDraft={hasDraft}
      />
    ),
  };
}
