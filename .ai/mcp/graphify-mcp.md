# Graphify MCP Integration Guide

## 1. Giới thiệu
Graphify trích xuất cấu trúc mã nguồn thành Knowledge Graph với phát hiện god nodes, cấu trúc cộng đồng (community detection) và quan hệ liên file tại `graphify-out/`.

## 2. Công cụ khả dụng
- `query_graph`: Tìm kiếm thông tin kiến trúc trong đồ thị tri thức.
- `shortest_path`: Tìm đường dẫn quan hệ giữa 2 file hoặc symbol.
- `get_node`: Giải thích chi tiết một khái niệm hoặc module.

## 3. Lệnh cập nhật đồ thị
```bash
graphify update .
```
(Chạy cập nhật bằng AST cục bộ, hoàn toàn không tốn chi phí API).

