export type ToolGroup = 'calculate' | 'compare' | 'reference';

export interface ToolDefinition {
  id: string;
  requirementId: string;
  title: string;
  description: string;
  group: ToolGroup;
}

export const TOOL_GROUP_META: Record<
  ToolGroup,
  { title: string; subtitle: string }
> = {
  calculate: {
    title: 'Tính toán',
    subtitle: 'Các công cụ tính thuế và mô phỏng trực tiếp trên thiết bị.',
  },
  compare: {
    title: 'So sánh',
    subtitle: 'So sánh phương án, kịch bản, vùng và hình thức thu nhập.',
  },
  reference: {
    title: 'Tham khảo',
    subtitle: 'Tra cứu bảng biểu, lịch, chứng từ và dữ liệu nền phục vụ quyết định.',
  },
};

export const TOOL_REGISTRY: ToolDefinition[] = [
  { id: 'calculator', requirementId: 'CALC-01', title: 'Tính thuế TNCN', description: 'So sánh biểu thuế 7 bậc và 5 bậc.', group: 'calculate' },
  { id: 'gross-net', requirementId: 'CALC-02', title: 'GROSS ⇄ NET', description: 'Quy đổi lương gross và net theo luật 2026.', group: 'calculate' },
  { id: 'overtime', requirementId: 'CALC-03', title: 'Lương tăng ca', description: 'Tính phần thu nhập tăng ca và thuế liên quan.', group: 'calculate' },
  { id: 'annual-settlement', requirementId: 'CALC-04', title: 'Quyết toán thuế năm', description: 'Đối chiếu số đã khấu trừ với nghĩa vụ cuối năm.', group: 'calculate' },
  { id: 'bonus-calculator', requirementId: 'CALC-05', title: 'Thưởng Tết', description: 'Ước tính thuế cho khoản thưởng và thực nhận.', group: 'calculate' },
  { id: 'esop-calculator', requirementId: 'CALC-06', title: 'Thuế ESOP', description: 'Tính nghĩa vụ thuế khi nhận và bán ESOP.', group: 'calculate' },
  { id: 'foreigner-tax', requirementId: 'CALC-07', title: 'Thuế người nước ngoài', description: 'Mô hình resident, non-resident và khoản giảm trừ.', group: 'calculate' },
  { id: 'securities', requirementId: 'CALC-08', title: 'Thuế chứng khoán', description: 'Giao dịch cổ phiếu, cổ tức và trái phiếu.', group: 'calculate' },
  { id: 'rental', requirementId: 'CALC-09', title: 'Thuế cho thuê tài sản', description: 'Tính thuế cho thuê nhà, văn phòng, tài sản.', group: 'calculate' },
  { id: 'household-business', requirementId: 'CALC-10', title: 'Thuế hộ kinh doanh', description: 'Ước tính thuế khoán và các phương án kê khai.', group: 'calculate' },
  { id: 'real-estate', requirementId: 'CALC-11', title: 'Thuế chuyển nhượng BĐS', description: 'Tính thuế khi bán nhà đất và chi phí đi kèm.', group: 'calculate' },
  { id: 'pension', requirementId: 'CALC-16', title: 'Dự tính lương hưu', description: 'Mô phỏng mức hưởng lương hưu và phương án đóng.', group: 'calculate' },
  { id: 'severance', requirementId: 'CALC-26', title: 'Trợ cấp thôi việc', description: 'Ước tính trợ cấp và quyền lợi liên quan.', group: 'calculate' },
  { id: 'vat', requirementId: 'CALC-28', title: 'Thuế GTGT', description: 'So sánh phương pháp trực tiếp và khấu trừ.', group: 'calculate' },
  { id: 'withholding-tax', requirementId: 'CALC-29', title: 'Khấu trừ tại nguồn', description: 'Tính thuế khấu trừ cho nhiều đối tượng thu nhập.', group: 'calculate' },
  { id: 'multi-source-income', requirementId: 'CALC-30', title: 'Thu nhập đa nguồn', description: 'Tổng hợp và tối ưu nghĩa vụ thuế nhiều nguồn.', group: 'calculate' },
  { id: 'content-creator', requirementId: 'CALC-33', title: 'Thuế content creator', description: 'Áp cho YouTube, TikTok, affiliate và KOL.', group: 'calculate' },
  { id: 'crypto-tax', requirementId: 'CALC-34', title: 'Thuế crypto', description: 'Ước tính nghĩa vụ thuế cho giao dịch crypto/NFT.', group: 'calculate' },
  { id: 'income-summary', requirementId: 'CALC-36', title: 'Tổng hợp thu nhập', description: 'Dashboard tổng hợp thu nhập và thuế cả năm.', group: 'calculate' },
  { id: 'monthly-planner', requirementId: 'CALC-38', title: 'Kế hoạch 12 tháng', description: 'Lập kế hoạch lương và thuế theo từng tháng.', group: 'calculate' },
  { id: 'mua-nha', requirementId: 'CALC-39', title: 'Vay mua nhà', description: 'Tính khả năng vay, trả góp và chi phí liên quan.', group: 'calculate' },
  { id: 'inheritance-gift', requirementId: 'CALC-42', title: 'Thuế thừa kế / quà tặng', description: 'Kiểm tra miễn trừ và số thuế phải nộp.', group: 'calculate' },

  { id: 'employer-cost', requirementId: 'CALC-12', title: 'Chi phí nhà tuyển dụng', description: 'So sánh tổng chi phí khi tuyển dụng và trả lương.', group: 'compare' },
  { id: 'freelancer', requirementId: 'CALC-13', title: 'Freelancer vs Fulltime', description: 'So sánh net income giữa nhiều hình thức làm việc.', group: 'compare' },
  { id: 'salary-compare', requirementId: 'CALC-14', title: 'So sánh offer', description: 'Đặt nhiều offer lương cạnh nhau để ra quyết định.', group: 'compare' },
  { id: 'yearly', requirementId: 'CALC-15', title: 'So sánh theo năm', description: 'Xem nghĩa vụ thuế giữa các năm và các luật.', group: 'compare' },
  { id: 'business-form', requirementId: 'CALC-25', title: 'Hình thức kinh doanh', description: 'So sánh lương, freelancer và hộ kinh doanh.', group: 'compare' },
  { id: 'couple-optimizer', requirementId: 'CALC-32', title: 'Tối ưu thuế vợ chồng', description: 'Phân bổ thu nhập để tối ưu tổng nghĩa vụ hộ gia đình.', group: 'compare' },
  { id: 'region-compare', requirementId: 'CALC-37', title: 'So sánh theo vùng', description: 'Đặt các vùng lương tối thiểu và net income cạnh nhau.', group: 'compare' },
  { id: 'tax-planning-simulator', requirementId: 'CALC-41', title: 'Mô phỏng kế hoạch thuế', description: 'Chạy các kịch bản thuế và so sánh tác động.', group: 'compare' },

  { id: 'insurance', requirementId: 'CALC-17', title: 'Chi tiết bảo hiểm', description: 'Tra cứu và giải thích BHXH, BHYT, BHTN.', group: 'reference' },
  { id: 'other-income', requirementId: 'CALC-18', title: 'Thu nhập khác', description: 'Tra cứu quy tắc với các khoản thu nhập đặc thù.', group: 'reference' },
  { id: 'table', requirementId: 'CALC-19', title: 'Biểu thuế suất', description: 'Xem nhanh các biểu thuế và ngưỡng áp dụng.', group: 'reference' },
  { id: 'tax-history', requirementId: 'CALC-20', title: 'Lịch sử luật thuế', description: 'Theo dõi các thay đổi pháp lý qua từng giai đoạn.', group: 'reference' },
  { id: 'tax-calendar', requirementId: 'CALC-21', title: 'Lịch thuế', description: 'Các mốc kê khai, nộp thuế và quyết toán quan trọng.', group: 'reference' },
  { id: 'salary-slip', requirementId: 'CALC-22', title: 'Phiếu lương', description: 'Tạo và giải thích cấu trúc phiếu lương hàng tháng.', group: 'reference' },
  { id: 'exemption-checker', requirementId: 'CALC-23', title: 'Miễn thuế TNCN', description: 'Kiểm tra các khoản thu nhập được miễn thuế.', group: 'reference' },
  { id: 'late-payment', requirementId: 'CALC-24', title: 'Lãi chậm nộp', description: 'Ước tính tiền chậm nộp theo số ngày quá hạn.', group: 'reference' },
  { id: 'tax-document', requirementId: 'CALC-27', title: 'Báo cáo thuế', description: 'Tạo báo cáo và biểu mẫu phục vụ hồ sơ thuế.', group: 'reference' },
  { id: 'tax-treaty', requirementId: 'CALC-31', title: 'Hiệp định thuế', description: 'Tra cứu hiệp định tránh đánh thuế hai lần.', group: 'reference' },
  { id: 'tax-deadline', requirementId: 'CALC-35', title: 'Deadline thuế', description: 'Theo dõi mốc việc cần làm theo chu kỳ thuế.', group: 'reference' },
  { id: 'tax-optimization-tips', requirementId: 'CALC-40', title: 'Mẹo tối ưu thuế', description: 'Tổng hợp các khuyến nghị giảm sai sót và tối ưu.', group: 'reference' },
];

export function getToolsByGroup(group: ToolGroup): ToolDefinition[] {
  return TOOL_REGISTRY.filter((tool) => tool.group === group);
}

export function getToolById(toolId: string): ToolDefinition | undefined {
  return TOOL_REGISTRY.find((tool) => tool.id === toolId);
}
