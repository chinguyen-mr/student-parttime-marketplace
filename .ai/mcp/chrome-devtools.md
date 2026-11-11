# Chrome DevTools MCP Integration Guide

## 1. Giới thiệu
Chrome DevTools MCP kết nối trực tiếp với giao thức Chrome DevTools Protocol (CDP), mang lại khả năng phân tích kỹ thuật sâu về hiệu năng, styling và tương tác trình duyệt.

## 2. Các công cụ chính
- `lighthouse_audit`: Đánh giá hiệu năng, Accessibility, Best Practices và SEO.
- `get_css_styles`: Trích xuất thông số CSS thực tế của phần tử để xác minh độ tương phản và màu sắc Soft Lavender/Peach.
- `performance_start_trace` & `performance_stop_trace`: Ghi lại timeline render và phát hiện giật lag.
- `take_heapsnapshot`: Kiểm tra rò rỉ bộ nhớ phía frontend.

