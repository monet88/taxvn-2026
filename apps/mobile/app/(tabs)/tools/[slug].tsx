import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

import {
  ActionRow,
  CalculatorScreen,
  ComparisonBlock,
  EmptyResult,
  NumericInput,
  ResultSummary,
  SectionCard,
  getExtendedToolRuntime,
} from '@/components/calculators';
import { getToolById } from '@/constants/toolRegistry';
import {
  calculateNewTax,
  calculateOldTax,
  calculateOvertime,
  compareCompanyOffers,
  createDefaultCompanyOffer,
  formatCurrency,
  getFullEmployerCostResult,
  grossToNet,
} from '@/lib/taxCore';
import { useCalculatorStore } from '@/stores/useCalculatorStore';
import { formatCurrencyInput } from '@/utils/numericInput';

interface ToolDetailScreenContentProps {
  slug: string;
}

interface RuntimeDraftValues {
  [key: string]: string | undefined;
  primaryAmount?: string;
  overtimeHours?: string;
  offerA?: string;
  offerB?: string;
}

function toNumber(value?: string): number {
  return value ? Number(value) : 0;
}

function DraftRuntime({
  slug,
  draft,
  saveDraft,
  clearDraft,
}: {
  slug: string;
  draft?: { values: Record<string, string> };
  saveDraft: (toolId: string, values: Record<string, string>) => void;
  clearDraft: (toolId: string) => void;
}) {
  const primaryAmount = draft?.values.primaryAmount ?? '';
  const formattedPrimaryAmount = formatCurrencyInput(primaryAmount);

  return (
    <>
      <SectionCard
        title="Bản nháp đầu vào"
        subtitle="Giá trị nhập ở đây sẽ được lưu theo từng tool để các màn live calculator có thể khôi phục lại ở kế hoạch tiếp theo."
      >
        <NumericInput
          label="Giá trị nháp"
          accessibilityLabel="Giá trị nháp"
          value={primaryAmount}
          onChangeText={(nextValue) => saveDraft(slug, { primaryAmount: nextValue })}
          placeholder="Nhập số tiền cần thử"
          helperText="Chỉ giữ chữ số, nhưng giao diện luôn hiển thị định dạng tiền Việt."
        />
      </SectionCard>

      {primaryAmount ? (
        <ResultSummary
          title="Đã lưu trên thiết bị"
          value={formattedPrimaryAmount}
          description="Bản nháp sẽ được khôi phục khi bạn mở lại đúng công cụ này."
        />
      ) : (
        <EmptyResult
          title="Chưa có bản nháp"
          description="Nhập một giá trị để kiểm tra luồng lưu khôi phục trước khi live calculator được gắn vào màn hình."
        />
      )}

      <ActionRow
        secondaryLabel="Xóa bản nháp"
        secondaryDisabled={!draft}
        onSecondaryPress={() => clearDraft(slug)}
      />
    </>
  );
}

