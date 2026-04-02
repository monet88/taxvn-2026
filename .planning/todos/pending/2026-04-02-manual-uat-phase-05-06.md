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
- Màn hình History: Xem chi tiết test plan bên dưới.
- Notifications: Kiểm tra logic cấp quyền, kiểm tra expo-notifications đã setup alarm hợp lệ chưa.
Sau khi test thủ công xong, nếu có lỗi thì tạo issue mới hoặc vào sửa trực tiếp source.

### Detailed Phase 05 Human UAT Test Plan

**Group 1: Calculation History Workflow**
Prerequisites: Mobile app running locally on simulator/device with previous history entries.

1. **Auto-save calculation** (Phase 05)
   - Navigate to: Any calculator screen.
   - Do: Change some inputs and wait for at least 5 seconds.
   - Expected: Changes are automatically saved to local history after a 5-second debounce delay and appear in the History queue.

2. **History Tab Layout & Grouping** (Phase 05)
   - Navigate to: 'Lịch Sử' tab.
   - Do: Verify the layout and tap on filter tags ('Tất cả', 'Thuế TNCN', 'Bảo hiểm').
   - Expected: Calculation entries are grouped correctly ('Hôm nay', 'Hôm qua', 'Tuần trước', 'Cũ hơn'). Filters correctly limit the view to matching categories.

3. **Restore Calculation State** (Phase 05)
   - Navigate to: 'Lịch Sử' tab.
   - Do: Tap on any calculation history item.
   - Expected: The app navigates to the respective calculator tool and perfectly pre-fills all input values as they were when saved.

4. **Bulk Delete via Multi-select** (Phase 05)
   - Navigate to: 'Lịch Sử' tab.
   - Do: Long-press on an existing history item to trigger multi-select mode. Select multiple items and tap the 'Xóa' action.
   - Expected: The bottom action bar appears upon multi-select activation. Tapping 'Xóa' permanently deletes all selected items from the list visually and persistently.
