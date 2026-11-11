# Workflow: UI/UX Audit & Refactoring Pipeline

## 1. Mục tiêu
Đảm bảo giao diện người dùng đạt tiêu chuẩn cao nhất về thẩm mỹ, tính nhất quán, tuân thủ bảng màu **Soft Lavender (`#7565A8`)** & **Warm Peach (`#F4B99D`)**, loại bỏ 100% rò rỉ mã phát triển và AI visual slop.

## 2. Các bước thực hiện
1. **Kiểm kê trực quan:** Thu thập ảnh chụp màn hình thực tế hoặc rà soát mã nguồn React JSX.
2. **Đối chiếu Wireframe & Design System:**
   - Đối chiếu với tài liệu `DESIGN.md`, `PRODUCT.md` và Wireframe chuẩn.
   - Kiểm tra 4 trạng thái giao diện bắt buộc (Loading skeleton, Empty state, Error alert, Success confirmation).
   - Kiểm tra độ tương phản WCAG 2.1 AA và kích thước touch target.
3. **Thực thi tinh chỉnh (Refactoring):**
   - Loại bỏ toàn bộ nhãn `WF-xxx`, hộp ghi chú `Trạng thái UI / TBD`, mã lỗi kỹ thuật.
   - Thống nhất các component dùng chung: `StatusBadge`, `AnimatedToast`, `EmptyState`, `JobListSkeleton`.
4. **Kiểm tra biên dịch & Triển khai:**
   - Chạy `npm run build` trong `04_frontend`.
   - Đồng bộ bản build vào container Nginx (`jobnest-frontend`).
5. **Lập báo cáo đối chiếu:** Ghi nhận bảng trước/sau trong `docs/ui-audit/`.

