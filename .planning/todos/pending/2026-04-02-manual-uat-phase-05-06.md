---
created: 2026-04-02T19:47:00Z
title: Manual UAT cho Phase 05 và 06
area: testing
files:
  - .planning/phases/05-calculation-history/05-UAT.md
  - .planning/phases/06-push-notifications/06-UAT.md
---

## Problem

Trong quy trình Milestone v1.0, các steps kiểm thử thực tế trên điện thoại/simulator đã bị bỏ qua (được đánh dấu là "defer all manual test, tôi sẽ test sau") để ép tiến độ tạo Report Verification vượt rào hoàn thành Milestone. Do đó, các Phase sau đang thiếu kiểm chứng vật lý thực tế:
- Phase 05: Tính năng Calculation History (Lưu tự động, hiển thị list, Multi-select, Restore)
- Phase 06: Push Notifications (Xin quyền, Schedule local deadline, Remote function law change push)

Nếu bỏ sót việc test, có thể ứng dụng chạy không ổn định trên nền tảng thực tế.

## Solution

Người dùng sẽ dành thời gian kiểm tra thử trên màn hình Simulator/Real Device cho 2 Phase trên:
- History: Thay đổi input, đợi 5 giây, kiểm tra màn Lịch sử, long-press xóa nhiều mục.
- Notifications: Kiểm tra logic cấp quyền, kiểm tra expo-notifications đã setup alarm hợp lệ chưa.
Sau khi test thủ công xong, nếu có lỗi thì tạo issue mới hoặc vào sửa trực tiếp source.
