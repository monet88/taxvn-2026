# Requirements: TaxVN Mobile

**Defined:** 2026-03-31
**Core Value:** Người lao động Việt Nam tính thuế TNCN chính xác, nhanh chóng trên điện thoại — so sánh luật cũ/mới, lưu lịch sử, nhận nhắc deadline.

## v1 Requirements

Requirements cho bản phát hành đầu tiên. Mỗi requirement map đến roadmap phases.

### Foundation (Monorepo + Shared Logic)

- [ ] **FOUND-01**: Thiết lập monorepo Turborepo + pnpm (packages/tax-core, apps/api, apps/mobile)
- [ ] **FOUND-02**: Tách toàn bộ src/lib/*.ts thành package @taxvn/tax-core (pure TypeScript, zero React deps)
- [ ] **FOUND-03**: Viết golden-output test suite cho 10 core calculators đảm bảo kết quả khớp web
- [ ] **FOUND-04**: Sửa bug bracket inconsistency giữa incomeSummaryCalculator và taxCalculator

### Backend API

- [ ] **API-01**: Fastify server với tRPC router cho toàn bộ 40+ calculator endpoints
- [ ] **API-02**: PostgreSQL database với Prisma ORM cho user data và calculation history
- [ ] **API-03**: JWT authentication (register, login, refresh token, logout)
- [ ] **API-04**: Google OAuth integration
- [ ] **API-05**: API endpoint lưu calculation history (user + tool + input + result + timestamp)
- [ ] **API-06**: API endpoint truy vấn history (list, filter by tool, filter by date range, search)
- [ ] **API-07**: API endpoint xóa history (single + bulk delete)
- [ ] **API-08**: Push notification token registry (lưu FCM/APNs token per user per device)
- [ ] **API-09**: Remote push notification trigger cho law-change alerts

### Mobile Auth

- [ ] **AUTH-01**: User đăng ký bằng email/password
- [ ] **AUTH-02**: User đăng nhập bằng email/password
- [ ] **AUTH-03**: User đăng nhập bằng Google OAuth
- [ ] **AUTH-04**: Biometric auth (Face ID / Touch ID) sau khi đăng nhập lần đầu
- [ ] **AUTH-05**: User session persist across app restart
- [ ] **AUTH-06**: User đăng xuất từ bất kỳ màn hình nào

### Mobile Core UX

- [ ] **UX-01**: Navigation shell với tab groups tương tự web (Expo Router file-based routes)
- [ ] **UX-02**: Real-time recalculation khi user nhập — kết quả cập nhật không cần bấm nút
- [ ] **UX-03**: VND input formatting với numeric keyboard phù hợp
- [ ] **UX-04**: Input auto-save / draft persistence khi switch app hoặc bị gián đoạn
- [ ] **UX-05**: Native Share Sheet cho kết quả tính thuế (text + deep link)
- [ ] **UX-06**: Loading skeleton cho lazy-loaded calculator screens

### Mobile Calculators (40+ tools)

- [ ] **CALC-01**: Tính thuế TNCN so sánh 7 bậc vs 5 bậc (calculator)
- [ ] **CALC-02**: Quy đổi GROSS↔NET (gross-net)
- [ ] **CALC-03**: Lương tăng ca (overtime)
- [ ] **CALC-04**: Quyết toán thuế năm (annual-settlement)
- [ ] **CALC-05**: Tính thuế thưởng Tết (bonus-calculator)
- [ ] **CALC-06**: Tính thuế ESOP (esop-calculator)
- [ ] **CALC-07**: Thuế người nước ngoài (foreigner-tax)
- [ ] **CALC-08**: Thuế chứng khoán (securities)
- [ ] **CALC-09**: Thuế cho thuê tài sản (rental)
- [ ] **CALC-10**: Thuế hộ kinh doanh (household-business)
- [ ] **CALC-11**: Thuế chuyển nhượng BĐS (real-estate)
- [ ] **CALC-12**: Chi phí nhà tuyển dụng (employer-cost)
- [ ] **CALC-13**: So sánh Freelancer vs Fulltime (freelancer)
- [ ] **CALC-14**: So sánh salary offers (salary-compare)
- [ ] **CALC-15**: So sánh thuế theo năm (yearly)
- [ ] **CALC-16**: Dự tính lương hưu (pension)
- [ ] **CALC-17**: Chi tiết bảo hiểm (insurance)
- [ ] **CALC-18**: Thu nhập khác (other-income)
- [ ] **CALC-19**: Biểu thuế suất (table)
- [ ] **CALC-20**: Lịch sử luật thuế (tax-history)
- [ ] **CALC-21**: Lịch thuế (tax-calendar)
- [ ] **CALC-22**: Phiếu lương (salary-slip)
- [ ] **CALC-23**: Kiểm tra miễn thuế (exemption-checker)
- [ ] **CALC-24**: Tính tiền phạt chậm nộp (late-payment)
- [ ] **CALC-25**: So sánh hình thức kinh doanh (business-form)
- [ ] **CALC-26**: Trợ cấp thôi việc (severance)
- [ ] **CALC-27**: Tạo tờ khai thuế (tax-document)
- [ ] **CALC-28**: Tính thuế VAT (vat)
- [ ] **CALC-29**: Thuế khấu trừ tại nguồn (withholding-tax)
- [ ] **CALC-30**: Thu nhập đa nguồn (multi-source-income)
- [ ] **CALC-31**: Tra cứu hiệp định thuế (tax-treaty)
- [ ] **CALC-32**: Tối ưu thuế vợ chồng (couple-optimizer)
- [ ] **CALC-33**: Thuế content creator (content-creator)
- [ ] **CALC-34**: Thuế crypto (crypto-tax)
- [ ] **CALC-35**: Quản lý deadline thuế (tax-deadline)
- [ ] **CALC-36**: Dashboard tổng hợp thu nhập (income-summary)
- [ ] **CALC-37**: So sánh theo vùng (region-compare)
- [ ] **CALC-38**: Kế hoạch hàng tháng (monthly-planner)
- [ ] **CALC-39**: Tính thuế mua nhà (mua-nha)
- [ ] **CALC-40**: Mẹo tối ưu thuế (tax-optimization-tips)
- [ ] **CALC-41**: Mô phỏng kế hoạch thuế (tax-planning-simulator)
- [ ] **CALC-42**: Thuế thừa kế/quà tặng (inheritance-gift)

### Calculation History

- [ ] **HIST-01**: User xem danh sách lịch sử tính thuế (date, tool name, key input/output)
- [ ] **HIST-02**: User tap vào history item để restore full calculator state
- [ ] **HIST-03**: User tìm kiếm history theo tên tool hoặc mức thu nhập
- [ ] **HIST-04**: User lọc history theo loại tool và khoảng thời gian
- [ ] **HIST-05**: User xóa history (swipe-to-delete đơn lẻ + bulk delete)
- [ ] **HIST-06**: Auto-save kết quả tính thuế vào history khi user hoàn thành calculation

### Push Notifications

- [ ] **PUSH-01**: Local notification nhắc deadline thuế cố định (31/3, 30/4, quarterly)
- [ ] **PUSH-02**: Remote push notification cho thay đổi luật thuế
- [ ] **PUSH-03**: In-app notification settings (toggle từng category)
- [ ] **PUSH-04**: Permission request sau lần tính thuế đầu tiên (không phải first launch)

## v2 Requirements

Deferred cho release tương lai. Tracked nhưng không trong roadmap hiện tại.

### Offline & Sync

- **OFFL-01**: Tính thuế offline khi không có mạng
- **OFFL-02**: Sync history khi có mạng trở lại

### UI Enhancement

- **UIE-01**: Dark mode
- **UIE-02**: PDF export từ mobile (rebuild với react-native PDF lib)
- **UIE-03**: QR code sharing

### Monetization

- **MON-01**: Premium tier (advanced features)
- **MON-02**: Ad-supported free tier

## Out of Scope

| Feature | Reason |
|---------|--------|
| Tax filing / nộp tờ khai cho eTax | Rủi ro pháp lý, cần tích hợp Bộ Tài Chính |
| AI chatbot tư vấn thuế | Rủi ro hallucination trên số liệu pháp lý |
| Social benchmarking | Cần dữ liệu lớn, nhạy cảm privacy |
| Offline mode với conflict resolution | Phức tạp, defer v2 |
| Admin dashboard | v2 |
| Đa ngôn ngữ (English) | Chỉ tiếng Việt v1 |
| Web app song song | Deprecate web, tập trung mobile |
| Expense tracking / budgeting | Khác product category |
| In-app payments (v1) | Ưu tiên user acquisition |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 1 | Pending |
| FOUND-02 | Phase 1 | Pending |
| FOUND-03 | Phase 1 | Pending |
| FOUND-04 | Phase 1 | Pending |
| API-01 | Phase 2 | Pending |
| API-02 | Phase 2 | Pending |
| API-03 | Phase 2 | Pending |
| API-04 | Phase 2 | Pending |
| API-05 | Phase 2 | Pending |
| API-06 | Phase 2 | Pending |
| API-07 | Phase 2 | Pending |
| API-08 | Phase 2 | Pending |
| API-09 | Phase 2 | Pending |
| AUTH-01 | Phase 3 | Pending |
| AUTH-02 | Phase 3 | Pending |
| AUTH-03 | Phase 3 | Pending |
| AUTH-04 | Phase 3 | Pending |
| AUTH-05 | Phase 3 | Pending |
| AUTH-06 | Phase 3 | Pending |
| UX-01 | Phase 3 | Pending |
| UX-02 | Phase 4 | Pending |
| UX-03 | Phase 4 | Pending |
| UX-04 | Phase 4 | Pending |
| UX-05 | Phase 4 | Pending |
| UX-06 | Phase 4 | Pending |
| CALC-01 | Phase 4 | Pending |
| CALC-02 | Phase 4 | Pending |
| CALC-03 | Phase 4 | Pending |
| CALC-04 | Phase 4 | Pending |
| CALC-05 | Phase 4 | Pending |
| CALC-06 | Phase 4 | Pending |
| CALC-07 | Phase 4 | Pending |
| CALC-08 | Phase 4 | Pending |
| CALC-09 | Phase 4 | Pending |
| CALC-10 | Phase 4 | Pending |
| CALC-11 | Phase 4 | Pending |
| CALC-12 | Phase 4 | Pending |
| CALC-13 | Phase 4 | Pending |
| CALC-14 | Phase 4 | Pending |
| CALC-15 | Phase 4 | Pending |
| CALC-16 | Phase 4 | Pending |
| CALC-17 | Phase 4 | Pending |
| CALC-18 | Phase 4 | Pending |
| CALC-19 | Phase 4 | Pending |
| CALC-20 | Phase 4 | Pending |
| CALC-21 | Phase 4 | Pending |
| CALC-22 | Phase 4 | Pending |
| CALC-23 | Phase 4 | Pending |
| CALC-24 | Phase 4 | Pending |
| CALC-25 | Phase 4 | Pending |
| CALC-26 | Phase 4 | Pending |
| CALC-27 | Phase 4 | Pending |
| CALC-28 | Phase 4 | Pending |
| CALC-29 | Phase 4 | Pending |
| CALC-30 | Phase 4 | Pending |
| CALC-31 | Phase 4 | Pending |
| CALC-32 | Phase 4 | Pending |
| CALC-33 | Phase 4 | Pending |
| CALC-34 | Phase 4 | Pending |
| CALC-35 | Phase 4 | Pending |
| CALC-36 | Phase 4 | Pending |
| CALC-37 | Phase 4 | Pending |
| CALC-38 | Phase 4 | Pending |
| CALC-39 | Phase 4 | Pending |
| CALC-40 | Phase 4 | Pending |
| CALC-41 | Phase 4 | Pending |
| CALC-42 | Phase 4 | Pending |
| HIST-01 | Phase 5 | Pending |
| HIST-02 | Phase 5 | Pending |
| HIST-03 | Phase 5 | Pending |
| HIST-04 | Phase 5 | Pending |
| HIST-05 | Phase 5 | Pending |
| HIST-06 | Phase 5 | Pending |
| PUSH-01 | Phase 6 | Pending |
| PUSH-02 | Phase 6 | Pending |
| PUSH-03 | Phase 6 | Pending |
| PUSH-04 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 68 total
- Mapped to phases: 68
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-31*
*Last updated: 2026-03-31 after initial definition*
