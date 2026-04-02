import * as fs from 'fs';
import * as path from 'path';

// Tests UX-01: xác minh 4 tab navigation đúng spec
// Dùng source-parse thay vì React render vì NativeWind's wrap-jsx intercept
// Tabs.Screen ở tầng JSX transform bên trong layout file, không thể mock sạch trong Jest.

describe('Navigation (UX-01)', () => {
  // Đọc source file một lần cho cả suite
  const layoutSrc = fs.readFileSync(
    path.resolve(__dirname, '../app/(tabs)/_layout.tsx'),
    'utf-8'
  );
  const toolListScreenSrc = fs.readFileSync(
    path.resolve(__dirname, '../components/ToolListScreen.tsx'),
    'utf-8'
  );

  it('định nghĩa đúng 4 tab route theo spec UX-01', () => {
    expect(layoutSrc).toContain('name="index"');      // Tính Thuế
    expect(layoutSrc).toContain('name="so-sanh"');    // So Sánh
    expect(layoutSrc).toContain('name="tham-khao"');  // Tham Khảo
    expect(layoutSrc).toContain('name="tai-khoan"');  // Tài Khoản
  });

  it('mỗi tab có title tiếng Việt đúng theo spec', () => {
    expect(layoutSrc).toContain("'Tính Thuế'");
    expect(layoutSrc).toContain("'So Sánh'");
    expect(layoutSrc).toContain("'Tham Khảo'");
    expect(layoutSrc).toContain("'Tài Khoản'");
  });

  it('khai báo route detail cho calculator tool nhưng ẩn khỏi tab bar', () => {
    expect(layoutSrc).toContain('name="tools/[slug]"');
    expect(layoutSrc).toContain('href: null');
  });

  it('ToolListScreen tạo link điều hướng tới route detail theo slug', () => {
    expect(toolListScreenSrc).toContain('Link');
    expect(toolListScreenSrc).toContain("pathname: '/tools/[slug]'");
    expect(toolListScreenSrc).toContain('tool.id');
  });
});