function CalculatorRuntime({
  slug,
  values,
  saveDraft,
  clearDraft,
  hasDraft,
}: {
  slug: string;
  values: RuntimeDraftValues;
  saveDraft: (toolId: string, values: Record<string, string>) => void;
  clearDraft: (toolId: string) => void;
  hasDraft: boolean;
}) {
  const grossIncome = toNumber(values.primaryAmount);
  const oldResult = grossIncome
    ? calculateOldTax({ grossIncome, dependents: 0, hasInsurance: true, region: 1 })
    : null;
  const newResult = grossIncome
    ? calculateNewTax({ grossIncome, dependents: 0, hasInsurance: true, region: 1 })
    : null;

  return (
    <>
      <SectionCard
        title="Thu nhập gross hàng tháng"
        subtitle="Nhập mức lương để so sánh ngay biểu thuế 7 bậc và 5 bậc từ tax-core."
      >
        <NumericInput
          label="Giá trị nháp"
          accessibilityLabel="Giá trị nháp"
          value={values.primaryAmount ?? ''}
          onChangeText={(nextValue) => saveDraft(slug, { primaryAmount: nextValue })}
          placeholder="Ví dụ 30.000.000"
          helperText="Kết quả cập nhật ngay theo cùng công thức đang dùng ở web."
        />
      </SectionCard>

      {oldResult && newResult ? (
        <>
          <ComparisonBlock
            leftLabel="Thuế theo luật cũ"
            leftValue={formatCurrency(oldResult.taxAmount)}
            rightLabel="Thuế theo luật mới"
            rightValue={formatCurrency(newResult.taxAmount)}
            helperText={`Tiết kiệm ${formatCurrency(oldResult.taxAmount - newResult.taxAmount)} mỗi tháng khi áp dụng luật mới.`}
          />
          <ResultSummary
            title="Net theo luật mới"
            value={formatCurrency(newResult.netIncome)}
            description={`Thu nhập tính thuế: ${formatCurrency(newResult.taxableIncome)}`}
          />
        </>
      ) : (
        <EmptyResult
          title="Chưa có dữ liệu tính thuế"
          description="Nhập gross income để xem so sánh luật cũ và luật mới."
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

function GrossNetRuntime({
  slug,
  values,
  saveDraft,
  clearDraft,
  hasDraft,
}: {
  slug: string;
  values: RuntimeDraftValues;
  saveDraft: (toolId: string, values: Record<string, string>) => void;
  clearDraft: (toolId: string) => void;
  hasDraft: boolean;
}) {
  const amount = toNumber(values.primaryAmount);
  const result = amount
    ? grossToNet({
        amount,
        type: 'gross',
        dependents: 0,
        hasInsurance: true,
        useNewLaw: true,
        region: 1,
      })
    : null;

  return (
    <>
      <SectionCard
        title="Gross cần quy đổi"
        subtitle="Phiên bản wave 3 bắt đầu với luồng gross → net dùng trực tiếp từ tax-core."
      >
        <NumericInput
          label="Giá trị nháp"
          accessibilityLabel="Giá trị nháp"
          value={values.primaryAmount ?? ''}
          onChangeText={(nextValue) => saveDraft(slug, { primaryAmount: nextValue })}
          placeholder="Ví dụ 30.000.000"
          helperText="Tính gross → net với bảo hiểm đầy đủ và luật 2026."
        />
      </SectionCard>

      {result ? (
        <>
          <ResultSummary
            title="Net ước tính"
            value={formatCurrency(result.net)}
            description={`Thuế ${formatCurrency(result.tax)} • Bảo hiểm ${formatCurrency(result.insurance)}`}
          />
          <ComparisonBlock
            leftLabel="Gross"
            leftValue={formatCurrency(result.gross)}
            rightLabel="Taxable income"
            rightValue={formatCurrency(result.taxableIncome)}
          />
        </>
      ) : (
        <EmptyResult
          title="Chưa có dữ liệu quy đổi"
          description="Nhập mức gross để xem net, thuế và bảo hiểm."
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

function OvertimeRuntime({
  slug,
  values,
  saveDraft,
  clearDraft,
  hasDraft,
}: {
  slug: string;
  values: RuntimeDraftValues;
  saveDraft: (toolId: string, values: Record<string, string>) => void;
  clearDraft: (toolId: string) => void;
  hasDraft: boolean;
}) {
  const monthlySalary = toNumber(values.primaryAmount);
  const overtimeHours = toNumber(values.overtimeHours);
  const result =
    monthlySalary > 0 && overtimeHours > 0
      ? calculateOvertime({
          monthlySalary,
          workingDaysPerMonth: 26,
          hoursPerDay: 8,
          entries: [{ id: 'weekday-day', type: 'weekday', shift: 'day', hours: overtimeHours }],
          includeHolidayBasePay: false,
          dependents: 0,
          otherDeductions: 0,
          hasInsurance: true,
          insuranceOptions: { bhxh: true, bhyt: true, bhtn: true },
          region: 1,
          useNewLaw: true,
        })
      : null;

  return (
    <>
      <SectionCard
        title="Tăng ca ngày thường"
        subtitle="Mẫu live đầu tiên của calculator tăng ca: ca ngày ngày thường với đầu vào tối thiểu."
      >
        <NumericInput
          label="Lương tháng"
          accessibilityLabel="Lương tháng"
          value={values.primaryAmount ?? ''}
          onChangeText={(nextValue) => saveDraft(slug, { primaryAmount: nextValue })}
          placeholder="Ví dụ 20.000.000"
        />
        <NumericInput
          label="Giờ tăng ca"
          accessibilityLabel="Giờ tăng ca"
          value={values.overtimeHours ?? ''}
          onChangeText={(nextValue) => saveDraft(slug, { overtimeHours: nextValue })}
          placeholder="Ví dụ 20"
        />
      </SectionCard>

      {result ? (
        <>
          <ResultSummary
            title="Thu nhập tăng ca"
            value={formatCurrency(result.totalOvertimeGross)}
            description={`Phần miễn thuế: ${formatCurrency(result.totalTaxExemptOvertime)}`}
          />
          <ComparisonBlock
            leftLabel="Net tháng"
            leftValue={formatCurrency(result.netIncome)}
            rightLabel="Thuế tháng"
            rightValue={formatCurrency(result.taxAmount)}
          />
        </>
      ) : (
        <EmptyResult
          title="Chưa có dữ liệu tăng ca"
          description="Nhập lương tháng và số giờ tăng ca để xem kết quả trực tiếp."
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

function SalaryCompareRuntime({
  slug,
  values,
  saveDraft,
  clearDraft,
  hasDraft,
}: {
  slug: string;
  values: RuntimeDraftValues;
  saveDraft: (toolId: string, values: Record<string, string>) => void;
  clearDraft: (toolId: string) => void;
  hasDraft: boolean;
}) {
  const offerA = toNumber(values.offerA);
  const offerB = toNumber(values.offerB);
  const result =
    offerA > 0 && offerB > 0
      ? compareCompanyOffers(
          [
            { ...createDefaultCompanyOffer('offer-a', 'Offer A'), grossSalary: offerA },
            { ...createDefaultCompanyOffer('offer-b', 'Offer B'), grossSalary: offerB },
          ],
          0,
          true
        )
      : null;

  const monthlyDiff =
    result && result.companies.length >= 2
      ? Math.abs(result.companies[0].monthlyNet - result.companies[1].monthlyNet)
      : 0;

  return (
    <>
      <SectionCard
        title="So sánh offer"
        subtitle="Nhập hai mức lương gross để so sánh NET tháng và NET năm theo tax-core."
      >
        <NumericInput
          label="Offer A"
          accessibilityLabel="Offer A"
          value={values.offerA ?? ''}
          onChangeText={(nextValue) => saveDraft(slug, { offerA: nextValue })}
          placeholder="Ví dụ 25.000.000"
        />
        <NumericInput
          label="Offer B"
          accessibilityLabel="Offer B"
          value={values.offerB ?? ''}
          onChangeText={(nextValue) => saveDraft(slug, { offerB: nextValue })}
          placeholder="Ví dụ 32.000.000"
        />
      </SectionCard>

      {result ? (
        <>
          <ComparisonBlock
            leftLabel="Offer A"
            leftValue={formatCurrency(result.companies[0].monthlyNet)}
            rightLabel="Offer B"
            rightValue={formatCurrency(result.companies[1].monthlyNet)}
            helperText={`Offer tốt hơn theo NET tháng: ${result.companies[result.bestOffer.byMonthlyNet].companyName}`}
          />
          <ResultSummary
            title="Chênh lệch NET tháng"
            value={formatCurrency(monthlyDiff)}
            description={`Chênh lệch NET năm tối đa: ${formatCurrency(result.differences.maxAnnualDiff)}`}
          />
        </>
      ) : (
        <EmptyResult
          title="Chưa đủ dữ liệu so sánh"
          description="Nhập cả Offer A và Offer B để so sánh kết quả."
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

import { shareToolState } from '../../../utils/sharing';

export function ToolDetailScreenContent({ slug }: ToolDetailScreenContentProps) {
  const tool = getToolById(slug);
  const draft = useCalculatorStore((state) => state.drafts[slug]);
  const saveDraft = useCalculatorStore((state) => state.saveDraft);
  const clearDraft = useCalculatorStore((state) => state.clearDraft);

  if (!tool) {
    return (
      <CalculatorScreen
        title="Không tìm thấy công cụ"
        description="Slug hiện tại không khớp với registry công cụ của Phase 4."
      >
        <EmptyResult
          title="Không có dữ liệu để hiển thị"
          description="Kiểm tra lại route hoặc cập nhật registry trước khi mở màn hình chi tiết."
        />
      </CalculatorScreen>
    );
  }

  const values = (draft?.values ?? {}) as RuntimeDraftValues;
  const hasDraft = Boolean(draft);
  
  const handleShare = () => {
    shareToolState(slug, values, tool.title);
  };

  let runtimeBody = (
    <DraftRuntime
      slug={slug}
      draft={draft}
      saveDraft={saveDraft}
      clearDraft={clearDraft}
    />
  );

  let caption =
    'Giai đoạn 04-02 thiết lập runtime dùng chung: route, input số và lưu nháp theo tool slug.';

  if (slug === 'calculator') {
    runtimeBody = (
      <CalculatorRuntime
        slug={slug}
        values={values}
        saveDraft={saveDraft}
        clearDraft={clearDraft}
        hasDraft={hasDraft}
      />
    );
    caption = 'Wave 3 bắt đầu gắn các calculator có lượng dùng cao trực tiếp vào tax-core.';
  } else if (slug === 'gross-net') {
    runtimeBody = (
      <GrossNetRuntime
        slug={slug}
        values={values}
        saveDraft={saveDraft}
        clearDraft={clearDraft}
        hasDraft={hasDraft}
      />
    );
    caption = 'Bản gross → net mobile đầu tiên dùng thẳng công thức nhị phân từ tax-core.';
  } else if (slug === 'overtime') {
    runtimeBody = (
      <OvertimeRuntime
        slug={slug}
        values={values}
        saveDraft={saveDraft}
        clearDraft={clearDraft}
        hasDraft={hasDraft}
      />
    );
    caption = 'Calculator tăng ca bắt đầu bằng kịch bản ngày thường, ca ngày để khóa luồng live.';
  } else if (slug === 'salary-compare') {
    runtimeBody = (
      <SalaryCompareRuntime
        slug={slug}
        values={values}
        saveDraft={saveDraft}
        clearDraft={clearDraft}
        hasDraft={hasDraft}
      />
    );
    caption = 'Comparison flow đầu tiên dùng tax-core để so sánh ngay NET tháng và NET năm giữa hai offer.';
  } else if (slug === 'employer-cost') {
    const grossIncome = toNumber(values.primaryAmount);
    const employerResult = grossIncome
      ? getFullEmployerCostResult({
          grossIncome,
          dependents: 0,
          region: 1,
          insuranceOptions: { bhxh: true, bhyt: true, bhtn: true },
        })
      : null;

    runtimeBody = (
      <>
        <SectionCard
          title="Lương gross"
          subtitle="Bản live đầu tiên cho chi phí nhà tuyển dụng."
        >
          <NumericInput
            label="Giá trị nháp"
            accessibilityLabel="Giá trị nháp"
            value={values.primaryAmount ?? ''}
            onChangeText={(nextValue) => saveDraft(slug, { primaryAmount: nextValue })}
            placeholder="Ví dụ 35.000.000"
          />
        </SectionCard>

        {employerResult ? (
          <>
            <ResultSummary
              title="Tổng chi phí nhà tuyển dụng"
              value={formatCurrency(employerResult.totalEmployerCost)}
              description={`NET nhân viên: ${formatCurrency(employerResult.employeeNetIncome)}`}
            />
            <ComparisonBlock
              leftLabel="BH phía công ty"
              leftValue={formatCurrency(employerResult.employerInsurance.total)}
              rightLabel="Thuế nhân viên"
              rightValue={formatCurrency(employerResult.employeeTax)}
            />
          </>
        ) : (
          <EmptyResult
            title="Chưa có dữ liệu chi phí"
            description="Nhập gross để xem chi phí bảo hiểm và tổng cost."
          />
        )}

        <ActionRow
          secondaryLabel="Xóa bản nháp"
          secondaryDisabled={!hasDraft}
          onSecondaryPress={() => clearDraft(slug)}
        />
      </>
    );
    caption = 'Employer-cost được nối vào tax-core để so sánh góc nhìn công ty và nhân viên ngay trên mobile.';
  }

  const extendedRuntime = getExtendedToolRuntime({
    slug,
    values,
    saveDraft,
    clearDraft,
    hasDraft,
  });

  if (extendedRuntime) {
    runtimeBody = extendedRuntime.body;
    caption = extendedRuntime.caption;
  }

  return (
    <CalculatorScreen
      title={tool.title}
      description={tool.description}
      badge={draft ? 'Bản nháp' : undefined}
      caption={caption}
      onShare={hasDraft ? handleShare : undefined}
    >
      {runtimeBody}
    </CalculatorScreen>
  );
}

export default function ToolDetailScreen() {
  const params = useLocalSearchParams<{ slug?: string | string[] }>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  return <ToolDetailScreenContent slug={slug ?? ''} />;
}
