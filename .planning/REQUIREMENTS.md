# Requirements: TaxVN Mobile

**Defined:** 2026-03-31
**Core Value:** Người lao động Việt Nam tính thuế TNCN chính xác, nhanh chóng trên điện thoại — so sánh luật cũ/mới, lưu lịch sử, nhận nhắc deadline.

## v1 Requirements

Requirements cho bản phát hành đầu tiên. Mỗi requirement map đến roadmap phases.

### Foundation (Monorepo + Shared Logic)

- [x] **FOUND-01**: Thiết lập monorepo Turborepo + pnpm (packages/tax-core, apps/api, apps/mobile)
- [x] **FOUND-02**: Tách src/lib/*.ts thành packages — phân loại 3 tầng:
  - `packages/tax-core`: Pure deterministic calculators (~30 modules: taxCalculator, grossNetCalculator, esopCalculator, securitiesTaxCalculator, realEstateTransferTaxCalculator, bonusCalculator, foreignerTaxCalculator, overtimeCalculator, annualSettlementCalculator, pensionCalculator, householdBusinessTaxCalculator, rentalIncomeTaxCalculator, contentCreatorTaxCalculator, cryptoTaxCalculator, coupleTaxOptimizer, multiSourceIncomeCalculator, freelancerCalculator, salaryComparisonCalculator, employerCostCalculator, withholdingTaxCalculator, vatCalculator, severanceCalculator, latePaymentCalculator, inheritanceGiftTaxCalculator, businessFormComparisonCalculator, mortgageCalculator, monthlyPlannerCalculator, taxPlanningSimulator, incomeSummaryCalculator, yearlyTaxCalculator)
  - `packages/tax-data`: Static reference data (taxLawHistory, taxTreatyData, taxExemptionChecker, taxDeadlineManager, pensionConstants)
  - Mobile-only: Rendering/content features (salarySlip PDF, taxDocumentGenerator, taxOptimizationTips — stay in apps/mobile)
- [x] **FOUND-03**: Viết golden-output test suite cho TẤT CẢ 40+ calculators (Vitest) — mỗi calculator ít nhất 3 cases (happy path + boundary + edge), ~120+ test cases total
- [x] **FOUND-04**: Sửa bug bracket inconsistency giữa incomeSummaryCalculator và taxCalculator
- [x] **FOUND-05**: Relocate `MAX_MONTHLY_INCOME` từ `@/utils/inputSanitizers` vào tax-core (grossNetCalculator.ts import non-pure dependency)
- [x] **FOUND-06**: Normalize `isSecondHalf2026` flag — xóa flag, hardcode new-law deductions cho toàn năm 2026 (7 files: taxDocumentGenerator, multiSourceIncomeCalculator, foreignerTaxCalculator, snapshotTypes + 3 components)
- [x] **FOUND-07**: Fix `inheritanceGiftTaxCalculator.ts` import `formatNumber` qua `@/lib/taxCalculator` path alias — cần relative import hoặc inline utility trong tax-core

### Backend API

- [x] **API-01**: Fastify server với tRPC router cho auth + history + push + share (KHÔNG có calculator endpoints — tax-core chạy client-side trong mobile)
- [x] **API-02**: PostgreSQL database với Prisma ORM — schema draft:
  - `users` (id, email, password_hash, name, google_id?, created_at, updated_at)
  - `sessions` (id, user_id FK, refresh_token_hash, device_info, expires_at, created_at)
  - `calculation_history` (id, user_id FK, tool_name, input_json, result_json, snapshot_version INT, tax_core_version STRING, created_at)
  - `share_snapshots` (id, token UNIQUE 8-char, snapshot_json, snapshot_version INT, tax_core_version STRING, created_by FK?, expires_at, created_at)
  - `push_tokens` (id, user_id FK, token, platform enum(ios/android), created_at, updated_at)
- [x] **API-03**: JWT authentication — access token 15 min, refresh token 7 days w/ rotation, expo-secure-store, blacklist on logout, bcrypt password hashing
- [ ] **API-04**: Google OAuth integration
- [x] **API-05**: API endpoint lưu calculation history (user + tool + input + result + timestamp)
- [x] **API-06**: API endpoint truy vấn history (list, filter by tool, filter by date range, search)
- [x] **API-07**: API endpoint xóa history (single + bulk delete)
- [x] **API-08**: Push notification token registry (lưu FCM/APNs token per user per device)
- [x] **API-09**: Remote push notification trigger cho law-change alerts
- [x] **API-10**: Share snapshot endpoint — POST snapshot → return 8-char token, GET token → return snapshot
- [x] **API-11**: Tax-core version gate — minimum version + effective date endpoint. If outdated past effective date → block calculator. Remote feature flags to disable specific calculators on bug discovery
- [x] **API-12**: Error contract — define tRPC error codes (AUTH_EXPIRED, RATE_LIMITED, HISTORY_NOT_FOUND, SHARE_NOT_FOUND, SERVER_ERROR) with mobile handling spec

### Mobile Auth

- [ ] **AUTH-00**: Login-optional architecture — calculators work without auth. Login prompted only when user taps Save History or Share. Tài khoản tab shows login CTA if not authenticated.
- [x] **AUTH-01**: User đăng ký bằng email/password - Done 2026-04-01
- [x] **AUTH-02**: User đăng nhập bằng email/password - Done 2026-04-01
- [x] **AUTH-03**: User đăng nhập bằng Google OAuth - Pending (UI drafted)
- [x] **AUTH-04**: Biometric auth (Face ID / Touch ID) sau khi đăng nhập lần đầu - Done 2026-04-01
- [x] **AUTH-05**: User session persist across app restart - Done 2026-04-01
- [x] **AUTH-06**: User đăng xuất từ bất kỳ màn hình nào - Done 2026-04-01

### Mobile Core UX

- [x] **UX-01**: Navigation shell — 4 bottom tabs - Done 2026-04-01
- [x] **UX-09**: Design tokens (NativeWind/Tailwind) - Done 2026-04-01
  - Colors: primary `#1a1a1a` (text), accent `#059669` (emerald-600, savings/positive), error `#dc2626` (red-600), background `#ffffff`, surface `#f9fafb` (gray-50), border `#e5e7eb` (gray-200)
  - Type scale: xs 12px, sm 14px, base 16px, lg 18px, xl 24px, 2xl 32px (income input)
  - Spacing: 4/8/12/16/24/32/48px (Tailwind default)
  - Border radius: sm 6px (inputs), md 12px (cards), lg 16px (modals)
  - Touch targets: minimum 44x44px per Apple HIG
  - Font: System default (SF Pro on iOS, Roboto on Android) — Vietnamese diacritics support
- [ ] **UX-02**: Real-time recalculation khi user nhập — kết quả cập nhật không cần bấm nút
- [x] **UX-10**: Accessibility baseline - Done 2026-04-01
- [ ] **UX-03**: VND input formatting với numeric keyboard phù hợp
- [ ] **UX-04**: Input auto-save / draft persistence khi switch app hoặc bị gián đoạn
- [ ] **UX-05**: Native Share Sheet cho kết quả tính thuế (text + deep link)
- [x] **UX-07**: Deep link handler - Done 2026-04-01
- [x] **UX-08**: Tax-core version check on open - Done 2026-04-01
- [ ] **UX-06**: Interaction states for all screens:
  - Calculator: skeleton shimmer while loading, placeholder "25,000,000 ₫" in empty input, red border + "Số không hợp lệ" on error, green savings row pulse on success
  - History: skeleton rows loading, illustration + "Chưa có lịch sử" empty state with CTA, retry button on error
  - Auth: button spinner on loading, inline error messages, toast on success
  - Share: "Đang tạo link..." loading, retry on error, native share sheet on success
  - Version: silent check on open, banner "Cập nhật bảng thuế mới" if outdated
- [x] **UX-07**: Deep link handler — nhận share token URL, load calculator state từ API
- [x] **UX-08**: Tax-core version check on app open — show banner "Cập nhật bảng thuế mới" nếu outdated, distinguish OTA (JS) vs App Store (native) updates
- [ ] **UX-11**: Design decisions resolved:
  - VND format: dấu chấm ngăn cách hàng nghìn (25.000.000 ₫) per vi-VN locale
  - Calculator layout: scrollable single page (inputs top → results below), results always visible without button
  - History card: tool icon + tool name + gross income + tax total + date
  - Icons: SF Symbols (iOS) / Material Icons (Android), no emoji in production
  - Haptic: light impact feedback on calculation complete (iOS only)

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
- [ ] **HIST-07**: Retry queue cho history save — nếu save fail, queue vào AsyncStorage, show subtle indicator, retry on reconnect

### Push Notifications

- [ ] **PUSH-01**: Local notification nhắc deadline thuế cố định (31/3, 30/4, quarterly)
- [ ] **PUSH-02**: Remote push notification cho thay đổi luật thuế
- [ ] **PUSH-03**: In-app notification settings (toggle từng category)
- [ ] **PUSH-04**: Permission request sau lần tính thuế đầu tiên (không phải first launch)

### Security & Compliance

- [ ] **SEC-01**: Login rate limiting (max 5 attempts/15 min per IP, exponential backoff)
- [x] **SEC-02**: PDPD compliance — privacy policy, data handling disclosure, consent flow cho salary/income PII (Vietnamese Personal Data Protection Decree)
- [x] **SEC-03**: App Store preparation — Done 2026-04-01

### Observability

- [x] **OBS-01**: Structured logging cho API (request/response, auth events, errors)
- [x] **OBS-02**: Health check endpoint (`/health`) for monitoring
- [x] **OBS-03**: Client-side crash reporting (Sentry) — Done 2026-04-01
- [x] **OBS-04**: Calculator usage analytics — Done 2026-04-01

## v2 Requirements

Deferred cho release tương lai. Tracked nhưng không trong roadmap hiện tại.

### Offline & Sync

Note: Client-side calculation works offline by default in v1. What's deferred to v2:
- **OFFL-01**: Offline history sync — queue saves locally, sync when reconnected (HIST-07 handles basic retry)
- **OFFL-02**: Offline auth — allow limited app use without login (currently requires auth for all features)

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
| FOUND-01 | Phase 3.1 | Complete |
| FOUND-02 | Phase 3.1 | Complete |
| FOUND-03 | Phase 3.1 | Complete |
| FOUND-04 | Phase 3.1 | Complete |
| FOUND-05 | Phase 3.1 | Complete |
| FOUND-06 | Phase 3.1 | Complete |
| FOUND-07 | Phase 3.1 | Complete |
| API-01 | Phase 2 | Complete |
| API-02 | Phase 2 | Complete |
| API-03 | Phase 2 | Complete |
| API-04 | Phase 3.2 | Pending |
| API-05 | Phase 2 | Complete |
| API-06 | Phase 2 | Complete |
| API-07 | Phase 2 | Complete |
| API-08 | Phase 2 | Complete |
| API-09 | Phase 2 | Complete |
| API-10 | Phase 2 | Complete |
| API-11 | Phase 2 | Complete |
| API-12 | Phase 2 | Complete |
| AUTH-01 | Phase 3.1 | Complete |
| AUTH-02 | Phase 3.1 | Complete |
| AUTH-03 | Phase 3.1 | Complete |
| AUTH-04 | Phase 3.1 | Complete |
| AUTH-05 | Phase 3.1 | Complete |
| AUTH-06 | Phase 3.1 | Complete |
| UX-01 | Phase 3.1 | Complete |
| UX-02 | Phase 4 | Pending |
| UX-03 | Phase 4 | Pending |
| UX-04 | Phase 4 | Pending |
| UX-05 | Phase 4 | Pending |
| UX-06 | Phase 4 | Pending |
| UX-07 | Phase 3.1 | Complete |
| UX-08 | Phase 3.1 | Complete |
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
| HIST-07 | Phase 5 | Pending |
| PUSH-01 | Phase 6 | Pending |
| PUSH-02 | Phase 6 | Pending |
| PUSH-03 | Phase 6 | Pending |
| PUSH-04 | Phase 6 | Pending |
| SEC-01 | Phase 3.2 | Pending |
| SEC-02 | Phase 2 | Complete |
| SEC-03 | Phase 3.1 | Complete |
| OBS-01 | Phase 2 | Complete |
| OBS-02 | Phase 2 | Complete |
| OBS-03 | Phase 3.1 | Complete |
| OBS-04 | Phase 3.1 | Complete |

**Coverage:**
- v1 requirements: 86 total
- Mapped to phases: 84
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-31*
*Last updated: 2026-04-01 after eng review — architecture revised, 86 requirements, 3-tier package classification*
