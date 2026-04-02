# Phase 06: Push Notifications - Context

**Gathered:** 2026-04-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Users receive timely reminders about tax deadlines and law changes, with granular control over which categories they want — the app stays useful between active sessions.

</domain>

<decisions>
## Implementation Decisions

### Delivery & Trigger Strategy
- Dịch vụ gửi Push Notification: FCM v1 qua Firebase Admin — Hoàn toàn miễn phí, không bị giới hạn quota.
- Xử lý Local Deadlines (PUSH-01): Cron job gọi từ backend Supabase (pg_cron) — Quản lý tập trung logic push notification tại server.
- Xử lý nhắc Law Changes (PUSH-02): Supabase DB trigger tự động — Database trigger gọi webhook/Edge Function ngay khi có chèn dòng luật mới.

### Preference Synchronization
- Lưu trữ Notification Settings (PUSH-03): Vừa local (Zustand/AsyncStorage) vừa sync backend (bảng database) — Cần có setting trên backend để pg_cron filter chính xác ai muốn nhận nhắc nhở nào.
- Quản lý Push Token (API-08): Bảng `push_tokens` riêng có deduplication theo device_id — Tránh gửi trùng lặp nếu user đăng nhập nhiều lần hoặc đổi app account trên một máy.

### Permission Flow
- Thời điểm xin quyền Push Notification (PUSH-04): Sau khi có kết quả tính thuế lần đầu tiên — Kèm theo UI giải thích bật thông báo để được nhắc deadline.
- Xử lý khi user chặn quyền từ hệ điều hành (OS): Soft-prompt banner trong màn Cài đặt — Nếu phát hiện auth off, hiện gợi ý có chứa link bấm mở thẳng màn hình System Settings.

### the agent's Discretion
None

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- Supabase client & edge functions setup from Phase 2
- Existing Zustand stores and local storage patterns from Phase 4

### Established Patterns
- Supabase JWT tracking, persistent auth state
- Supabase triggers / pg_cron via Supabase Dashboard / SQL

### Integration Points
- Calculator Result screens (to trigger permission prompt)
- Settings tab (to show toggles for notification categories)

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>
