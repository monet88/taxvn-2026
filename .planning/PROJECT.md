# TaxVN Mobile

## What This Is

App tính thuế thu nhập cá nhân Việt Nam toàn diện — phiên bản mobile (React Native) thay thế web hiện tại. Backend Node.js cung cấp API, xác thực người dùng, và lưu trữ dữ liệu. Hỗ trợ đầy đủ Luật thuế TNCN 2026 (Luật 109/2025/QH15) với 40+ công cụ tính thuế chuyên biệt.

## Core Value

Người lao động Việt Nam có thể tính thuế TNCN chính xác, nhanh chóng trên điện thoại — so sánh luật cũ/mới, lưu lịch sử, nhận nhắc deadline thuế.

## Requirements

### Validated

<!-- Đã hoạt động trong web hiện tại — port sang mobile -->

- ✓ Tính thuế TNCN so sánh biểu thuế 7 bậc vs 5 bậc — existing web
- ✓ Quy đổi GROSS↔NET bằng binary search — existing web
- ✓ 40+ công cụ tính thuế chuyên biệt (OT, thưởng, ESOP, BĐS, chứng khoán, hộ KD, lương hưu...) — existing web
- ✓ Chia sẻ kết quả qua URL/QR code — existing web
- ✓ Xuất PDF báo cáo thuế — existing web
- ✓ Tính toán date-aware (tự chọn biểu thuế/giảm trừ theo ngày) — existing web
- ✓ Phụ cấp miễn thuế vs chịu thuế — existing web
- ✓ Lương khai báo BH riêng biệt với lương thực — existing web

### Active

- [ ] React Native mobile app (iOS + Android)
- [ ] Node.js backend API cho toàn bộ logic tính thuế
- [ ] Đăng nhập/Đăng ký (email + Google OAuth)
- [ ] Lưu lịch sử tính thuế theo tài khoản
- [ ] Push notification nhắc deadline thuế và thay đổi luật
- [ ] Port toàn bộ 40+ công cụ tính thuế sang mobile UI

### Out of Scope

- Web app hiện tại sẽ deprecate — không duy trì song song
- Offline mode — v2
- Dark mode — v2
- Đa ngôn ngữ (i18n) — chỉ tiếng Việt trong v1
- Admin dashboard — v2

## Context

- Codebase hiện tại là Next.js 16 static export, hoàn toàn client-side, không có backend
- Business logic đã tách biệt hoàn toàn trong `src/lib/` (40+ pure TypeScript modules) — có thể reuse cho backend
- State management hiện tại dùng props drilling từ một page.tsx duy nhất — cần thiết kế lại cho mobile
- Snapshot codec (lz-string) hiện dùng cho URL sharing — cần migration strategy
- PWA đã có nhưng sẽ thay bằng native app
- Deploy hiện tại qua GitHub Pages (branch master)

## Constraints

- **Tech stack**: React Native (Expo hoặc bare) + Node.js backend
- **Platform**: iOS + Android đồng thời
- **Reuse**: Logic tính thuế từ `src/lib/` phải reuse, không viết lại
- **Chính xác**: Kết quả tính thuế phải khớp 100% với web hiện tại
- **Luật pháp**: Phải tuân thủ Luật Thuế TNCN sửa đổi 2025 (Luật 109/2025/QH15)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Thay thế web thay vì chạy song song | Tập trung resource vào một platform | — Pending |
| Port toàn bộ 40+ tools trong v1 | Không muốn mất feature khi migrate | — Pending |
| Node.js backend với API + Auth + DB | Cần lưu lịch sử và push notification | — Pending |
| Database: để research quyết định | Chưa xác định PostgreSQL vs MongoDB | — Pending |

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
*Last updated: 2026-03-31 after initialization*
