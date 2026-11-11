# Playwright MCP Integration Guide

## 1. Giới thiệu
Playwright MCP Server cho phép AI Agent tương tác trực tiếp với ứng dụng web JobNest đang chạy trên môi trường thực tế (`http://localhost:8080/`), phục vụ các mục đích:
- Kiểm thử E2E giao diện người dùng.
- Tự động điền biểu mẫu ứng tuyển, đăng ký, đăng nhập.
- Bắt lỗi console và kiểm tra mạng (network requests).
- Chụp ảnh màn hình kiểm toán giao diện.

## 2. Thư mục hoạt động
- Thư mục nhật ký và state: `.playwright-mcp/`
- Chứa:
  - `console-*.log`: Lưu vết toàn bộ console logs trong các phiên duyệt web.
  - `page-*.yml`: Trạng thái DOM và cấu trúc cây trang tại thời điểm kiểm tra.

## 3. Các công cụ khả dụng
- `browser_navigate`: Điều hướng đến URL mong muốn.
- `browser_click`: Nhấp chuột vào phần tử theo bộ chọn.
- `browser_fill_form`: Điền thông tin vào các trường input.
- `browser_take_screenshot`: Chụp ảnh màn hình.
- `browser_console_messages`: Đọc console errors/warnings.

