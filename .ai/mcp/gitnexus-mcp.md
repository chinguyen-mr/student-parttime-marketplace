# GitNexus MCP Integration Guide

## 1. Giới thiệu
GitNexus là công cụ xây dựng đồ thị tri thức mã nguồn (Code Intelligence Graph) với 380 symbols, 680 relationships và 2 execution flows trong repository JobNest.

## 2. Tài nguyên MCP (Resources)
- `gitnexus://repo/student-parttime-marketplace/context`: Tổng quan mã nguồn và độ tươi của chỉ mục.
- `gitnexus://repo/student-parttime-marketplace/clusters`: Toàn bộ các cụm tính năng nghiệp vụ.
- `gitnexus://repo/student-parttime-marketplace/processes`: Toàn bộ các luồng thực thi trong hệ thống.
- `gitnexus://repo/student-parttime-marketplace/process/{name}`: Vết thực thi từng bước (step-by-step trace).

## 3. Các công cụ MCP & CLI Fallback
- `impact`: Tính toán phạm vi ảnh hưởng (Blast radius).
  - CLI: `node .gitnexus/run.cjs impact "<symbol>" --direction upstream --repo .`
- `detect_changes`: Đánh giá thay đổi đồ thị trước khi commit.
  - CLI: `node .gitnexus/run.cjs detect-changes --scope all --repo .`
- `query`: Tìm kiếm khái niệm nghiệp vụ trong đồ thị.

