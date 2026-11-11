# Workflow: Code Change & Impact Analysis Pipeline (GitNexus)

## 1. Mục tiêu
Bảo đảm mọi thay đổi mã nguồn trong backend và frontend đều được tính toán phạm vi ảnh hưởng (Blast Radius), không làm đứt gãy luồng thực thi (execution flows) hoặc gây lỗi hồi quy.

## 2. Quy trình thực thi
1. **Bước 1 — Xác định Symbol cần thay đổi:**
   - Tên hàm, class, biến hoặc endpoint cần chỉnh sửa.
2. **Bước 2 — Chạy phân tích tác động đồ thị (Graph Impact Analysis):**
   ```bash
   node .gitnexus/run.cjs impact "<symbolName>" --direction upstream --repo .
   ```
3. **Bước 3 — Đánh giá mức độ rủi ro (Risk Verdict):**
   - **LOW:** Ít caller, thay đổi an toàn.
   - **HIGH / CRITICAL:** Nhiều caller hoặc thuộc luồng thực thi trọng yếu. Phải lập kế hoạch cập nhật toàn bộ callers liên quan.
   - **UNKNOWN:** Chưa phân giải được qua đồ thị. Bắt buộc kiểm tra thêm bằng tìm kiếm văn bản trước khi sửa.
4. **Bước 4 — Thực hiện sửa đổi phẫu thuật (Surgical Edit):**
   - Sửa đúng phần cần thiết, bảo tồn comments và logic xung quanh.
5. **Bước 5 — Kiểm tra thay đổi đồ thị:**
   ```bash
   node .gitnexus/run.cjs detect-changes --scope all --repo .
   ```
6. **Bước 6 — Chạy kiểm thử tự động:**
   ```bash
   cd 03_backend && npm test
   cd 04_frontend && npm run build
   ```

