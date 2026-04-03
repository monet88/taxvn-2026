# TaxVN Mobile

## What This Is

App tính thuế thu nhập cá nhân Việt Nam toàn diện — phiên bản mobile (React Native). Tax-core chạy trực tiếp trong mobile app (client-side primary calculation). Backend dùng Supabase (auth, PostgreSQL, Edge Functions) — không cần self-hosted server. Hỗ trợ đầy đủ Luật thuế TNCN 2026 (Luật 109/2025/QH15) với 40+ công cụ tính thuế chuyên biệt.

## Core Value

Người lao động Việt Nam có thể tính thuế TNCN chính xác, nhanh chóng trên điện thoại — so sánh luật cũ/mới, lưu lịch sử, nhận nhắc deadline thuế.

## Requirements

### Validated

<!-- Đã hoạt động trong web hiện tại và được port sang mobile trong v1.0 -->

- ✓ Tính thuế TNCN so sánh biểu thuế 7 bậc vs 5 bậc — v1.0
- ✓ Quy đổi GROSS↔NET bằng binary search — v1.0
- ✓ 40+ công cụ tính thuế chuyên biệt (OT, thưởng, ESOP, BĐS, chứng khoán, hộ KD, lương hưu...) — v1.0
- ✓ Chia sẻ kết quả qua URL/QR code — v1.0
- ✓ Xuất PDF báo cáo thuế — v1.0
- ✓ Tính toán date-aware (tự chọn biểu thuế/giảm trừ theo ngày) — v1.0
- ✓ Phụ cấp miễn thuế vs chịu thuế — v1.0
- ✓ Lương khai báo BH riêng biệt với lương thực — v1.0
- ✓ React Native mobile app (iOS + Android) — v1.0
- ✓ Supabase backend (Auth, PostgreSQL, Edge Functions) cho auth, history, push notification — v1.0
- ✓ Đăng nhập/Đăng ký (email + Google OAuth) — v1.0
- ✓ Lưu lịch sử tính thuế theo tài khoản — v1.0
- ✓ Push notification nhắc deadline thuế và thay đổi luật — v1.0

### Active

*(Chuẩn bị lên kế hoạch cho v1.1 hoặc v2.0)*

### Out of Scope

- Web app hiện tại thuộc bên thứ ba — build independent product
- Full offline mode with sync — v2 (client-side calculation hoạt động offline sẵn)
- Dark mode — v2
- Đa ngôn ngữ (i18n) — chỉ tiếng Việt trong v1.0
- Admin dashboard — v2

## Context

- Codebase hiện tại là Next.js 16 static export, hoàn toàn client-side, không có backend
- Business logic đã tách biệt hoàn toàn trong `src/lib/` (40+ TypeScript modules, 2 non-pure imports cần fix) — extract thành @taxvn/tax-core, chạy trực tiếp trong mobile
- State management hiện tại dùng props drilling từ một page.tsx duy nhất — cần thiết kế lại cho mobile
- Snapshot codec (lz-string) hiện dùng cho URL sharing — cần migration strategy
- PWA đã có nhưng sẽ thay bằng native app
- Deploy hiện tại qua GitHub Pages (branch master)

## Constraints

- **Tech stack**: React Native (Expo hoặc bare) + Supabase (Auth, PostgreSQL, Edge Functions)
- **Cost**: Free tier đủ cho MVP — 500MB DB, 50K MAU, unlimited API requests
- **Platform**: iOS + Android đồng thời
- **Reuse**: Logic tính thuế từ `src/lib/` phải reuse, không viết lại
- **Chính xác**: Kết quả tính thuế phải khớp 100% với web hiện tại
- **Luật pháp**: Phải tuân thủ Luật Thuế TNCN sửa đổi 2025 (Luật 109/2025/QH15)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Build independent mobile product | Web không thuộc sở hữu founder, cần product riêng | ✓ Approved |
| Port toàn bộ 40+ tools trong v1 | Không muốn mất feature khi migrate | ✓ Approved |
| Client-side primary calculation | tax-core chạy trong mobile, backend chỉ auth+history+push. Loại bỏ SPOF, giảm latency, offline-ready | ✓ Approved (CEO review) |
| Supabase thay Fastify+tRPC+Prisma | Free tier đủ MVP, built-in auth (email+Google), RLS, Edge Functions — giảm 80% backend code | ✓ Approved |
| PostgreSQL (via Supabase) | ACID cho financial data, relational model phù hợp tax history schema, Supabase hosts free | ✓ Approved |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-02 after Phase 04 completion*
